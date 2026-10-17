export type CompanyType = 'listed' | 'private'
export type FormData = {
  nome_empresa: string; fcf_inicial: string; crescimento: string; taxa_desconto: string
  anos_projecao: string; crescimento_perpetuo: string; divida: string; caixa: string
  quantidade_acoes: string; preco_atual: string
}
export type DataKey = 'nome_empresa' | 'fcf_inicial' | 'divida' | 'caixa' | 'quantidade_acoes' | 'preco_atual'
export type Company = {
  ticker: string; nome_empresa: string; preco_atual: number | null; fcf_inicial: number | null
  divida: number | null; caixa: number | null; quantidade_acoes: number | null
  fonte: string; consultado_em: string; cotacao_em: string | null; preco_tipo: string | null
  fcf_periodo: string | null; balanco_em: string | null; avisos: string[]
}
export type Candidate = { ticker: string; nome: string }
export type Payload = {
  nome_empresa: string; fcf_inicial: number; crescimento: number; taxa_desconto: number
  anos_projecao: number; crescimento_perpetuo: number; divida: number; caixa: number
  quantidade_acoes: number; preco_atual: number | null; modelo_confirmado: boolean
}
export type Result = {
  empresa: string; preco_atual: number | null; valor_justo_acao: number; valuation_total: number
  valor_operacional: number; valor_terminal: number; valor_terminal_presente: number
  participacao_terminal: number | null; estimativa_positiva: boolean; calculado_em: string
  potencial_valorizacao: number | null; margem_seguranca: number | null
  cenarios: { pessimista: number; base: number; otimista: number }
  fluxos_projetados: { ano: number; fluxo: number; valor_presente: number }[]
  avisos: string[]; premissas: Payload
}
export const initialForm: FormData = {
  nome_empresa: '', fcf_inicial: '', crescimento: '', taxa_desconto: '', anos_projecao: '5',
  crescimento_perpetuo: '', divida: '', caixa: '', quantidade_acoes: '', preco_atual: '',
}
export const dataKeys: DataKey[] = ['nome_empresa', 'fcf_inicial', 'preco_atual', 'quantidade_acoes', 'divida', 'caixa']
export function money(value: number | null | undefined) {
  return value == null || !Number.isFinite(value) ? '—' : value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
export function percent(value: number | null | undefined) {
  return value == null || !Number.isFinite(value) ? '—' : value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
}
export function dateTime(value: string | null | undefined) {
  if (!value) return 'não informada'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? 'não informada' : d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}
export function dateOnly(value: string | null | undefined) {
  if (!value) return 'não informado'
  return value.slice(0, 10).split('-').reverse().join('/')
}
// Os campos aceitam formato brasileiro (1.234,56) e decimal simples (1234.56).
export function parseNumber(value: string): number | null {
  const s = value.trim().replace(/\s/g, '')
  if (!s) return null
  if (!/^-?\d+(?:[.,]\d+)*$/.test(s)) return null
  let normalized = s
  if (s.includes(',')) {
    if (!/^-?(?:\d+|\d{1,3}(?:\.\d{3})+),\d+$/.test(s)) return null
    normalized = s.replace(/\./g, '').replace(',', '.')
  } else if (/^-?\d{1,3}(?:\.\d{3})+$/.test(s)) {
    normalized = s.replace(/\./g, '')
  }
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}
export const numberInput = (value: number) => value.toLocaleString('pt-BR', { useGrouping: false, maximumFractionDigits: 10 })
export function companyForm(c: Company): Partial<FormData> {
  return Object.fromEntries(dataKeys.map(k => [k, typeof c[k] === 'number' ? numberInput(c[k] as number) : c[k] ?? '']))
}
export function validate(form: FormData, confirmed: boolean) {
  const errors: Partial<Record<keyof FormData | 'confirmed', string>> = {}
  const n = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, parseNumber(v)])) as Record<keyof FormData, number | null>
  if (form.nome_empresa.trim().length < 2 || form.nome_empresa.trim().length > 160) errors.nome_empresa = 'Use entre 2 e 160 caracteres.'
  for (const k of ['fcf_inicial', 'divida', 'caixa'] as const) {
    if (n[k] === null || n[k]! < 0 || n[k]! > 1e16) errors[k] = 'Informe um valor válido em reais; zero só quando confirmado.'
  }
  if (n.fcf_inicial !== null && n.fcf_inicial <= 0) errors.fcf_inicial = 'Este modelo exige fluxo positivo. Não substitua perdas por zero.'
  if (n.quantidade_acoes === null || !Number.isSafeInteger(n.quantidade_acoes) || n.quantidade_acoes <= 0) errors.quantidade_acoes = 'Informe a quantidade total, inteira e maior que zero.'
  if (form.preco_atual.trim() && (n.preco_atual === null || n.preco_atual <= 0 || n.preco_atual > 1e16)) errors.preco_atual = 'Informe um preço positivo ou deixe em branco.'
  if (n.crescimento === null || n.crescimento < -50 || n.crescimento > 150) errors.crescimento = 'Informe uma taxa entre -50% e 150%.'
  if (n.taxa_desconto === null || n.taxa_desconto <= 0.1 || n.taxa_desconto > 60) errors.taxa_desconto = 'Informe uma taxa maior que 0,1% e até 60%.'
  if (n.crescimento_perpetuo === null || n.crescimento_perpetuo < 0 || n.crescimento_perpetuo > 12) errors.crescimento_perpetuo = 'Informe uma taxa entre 0% e 12%.'
  else if (n.taxa_desconto !== null && n.crescimento_perpetuo >= n.taxa_desconto) errors.crescimento_perpetuo = 'Precisa ser menor que a taxa de desconto.'
  if (n.anos_projecao === null || !Number.isInteger(n.anos_projecao) || n.anos_projecao < 1 || n.anos_projecao > 25) errors.anos_projecao = 'Use de 1 a 25 anos inteiros.'
  if (!confirmed) errors.confirmed = 'Revise e confirme as premissas antes de calcular.'
  return errors
}
export function toPayload(form: FormData, confirmed: boolean): Payload {
  return {
    nome_empresa: form.nome_empresa.trim(), fcf_inicial: parseNumber(form.fcf_inicial)!,
    crescimento: parseNumber(form.crescimento)! / 100, taxa_desconto: parseNumber(form.taxa_desconto)! / 100,
    anos_projecao: parseNumber(form.anos_projecao)!, crescimento_perpetuo: parseNumber(form.crescimento_perpetuo)! / 100,
    divida: parseNumber(form.divida)!, caixa: parseNumber(form.caixa)!,
    quantidade_acoes: parseNumber(form.quantidade_acoes)!, preco_atual: parseNumber(form.preco_atual), modelo_confirmado: confirmed,
  }
}
export async function request<T>(path: string, signal: AbortSignal, body?: Payload): Promise<T> {
  const timeout = AbortSignal.timeout(30000)
  let response: Response
  try {
    response = await fetch('/api' + path, {
      signal: AbortSignal.any([signal, timeout]), method: body ? 'POST' : 'GET',
      ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
    })
  } catch (e) {
    if (signal.aborted) throw e
    throw new Error(timeout.aborted ? 'A consulta demorou demais. Tente novamente.' : 'Não foi possível conectar à API. Verifique se o backend está em execução.')
  }
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.erros?.map((e: { mensagem: string }) => e.mensagem).join(' ') || data?.detail || 'A API não respondeu corretamente. Tente novamente.')
  if (!data) throw new Error('A API retornou uma resposta inválida.')
  return data as T
}
