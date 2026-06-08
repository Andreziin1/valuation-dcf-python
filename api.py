from fastapi import FastAPI
from pydantic import BaseModel
from valuation import calcular_valuation

app = FastAPI()


class DadosValuation(BaseModel):
    nome_empresa: str
    fcf_inicial: float
    crescimento: float
    taxa_desconto: float
    anos_projecao: int
    crescimento_perpetuo: float
    divida: float
    caixa: float
    quantidade_acoes: int


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