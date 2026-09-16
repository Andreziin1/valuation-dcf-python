from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator, model_validator

from valuation import calcular_valuation


app = FastAPI(
    title="FinSight API",
    description="API para cálculo de valuation pelo método DCF",
    version="1.0.0",
)


# CORS para desenvolvimento local
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class DadosValuation(BaseModel):
    nome_empresa: str = Field(
        min_length=2,
        max_length=70
    )

    fcf_inicial: float = Field(
        gt=0,
        le=100_000_000_000
    )

    crescimento: float = Field(
        ge=-0.50,
        le=1.50
    )

    taxa_desconto: float = Field(
        gt=0.001,
        le=0.60
    )

    anos_projecao: int = Field(
        ge=1,
        le=25
    )

    crescimento_perpetuo: float = Field(
        ge=0,
        le=0.12
    )

    divida: float = Field(
        ge=0
    )

    caixa: float = Field(
        ge=0
    )

    quantidade_acoes: int = Field(
        gt=0
    )

    @field_validator("nome_empresa")
    @classmethod
    def validar_nome_empresa(cls, valor: str) -> str:
        valor = valor.strip()

        if len(valor) < 2:
            raise ValueError(
                "O nome da empresa deve possuir pelo menos 2 caracteres."
            )

        return valor

    @model_validator(mode="after")
    def validar_taxas(self):
        if self.crescimento_perpetuo >= self.taxa_desconto:
            raise ValueError(
                "O crescimento perpétuo deve ser menor que a taxa de desconto (WACC)."
            )

        return self


@app.get("/")
def home():
    return {
        "mensagem": "API de valuation online",
        "status": "online"
    }


@app.post("/calcular-valuation")
def calcular(dados: DadosValuation):
    resultado = calcular_valuation(
        fcf_inicial=dados.fcf_inicial,
        crescimento=dados.crescimento,
        taxa_desconto=dados.taxa_desconto,
        anos_projecao=dados.anos_projecao,
        crescimento_perpetuo=dados.crescimento_perpetuo,
        divida=dados.divida,
        caixa=dados.caixa,
        quantidade_acoes=dados.quantidade_acoes
    )

    return {
        "empresa": dados.nome_empresa,
        "valuation_total": resultado["valor_empresa"],
        "valor_justo_acao": resultado["valor_justo_acao"],
        "valor_terminal": resultado["valor_terminal"],
        "valor_terminal_presente": resultado["valor_terminal_presente"],
        "fluxos_projetados": resultado["fluxos"],
        "mensagem": "Valuation calculado com sucesso"
    }