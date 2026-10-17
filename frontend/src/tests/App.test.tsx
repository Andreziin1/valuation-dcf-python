import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'
import ResultPanel from '../components/ResultPanel'
import { reportText } from '../report'
import type { Company, Payload, Result } from '../model'

// Dados inteiramente sintéticos, usados apenas nos testes.
const company: Company = { ticker: 'TEST3', nome_empresa: 'Empresa sintética', preco_atual: 100, fcf_inicial: 1000, divida: 0, caixa: null, quantidade_acoes: 100,
  fonte: 'Fornecedor simulado', consultado_em: '2026-01-01T12:00:00Z', cotacao_em: null, preco_tipo: 'Cotação informada', fcf_periodo: '2025-12-31', balanco_em: null, avisos: ['Dados sintéticos de teste.'] }
const premises: Payload = { nome_empresa: 'Empresa sintética', fcf_inicial: 1000, crescimento: .05, taxa_desconto: .12, anos_projecao: 5, crescimento_perpetuo: .03,
  divida: 0, caixa: 0, quantidade_acoes: 100, preco_atual: 100, modelo_confirmado: true }
const result: Result = { empresa: 'Empresa sintética', preco_atual: 100, valor_justo_acao: 150, valuation_total: 15000, valor_operacional: 15000, valor_terminal: 10000, valor_terminal_presente: 7000,
  participacao_terminal: 7 / 15, estimativa_positiva: true, calculado_em: '2026-01-01T12:00:00Z', potencial_valorizacao: 50, margem_seguranca: 1 / 3,
  cenarios: { pessimista: 130, base: 150, otimista: 170 }, fluxos_projetados: [{ ano: 1, fluxo: 1050, valor_presente: 937.5 }], avisos: [], premissas: premises }

function mockApi(overrides: Record<string, unknown> = {}) {
  const mock = vi.fn(async (url: string, _options?: RequestInit) => {
    const data = overrides[url] ?? (url === '/api/health' ? { market_data_enabled: true } : url.includes('/empresa/') ? company : url.includes('/empresas?') ? { empresas: [{ ticker: 'TEST3', nome: 'Empresa sintética' }] } : result)
    return { ok: true, json: async () => data } as Response
  })
  vi.stubGlobal('fetch', mock)
  return mock
}
function change(id: string, value: string) { fireEvent.change(document.getElementById(id)!, { target: { value } }) }
async function loadListed() {
  change('company-search', 'TEST3')
  fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))
  await screen.findByDisplayValue('Empresa sintética')
}
function fillPremises() {
  change('crescimento', '5'); change('taxa_desconto', '12'); change('crescimento_perpetuo', '3')
}

