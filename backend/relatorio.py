"""Relatório do terminal; nomes seguros e sem sobrescrever análises anteriores."""
import re
from datetime import datetime, timezone
from uuid import uuid4

if __package__:
    from .utils import formatar_moeda, formatar_porcentagem
else:
    from utils import formatar_moeda, formatar_porcentagem


def gerar_relatorio_txt(nome_empresa, taxa_desconto, resultado, preco_atual,
                        potencial, margem_seguranca, diagnostico,
                        cenario_pessimista, cenario_base, cenario_otimista):
    safe = re.sub(r"[^a-zA-Z0-9_-]+", "_", nome_empresa).strip("_")[:60] or "empresa"
    now = datetime.now(timezone.utc)
    name = f"relatorio_{safe}_{now:%Y%m%d_%H%M%S}_{uuid4().hex[:8]}.txt"
    value = resultado["valor_justo_acao"]
    lines = [
        "NEXODCF — RELATÓRIO DE VALUATION", "Empresa: " + nome_empresa,
        "Calculado em: " + now.isoformat(), "Taxa de desconto: " + formatar_porcentagem(taxa_desconto),
        "Estimativa por ação/cota: " + (formatar_moeda(value) if value > 0 else "Sem estimativa positiva"),
        "Preço de referência: " + formatar_moeda(preco_atual),
        "Diferença para o preço: " + (formatar_porcentagem(potencial / 100) if potencial is not None else "—"),
        "Margem de segurança: " + formatar_porcentagem(margem_seguranca),
        "Valor dos acionistas, após dívida e caixa: " + formatar_moeda(resultado["valor_empresa"]),
        diagnostico, "", "CENÁRIOS — crescimento base ± 2 pontos percentuais",
    ]
    for label, scenario in zip(("Pessimista", "Base", "Otimista"), (cenario_pessimista, cenario_base, cenario_otimista)):
        v = scenario["valor_justo_acao"]
        lines.append(label + ": " + (formatar_moeda(v) if v > 0 else "Sem estimativa positiva"))
    lines += ["", "FLUXOS PROJETADOS"]
    lines += [f"Ano {f['ano']}: {formatar_moeda(f['fluxo'])} | Presente: {formatar_moeda(f['valor_presente'])}" for f in resultado.get("fluxos", [])]
    lines += ["", "Estimativa condicionada às premissas, não recomendação nem promessa de retorno.",
              "O fluxo deve ser compatível com FCFF e a taxa com WACC. Confira moeda, datas e número de ações."]
    with open(name, "x", encoding="utf-8") as output:
        output.write("\n".join(lines))
    return name
