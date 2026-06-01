from bolsa import buscar_dados_bolsa
from valuation import calcular_valuation
from relatorio import gerar_relatorio_txt
from utils import (
    formatar_moeda,
    formatar_porcentagem,
    validar_maior_que_zero,
    validar_nao_negativo,
    validar_taxas,
    calcular_margem_seguranca,
    gerar_diagnostico,
    calcular_potencial_valorizacao,
    gerar_cenarios,
    titulo,
    subtitulo
)


titulo("CALCULADORA DE VALUATION DCF")

print("1 - Empresa listada na bolsa")
print("2 - Empresa não listada / análise manual")

opcao = input("\nEscolha uma opção: ")

try:
    if opcao == "1":
        ticker = input("Ticker da empresa: ").upper()
        dados_bolsa = buscar_dados_bolsa(ticker)

        nome_empresa = dados_bolsa["ticker"]
        preco_atual = dados_bolsa["preco_atual"]
        divida = dados_bolsa["divida"]
        caixa = dados_bolsa["caixa"]
        quantidade_acoes = dados_bolsa["quantidade_acoes"]

        print(f"\nEmpresa selecionada: {nome_empresa}")
        print(f"Preço atual encontrado: {formatar_moeda(preco_atual)}")
        print(f"Dívida encontrada: {formatar_moeda(divida)}")
        print(f"Caixa encontrado: {formatar_moeda(caixa)}")
        print(f"Quantidade de ações: {quantidade_acoes}")

    elif opcao == "2":
        nome_empresa = input("Nome da empresa: ")

    else:
        raise ValueError("Opção inválida. Escolha 1 ou 2.")

    fcf_inicial = float(input("\nFluxo de caixa livre atual: R$ "))
    crescimento = float(input("Crescimento esperado ao ano (%): ")) / 100

    selic = float(input("Taxa Selic atual (%): ")) / 100
    premio_risco = float(input("Prêmio de risco (%): ")) / 100
    taxa_desconto = selic + premio_risco

    anos_projecao = int(input("Quantidade de anos para projeção: "))
    crescimento_perpetuo = float(input("Crescimento perpétuo (%): ")) / 100

    if opcao == "2":
        divida = float(input("Dívida total da empresa: R$ "))
        caixa = float(input("Caixa disponível da empresa: R$ "))
        quantidade_acoes = int(input("Quantidade de ações da empresa: "))
        preco_atual = float(input("Preço atual da ação: R$ "))

    validar_maior_que_zero(fcf_inicial, "Fluxo de caixa livre")
    validar_nao_negativo(crescimento, "Crescimento esperado")
    validar_nao_negativo(selic, "Taxa Selic")
    validar_nao_negativo(premio_risco, "Prêmio de risco")
    validar_maior_que_zero(anos_projecao, "Anos de projeção")
    validar_taxas(taxa_desconto, crescimento_perpetuo)
    validar_nao_negativo(divida, "Dívida")
    validar_nao_negativo(caixa, "Caixa")
    validar_maior_que_zero(quantidade_acoes, "Quantidade de ações")
    validar_maior_que_zero(preco_atual, "Preço atual da ação")

    resultado = calcular_valuation(
        fcf_inicial,
        crescimento,
        taxa_desconto,
        anos_projecao,
        crescimento_perpetuo,
        divida,
        caixa,
        quantidade_acoes
    )

    cenarios = gerar_cenarios(crescimento)

    cenario_pessimista = calcular_valuation(
        fcf_inicial,
        cenarios["pessimista"],
        taxa_desconto,
        anos_projecao,
        crescimento_perpetuo,
        divida,
        caixa,
        quantidade_acoes
    )

    cenario_base = calcular_valuation(
        fcf_inicial,
        cenarios["base"],
        taxa_desconto,
        anos_projecao,
        crescimento_perpetuo,
        divida,
        caixa,
        quantidade_acoes
    )

    cenario_otimista = calcular_valuation(
        fcf_inicial,
        cenarios["otimista"],
        taxa_desconto,
        anos_projecao,
        crescimento_perpetuo,
        divida,
        caixa,
        quantidade_acoes
    )

    margem_seguranca = calcular_margem_seguranca(
        resultado["valor_justo_acao"],
        preco_atual
    )

    potencial = calcular_potencial_valorizacao(
        resultado["valor_justo_acao"],
        preco_atual
    )

    diagnostico = gerar_diagnostico(margem_seguranca)

    subtitulo("PROJEÇÃO DOS FLUXOS DE CAIXA")

    for item in resultado["fluxos"]:
        print(f"\nAno {item['ano']}")
        print(f"Fluxo projetado: {formatar_moeda(item['fluxo'])}")
        print(f"Valor presente: {formatar_moeda(item['valor_presente'])}")

    subtitulo("RESULTADO DO VALUATION")

    print(f"Empresa analisada: {nome_empresa}")
    print(f"Taxa de desconto usada: {formatar_porcentagem(taxa_desconto)}")
    print(f"Valor terminal: {formatar_moeda(resultado['valor_terminal'])}")
    print(f"Valor terminal presente: {formatar_moeda(resultado['valor_terminal_presente'])}")
    print(f"Valor estimado da empresa: {formatar_moeda(resultado['valor_empresa'])}")

    subtitulo("PREÇO JUSTO DA AÇÃO")

    print(f"Preço atual da ação: {formatar_moeda(preco_atual)}")
    print(f"Preço justo calculado: {formatar_moeda(resultado['valor_justo_acao'])}")
    print("Esse é o preço que a ação deveria custar com base nos dados informados.")
    print(f"Potencial de valorização: {potencial:.2f}%")
    print(f"Margem de segurança: {formatar_porcentagem(margem_seguranca)}")
    print(f"Diagnóstico: {diagnostico}")

    subtitulo("CENÁRIOS DE VALUATION")

    print(f"Pessimista: {formatar_moeda(cenario_pessimista['valor_justo_acao'])}")
    print(f"Base: {formatar_moeda(cenario_base['valor_justo_acao'])}")
    print(f"Otimista: {formatar_moeda(cenario_otimista['valor_justo_acao'])}")

    gerar_relatorio_txt(
        nome_empresa,
        taxa_desconto,
        resultado,
        preco_atual,
        potencial,
        margem_seguranca,
        diagnostico,
        cenario_pessimista,
        cenario_base,
        cenario_otimista
    )

    print("\nRelatório TXT gerado com sucesso.")

except ValueError as erro:
    print(f"\nErro: {erro}")