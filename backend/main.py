"""Terminal NexoDCF: compartilha validação e resultado com a API."""
import math
import re

if __package__:
    from .api import DadosValuation, calcular, mercado_habilitado
    from .bolsa import buscar_dados_bolsa
    from .relatorio import gerar_relatorio_txt
    from .utils import formatar_moeda, formatar_porcentagem, gerar_diagnostico
else:
    from api import DadosValuation, calcular, mercado_habilitado
    from bolsa import buscar_dados_bolsa
    from relatorio import gerar_relatorio_txt
    from utils import formatar_moeda, formatar_porcentagem, gerar_diagnostico


def ler_numero(texto, opcional=False):
    value = input(texto).strip().replace(" ", "")
    if not value and opcional:
        return None
    if not re.fullmatch(r"-?\d+(?:[.,]\d+)*", value):
        raise ValueError("Use números, com vírgula para decimais.")
    if "," in value:
        if not re.fullmatch(r"-?(?:\d+|\d{1,3}(?:\.\d{3})+),\d+", value):
            raise ValueError("Número inválido.")
        value = value.replace(".", "").replace(",", ".")
    elif re.fullmatch(r"-?\d{1,3}(?:\.\d{3})+", value):
        value = value.replace(".", "")
    number = float(value)
    if not math.isfinite(number):
        raise ValueError("Número fora do limite.")
    return number


def main():
    print("NexoDCF — Valuation por fluxo de caixa descontado")
    print("Estimativa educacional condicionada às premissas, não recomendação.")
    print("1 — Empresa listada\n2 — Empresa não listada")
    try:
        option = input("Escolha: ").strip()
        company = None
        if option == "1":
            if not mercado_habilitado():
                raise ValueError("Consulta automática desabilitada nesta instalação.")
            company = buscar_dados_bolsa(input("Ticker: "))
            data = {key: company[key] for key in ("nome_empresa", "fcf_inicial", "divida", "caixa", "quantidade_acoes", "preco_atual")}
            print("Dados importados:", data)
            for warning in company["avisos"]:
                print("Atenção:", warning)
            if input("Ajustar dados importados? [s/N]: ").strip().lower() == "s":
                for key in ("fcf_inicial", "divida", "caixa", "quantidade_acoes", "preco_atual"):
                    value = ler_numero(f"{key} (Enter mantém o importado): ", opcional=True)
                    if value is not None:
                        data[key] = value
        elif option == "2":
            data = {"nome_empresa": input("Nome da empresa: ")}
        else:
            raise ValueError("Escolha 1 ou 2.")
        for key, label in (
            ("fcf_inicial", "Fluxo anual compatível com FCFF (R$): "),
            ("divida", "Dívida total (R$): "), ("caixa", "Caixa disponível (R$): "),
            ("quantidade_acoes", "Total de ações/cotas da empresa: "),
            ("preco_atual", "Preço de referência (opcional, Enter sem comparação): "),
        ):
            if data.get(key) is None:
                data[key] = ler_numero(label, opcional=key == "preco_atual")
        data["crescimento"] = ler_numero("Crescimento anual (%): ") / 100
        data["taxa_desconto"] = ler_numero("Taxa de desconto compatível / WACC (%): ") / 100
        data["anos_projecao"] = ler_numero("Anos de projeção: ")
        data["crescimento_perpetuo"] = ler_numero("Crescimento perpétuo (%): ") / 100
        print("O FCF do fornecedor não é automaticamente FCFF. Confira a base do fluxo.")
        data["modelo_confirmado"] = input("Revisou fluxo FCFF e premissas? [s/N]: ").strip().lower() == "s"
        result = calcular(DadosValuation(**data))
        value = formatar_moeda(result["valor_justo_acao"])
        print("\nValor estimado por ação/cota:", value)
        print("Preço de referência:", formatar_moeda(result["preco_atual"]))
        potential = result["potencial_valorizacao"]
        print("Diferença para o preço:", "—" if potential is None else formatar_porcentagem(potential / 100))
        print("Margem de segurança:", formatar_porcentagem(result["margem_seguranca"]))
        print("Não é previsão de cotação nem retorno garantido.")
        legacy_result = {**result, "valor_empresa": result["valuation_total"], "fluxos": result["fluxos_projetados"]}
        scenarios = [{"valor_justo_acao": result["cenarios"][key]} for key in ("pessimista", "base", "otimista")]
        path = gerar_relatorio_txt(data["nome_empresa"], data["taxa_desconto"], legacy_result,
                                  data["preco_atual"], potential, result["margem_seguranca"],
                                  gerar_diagnostico(result["margem_seguranca"]), *scenarios)
        print("Relatório gerado:", path)
    except (ValueError, LookupError) as error:
        print("Revise os dados:", error)
    except Exception:
        print("Não foi possível concluir. Verifique a conexão, o fornecedor e a permissão de gravar o relatório.")


if __name__ == "__main__":
    main()
