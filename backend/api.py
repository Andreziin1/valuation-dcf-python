"""API local e Vercel. As fórmulas DCF permanecem em valuation.py."""
import asyncio
import math
import os
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Query
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

if __package__:
    from .bolsa import buscar_dados_bolsa, pesquisar_empresas
    from .valuation import calcular_valuation
    from .utils import gerar_cenarios
else:
    from bolsa import buscar_dados_bolsa, pesquisar_empresas
    from valuation import calcular_valuation
    from utils import gerar_cenarios

app = FastAPI(title="NexoDCF API", version="2.0.0", docs_url="/api/docs", openapi_url="/api/openapi.json")
app.add_middleware(
    CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"], allow_headers=["Content-Type"],
)


@app.middleware("http")
async def cabecalhos(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


@app.exception_handler(RequestValidationError)
async def erro_validacao(request, exc):
    # Não devolvemos os dados financeiros enviados nem objetos internos de erro.
    erros = [{"campo": str(e["loc"][-1]), "mensagem": e["msg"].replace("Value error, ", "")} for e in exc.errors()]
    return JSONResponse(status_code=422, content={"detail": "Revise os campos informados.", "erros": erros})


class DadosValuation(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False, extra="forbid")
    nome_empresa: str = Field(min_length=2, max_length=160)
    fcf_inicial: float = Field(gt=0, le=1e16)
    crescimento: float = Field(ge=-0.50, le=1.50)
    taxa_desconto: float = Field(gt=0.001, le=0.60)
    anos_projecao: int = Field(ge=1, le=25)
    crescimento_perpetuo: float = Field(ge=0, le=0.12)
    divida: float = Field(ge=0, le=1e16)
    caixa: float = Field(ge=0, le=1e16)
    quantidade_acoes: int = Field(gt=0, le=9_007_199_254_740_991)
    preco_atual: float | None = Field(default=None, gt=0, le=1e16)
    modelo_confirmado: bool = False

    @field_validator("nome_empresa")
    @classmethod
    def validar_nome(cls, value):
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Informe o nome da empresa.")
        return value

    @model_validator(mode="after")
    def validar_premissas(self):
        if self.crescimento_perpetuo >= self.taxa_desconto:
            raise ValueError("O crescimento perpétuo deve ser menor que a taxa de desconto.")
        if not self.modelo_confirmado:
            raise ValueError("Confirme a revisão do fluxo de caixa e das premissas antes de calcular.")
        return self


def mercado_habilitado():
    # Uso público requer confirmação dos direitos sobre os dados do fornecedor.
    default = "false" if os.getenv("VERCEL") else "true"
    return os.getenv("ENABLE_MARKET_DATA", default).lower() == "true"


@app.get("/")
@app.get("/api/health")
def home():
    return {"status": "online", "market_data_enabled": mercado_habilitado(), "version": "2.0.0"}


async def consultar(funcao, argumento):
    if not mercado_habilitado():
        raise HTTPException(503, "Consulta automática indisponível nesta instalação. Use o modo manual. O responsável precisa validar os direitos de uso dos dados.")
    try:
        return await asyncio.wait_for(asyncio.to_thread(funcao, argumento), timeout=22)
    except ValueError as error:
        raise HTTPException(422, str(error)) from error
    except LookupError as error:
        raise HTTPException(404, str(error)) from error
    except TimeoutError as error:
        raise HTTPException(504, "O fornecedor demorou para responder. Tente novamente mais tarde.") from error
    except Exception as error:
        raise HTTPException(502, "O fornecedor de dados está indisponível ou limitou a consulta. Tente novamente mais tarde; nenhum dado foi inventado.") from error


@app.get("/api/empresas")
async def pesquisar(q: str = Query(min_length=2, max_length=80)):
    return {"empresas": await consultar(pesquisar_empresas, q)}


@app.get("/empresa/{ticker}", include_in_schema=False)
@app.get("/api/empresa/{ticker}")
async def empresa(ticker: str):
    return await consultar(buscar_dados_bolsa, ticker)


@app.post("/calcular-valuation", include_in_schema=False)
@app.post("/api/calcular-valuation")
def calcular(dados: DadosValuation):
    argumentos = dados.model_dump(exclude={"nome_empresa", "preco_atual", "modelo_confirmado"})
    resultado = calcular_valuation(**argumentos)
    cenarios = {}
    for nome, crescimento in gerar_cenarios(dados.crescimento).items():
        cenarios[nome] = calcular_valuation(**{**argumentos, "crescimento": crescimento})["valor_justo_acao"]

    valor = resultado["valor_justo_acao"]
    if not all(math.isfinite(v) for v in [valor, resultado["valor_empresa"], *cenarios.values()]):
        raise HTTPException(422, "As premissas produziram valores fora do limite numérico. Revise as taxas.")
    positivo = valor > 0
    comparavel = positivo and dados.preco_atual is not None
    diferenca = (valor / dados.preco_atual - 1) * 100 if comparavel else None
    margem = (valor - dados.preco_atual) / valor if comparavel else None
    avisos = []
    if not positivo:
        avisos.append("As premissas não produziram valor positivo para os acionistas. Não há preço-alvo utilizável nesta análise.")
    ev = sum(f["valor_presente"] for f in resultado["fluxos"]) + resultado["valor_terminal_presente"]
    return {
        "empresa": dados.nome_empresa, "preco_atual": dados.preco_atual,
        "valuation_total": resultado["valor_empresa"], "valor_operacional": ev,
        "valor_justo_acao": valor, "estimativa_positiva": positivo,
        "valor_terminal": resultado["valor_terminal"],
        "valor_terminal_presente": resultado["valor_terminal_presente"],
        "participacao_terminal": resultado["valor_terminal_presente"] / ev if ev > 0 else None,
        "fluxos_projetados": resultado["fluxos"], "cenarios": cenarios,
        "potencial_valorizacao": diferenca, "margem_seguranca": margem,
        "premissas": dados.model_dump(), "avisos": avisos,
        "calculado_em": datetime.now(timezone.utc).isoformat(),
    }
