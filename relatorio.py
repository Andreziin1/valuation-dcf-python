def gerar_relatorio_txt(
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
):

    nome_arquivo = f"relatorio_{nome_empresa.lower()}.txt"

    with open(nome_arquivo, "w", encoding="utf-8") as arquivo:

        arquivo.write("=" * 50 + "\n")
        arquivo.write("RELATÓRIO DE VALUATION\n")
        arquivo.write("=" * 50 + "\n\n")

        arquivo.write(f"Empresa analisada: {nome_empresa}\n")
        arquivo.write(f"Taxa de desconto: {taxa_desconto * 100:.2f}%\n\n")

        arquivo.write(
            f"Valor estimado da empresa: "
            f"R$ {resultado['valor_empresa']:,.2f}\n"
        )

        arquivo.write(
            f"Preço atual da ação: "
            f"R$ {preco_atual:,.2f}\n"
        )

        arquivo.write(
            f"Preço justo calculado: "
            f"R$ {resultado['valor_justo_acao']:,.2f}\n"
        )

        arquivo.write(
            f"Potencial de valorização: "
            f"{potencial:.2f}%\n"
        )

        arquivo.write(
            f"Margem de segurança: "
            f"{margem_seguranca * 100:.2f}%\n"
        )

        arquivo.write(f"Diagnóstico: {diagnostico}\n\n")

        arquivo.write("-" * 50 + "\n")
        arquivo.write("CENÁRIOS DE VALUATION\n")
        arquivo.write("-" * 50 + "\n\n")

        arquivo.write(
            f"Pessimista: "
            f"R$ {cenario_pessimista['valor_justo_acao']:,.2f}\n"
        )

        arquivo.write(
            f"Base: "
            f"R$ {cenario_base['valor_justo_acao']:,.2f}\n"
        )

        arquivo.write(
            f"Otimista: "
            f"R$ {cenario_otimista['valor_justo_acao']:,.2f}\n"
        )