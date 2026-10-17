import { dateTime, money, percent } from './model'
import type { Company, CompanyType, Result } from './model'
export function reportText(r: Result, type: CompanyType, company: Company | null, adjusted: string[]) {
  const p = r.premissas
  return [
    'NEXODCF — RELATÓRIO DE VALUATION', r.empresa, 'Calculado em: ' + dateTime(r.calculado_em),
    'Tipo: ' + (type === 'listed' ? 'Empresa listada' : 'Empresa não listada'),
    company ? 'Fonte: ' + company.fonte + ' | Consulta: ' + dateTime(company.consultado_em) : 'Fonte: dados manuais do usuário',
    company ? 'Cotação: ' + (company.preco_tipo || 'não informada') + ' | Data: ' + dateTime(company.cotacao_em) : '',
    company ? 'Período do FCF importado: ' + (company.fcf_periodo || 'não informado') : '',
    'Campos ajustados manualmente: ' + (adjusted.join(', ') || 'nenhum'), '',
    'RESULTADO', 'Estimativa por ação/cota: ' + (r.estimativa_positiva ? money(r.valor_justo_acao) : 'Sem estimativa positiva'),
    'Preço de referência: ' + money(r.preco_atual),
    'Diferença em relação ao preço de referência: ' + percent(r.potencial_valorizacao),
    'Margem de segurança: ' + percent(r.margem_seguranca == null ? null : r.margem_seguranca * 100),
    'Valor dos acionistas (após dívida e caixa): ' + money(r.valuation_total),
    'Valor operacional: ' + money(r.valor_operacional), '',
    'PREMISSAS',
    'Fluxo anual usado: ' + money(p.fcf_inicial), 'Crescimento anual: ' + percent(p.crescimento * 100),
    'Taxa de desconto: ' + percent(p.taxa_desconto * 100), 'Projeção: ' + p.anos_projecao + ' anos',
    'Crescimento perpétuo: ' + percent(p.crescimento_perpetuo * 100),
    'Dívida: ' + money(p.divida), 'Caixa: ' + money(p.caixa), 'Ações/cotas: ' + p.quantidade_acoes,
    '', 'CENÁRIOS (crescimento base ± 2 pontos percentuais; não são probabilidades)',
    ...Object.entries(r.cenarios).map(([name, value]) => name + ': ' + (value > 0 ? money(value) : 'Sem estimativa positiva')),
    '', 'FLUXOS PROJETADOS',
    ...r.fluxos_projetados.map(f => 'Ano ' + f.ano + ': ' + money(f.fluxo) + ' | Valor presente: ' + money(f.valor_presente)),
    '', 'Valor terminal presente: ' + money(r.valor_terminal_presente),
    'Peso do terminal no valor operacional: ' + percent(r.participacao_terminal == null ? null : r.participacao_terminal * 100),
    ...r.avisos, ...(company?.avisos || []), '',
    'Estimativa condicionada às premissas; não é previsão de cotação nem recomendação de investimento.',
    'Modelo FCFF/WACC: Free Cash Flow do fornecedor não foi validado automaticamente como FCFF.',
    'Confira demonstrativos, datas, moeda e quantidade de ações. Não use este resultado isoladamente para investir.',
  ].join('\n')
}
