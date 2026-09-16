# Função para calcular o valor presente
def calcular_valor_presente(fluxo_caixa, taxa_desconto, ano):
    return fluxo_caixa / ((1 + taxa_desconto) ** ano)


# Função principal do valuation
def calcular_valuation(
    fcf_inicial,
    crescimento,
    taxa_desconto,
    anos_projecao,
    crescimento_perpetuo,
    divida,
    caixa,
    quantidade_acoes
):

    valor_presente_total = 0

    fluxos = []

    # Projeção dos fluxos futuros
    for ano in range(1, anos_projecao + 1):

        fluxo_projetado = fcf_inicial * ((1 + crescimento) ** ano)

        valor_presente = calcular_valor_presente(
            fluxo_projetado,
            taxa_desconto,
            ano
        )

        valor_presente_total += valor_presente

        fluxos.append({
            "ano": ano,
            "fluxo": fluxo_projetado,
            "valor_presente": valor_presente
        })

    # Valor terminal
    fluxo_final = fcf_inicial * ((1 + crescimento) ** anos_projecao)

    valor_terminal = (
        fluxo_final * (1 + crescimento_perpetuo)
    ) / (taxa_desconto - crescimento_perpetuo)

    valor_terminal_presente = calcular_valor_presente(
        valor_terminal,
        taxa_desconto,
        anos_projecao
    )

    # Valor total da empresa
    valor_empresa = (
        valor_presente_total +
        valor_terminal_presente -
        divida +
        caixa
    )

    # Valor justo por ação
    valor_justo_acao = valor_empresa / quantidade_acoes

    return {
        "fluxos": fluxos,
        "valor_terminal": valor_terminal,
        "valor_terminal_presente": valor_terminal_presente,
        "valor_empresa": valor_empresa,
        "valor_justo_acao": valor_justo_acao
    }