describe('fluxos da interface', () => {
  it('inicia sem resultados inventados e faz busca por nome', async () => {
    const fetch = mockApi(); render(<App />)
    expect(screen.queryByText('R$ 150,00')).not.toBeInTheDocument()
    change('company-search', 'Empresa')
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))
    fireEvent.click(await screen.findByRole('button', { name: /Selecionar TEST3/ }))
    await screen.findByDisplayValue('Empresa sintética')
    expect(fetch.mock.calls.some(([url]) => url === '/api/empresas?q=Empresa')).toBe(true)
    expect(screen.getByDisplayValue('1000')).toHaveAttribute('readonly')
  })
  it('preenche API, mantém zero, libera ausentes e restaura sem apagar complemento manual', async () => {
    mockApi(); render(<App />); await loadListed()
    expect(document.getElementById('divida')).toHaveValue('0')
    expect(document.getElementById('divida')).toHaveAttribute('readonly')
    expect(document.getElementById('caixa')).not.toHaveAttribute('readonly')
    expect(document.getElementById('caixa')).toHaveValue('')
    change('caixa', '30')
    fireEvent.click(screen.getByRole('button', { name: 'Ajustar dados' }))
    change('divida', '25')
    fireEvent.click(screen.getByRole('button', { name: 'Restaurar dados importados' }))
    expect(document.getElementById('divida')).toHaveValue('0')
    expect(document.getElementById('caixa')).toHaveValue('30')
  })
  it('calcula manualmente sem cotação e invalida resultado ao editar premissas', async () => {
    const fetch = mockApi({ '/api/calcular-valuation': { ...result, preco_atual: null, potencial_valorizacao: null, margem_seguranca: null } })
    render(<App />); fireEvent.click(screen.getByRole('button', { name: 'Não listada' }))
    change('nome_empresa', 'Empresa sintética'); change('fcf_inicial', '1.000,50'); change('divida', '0'); change('caixa', '0'); change('quantidade_acoes', '100'); fillPremises()
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /Calcular valor/ }))
    await screen.findByText(/Sem preço de referência, não é possível/)
    const req = fetch.mock.calls.find(([url]) => url === '/api/calcular-valuation')!
    expect(JSON.parse(req[1]!.body as string)).toMatchObject({ fcf_inicial: 1000.5, preco_atual: null, taxa_desconto: .12 })
    expect(screen.getByRole('button', { name: /Baixar relatório/ })).toBeInTheDocument()
    change('crescimento', '6')
    expect(screen.queryByRole('button', { name: /Baixar relatório/ })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })
  it('trocar o tipo limpa a empresa e os dados antigos', async () => {
    mockApi(); render(<App />); await loadListed()
    fireEvent.click(screen.getByRole('button', { name: 'Não listada' }))
    expect(document.getElementById('nome_empresa')).toHaveValue('')
    expect(screen.queryByText('TEST3')).not.toBeInTheDocument()
    expect(document.getElementById('fcf_inicial')).toHaveValue('')
  })
  it('impede cálculo incompleto sem enviar dados para API', async () => {
    const fetch = mockApi(); render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Não listada' }))
    fireEvent.click(screen.getByRole('button', { name: /Calcular valor/ }))
    expect(await screen.findByText('Use entre 2 e 160 caracteres.')).toBeInTheDocument()
    expect(fetch.mock.calls.some(([url]) => url.includes('calcular-valuation'))).toBe(false)
  })
  it('apresenta indisponibilidade da consulta sem impedir modo manual', async () => {
    mockApi({ '/api/health': { market_data_enabled: false } }); render(<App />)
    await screen.findByText(/consulta automática não está habilitada/)
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Não listada' }))
    expect(screen.getByRole('button', { name: /Calcular valor/ })).toBeEnabled()
  })
  it('exibe falha de rede sem montar uma empresa falsa', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')))
    render(<App />); change('company-search', 'TEST3')
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/Não foi possível conectar/)
    expect(screen.queryByRole('button', { name: /Calcular valor/ })).not.toBeInTheDocument()
  })
  it('ignora resposta de busca atrasada depois de trocar de modo', async () => {
    let finish!: (value: Response) => void
    vi.stubGlobal('fetch', vi.fn((url: string) => url === '/api/health' ? Promise.resolve({ ok: true, json: async () => ({ market_data_enabled: true }) }) : new Promise<Response>(resolve => { finish = resolve })) )
    render(<App />); change('company-search', 'TEST3'); fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Não listada' }))
    finish({ ok: true, json: async () => company } as Response)
    await waitFor(() => expect(document.getElementById('nome_empresa')).toHaveValue(''))
    expect(screen.queryByDisplayValue('Empresa sintética')).not.toBeInTheDocument()
  })
})

describe('resultado e relatório', () => {
  it('explica a diferença e mantém detalhes recolhidos', () => {
    render(<ResultPanel result={result} company={company} type="listed" busy={false} adjusted={[]} />)
    expect(screen.getByText('A estimativa está 50,00% acima da cotação.')).toBeInTheDocument()
    const details = screen.getByText('Cenários de valor por ação').closest('details')
    expect(details).not.toHaveAttribute('open')
    expect(reportText(result, 'listed', company, [])).toContain('Margem de segurança: 33,33%')
    expect(reportText(result, 'listed', company, [])).toContain('Diferença em relação ao preço de referência: 50,00%')
  })
  it('não apresenta valor negativo como preço-alvo', () => {
    const negative = { ...result, valor_justo_acao: -1, estimativa_positiva: false, potencial_valorizacao: null, margem_seguranca: null }
    render(<ResultPanel result={negative} company={company} type="listed" busy={false} adjusted={[]} />)
    expect(screen.getByText('Sem valor positivo')).toBeInTheDocument()
    expect(screen.getByText(/não gera uma estimativa positiva/)).toBeInTheDocument()
    expect(reportText(negative, 'listed', company, [])).toContain('Sem estimativa positiva')
  })
})
