import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import Field from './components/Field'
import ResultPanel from './components/ResultPanel'
import { companyForm, dataKeys, dateOnly, dateTime, initialForm, parseNumber, request, toPayload, validate } from './model'
import type { Candidate, Company, CompanyType, DataKey, FormData, Result } from './model'

const labels: Record<keyof FormData, string> = {
  nome_empresa: 'Nome da empresa', fcf_inicial: 'Fluxo de caixa anual', preco_atual: 'Preço de referência',
  quantidade_acoes: 'Total de ações', divida: 'Dívida total', caixa: 'Caixa disponível',
  crescimento: 'Crescimento anual', taxa_desconto: 'Taxa de desconto (WACC)',
  anos_projecao: 'Anos de projeção', crescimento_perpetuo: 'Crescimento perpétuo',
}
export default function App() {
  const [type, setType] = useState<CompanyType>('listed')
  const [form, setForm] = useState<FormData>({ ...initialForm })
  const [company, setCompany] = useState<Company | null>(null)
  const [query, setQuery] = useState('')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [searched, setSearched] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [searching, setSearching] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState('')
  const [searchError, setSearchError] = useState('')
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({})
  const [availability, setAvailability] = useState<boolean | null>(null)
  const searchRef = useRef<AbortController | null>(null)
  const calculationRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    request<{ market_data_enabled: boolean }>('/health', ctrl.signal)
      .then(r => setAvailability(r.market_data_enabled)).catch(() => {})
    return () => { ctrl.abort(); searchRef.current?.abort(); calculationRef.current?.abort() }
  }, [])

  function invalidate() {
    calculationRef.current?.abort(); setCalculating(false); setResult(null); setError('')
  }
  function update(key: keyof FormData, value: string) {
    invalidate(); setConfirmed(false)
    setForm(f => ({ ...f, [key]: value })); setErrors(e => ({ ...e, [key]: undefined, confirmed: undefined }))
  }
  function switchType(next: CompanyType) {
    if (next === type) return
    searchRef.current?.abort(); invalidate()
    setType(next); setForm({ ...initialForm }); setCompany(null); setCandidates([])
    setQuery(''); setSearching(false); setSearched(false); setEditing(false); setConfirmed(false)
    setErrors({}); setSearchError('')
  }
  function changeQuery(value: string) {
    searchRef.current?.abort(); invalidate(); setSearching(false)
    setQuery(value); setCompany(null); setCandidates([]); setSearched(false); setConfirmed(false)
    setForm({ ...initialForm }); setErrors({}); setSearchError(''); setEditing(false)
  }
  async function loadCompany(ticker: string, ctrl?: AbortController) {
    searchRef.current?.abort()
    const controller = ctrl || new AbortController()
    searchRef.current = controller
    invalidate(); setSearching(true); setSearchError(''); setCompany(null); setCandidates([]); setConfirmed(false)
    setForm({ ...initialForm }); setEditing(false)
    try {
      const data = await request<Company>('/empresa/' + encodeURIComponent(ticker), controller.signal)
      if (controller.signal.aborted) return
      setCompany(data); setForm({ ...initialForm, ...companyForm(data) }); setQuery(data.ticker); setSearched(false)
    } catch (e) {
      if (!controller.signal.aborted) setSearchError(e instanceof Error ? e.message : 'Não foi possível carregar a empresa.')
    } finally { if (!controller.signal.aborted) setSearching(false) }
  }
  async function search(event: FormEvent) {
    event.preventDefault()
    const q = query.trim()
    if (q.length < 2) { setSearchError('Digite um nome ou ticker com pelo menos dois caracteres.'); return }
    if (/^[A-Za-z]{4}\d{1,2}(\.SA)?$/i.test(q)) { await loadCompany(q); return }
    searchRef.current?.abort()
    const ctrl = new AbortController(); searchRef.current = ctrl
    setSearching(true); setSearchError(''); setCandidates([]); setSearched(false)
    try {
      const data = await request<{ empresas: Candidate[] }>('/empresas?q=' + encodeURIComponent(q), ctrl.signal)
      if (ctrl.signal.aborted) return
      setCandidates(data.empresas); setSearched(true)
    } catch (e) {
      if (!ctrl.signal.aborted) setSearchError(e instanceof Error ? e.message : 'Não foi possível buscar.')
    } finally { if (!ctrl.signal.aborted) setSearching(false) }
  }
  async function calculate(event: FormEvent) {
    event.preventDefault(); setError('')
    const validation = validate(form, confirmed); setErrors(validation)
    if (Object.keys(validation).length) {
      setResult(null)
      document.getElementById(Object.keys(validation)[0])?.focus()
      return
    }
    calculationRef.current?.abort()
    const ctrl = new AbortController(); calculationRef.current = ctrl
    setCalculating(true); setResult(null)
    try {
      const data = await request<Result>('/calcular-valuation', ctrl.signal, toPayload(form, confirmed))
      if (!ctrl.signal.aborted) {
        setResult(data)
        setTimeout(() => document.getElementById('result-title')?.focus(), 0)
      }
    } catch (e) {
      if (!ctrl.signal.aborted) setError(e instanceof Error ? e.message : 'Não foi possível calcular.')
    } finally { if (!ctrl.signal.aborted) setCalculating(false) }
  }
  const imported = company ? companyForm(company) : null
  const hasAutoValue = (key: keyof FormData) => !!company && dataKeys.includes(key as DataKey) && company[key as DataKey] != null
  const adjusted = imported ? dataKeys.filter(k => hasAutoValue(k) && (k === 'nome_empresa' ? form[k] !== imported[k] : parseNumber(form[k]) !== parseNumber(imported[k] || ''))) : []
  const completed = company ? dataKeys.filter(k => !hasAutoValue(k) && form[k].trim() !== '') : []
  function field(key: keyof FormData, hint?: string, suffix?: string) {
    const auto = hasAutoValue(key)
    const source = auto ? adjusted.includes(key as DataKey) ? 'Ajustado' : 'API' : (company && dataKeys.includes(key as DataKey) ? 'Completar' : undefined)
    const label = key === 'quantidade_acoes' && type === 'private' ? 'Total de cotas' : labels[key]
    return <Field key={key} id={key} label={label} value={form[key]} onChange={v => update(key, v)}
      error={errors[key]} hint={hint} suffix={suffix} text={key === 'nome_empresa'}
      readOnly={auto && !editing} source={source} />
  }

  return <>
    <a className="skip-link" href="#calculadora">Ir para a calculadora</a>
    <header className="site-header"><div className="header-inner">
      <a href="#top" className="brand" aria-label="NexoDCF, início"><img src="/nexodcf-logo.png" alt="" width="40" height="40" /><span>Nexo<span className="brand-dcf">DCF</span></span></a>
      <nav aria-label="Navegação principal"><a href="#calculadora">Calculadora</a><a href="#metodo" onClick={() => { const el = document.getElementById('metodo') as HTMLDetailsElement | null; if (el) el.open = true }}>Como funciona</a></nav>
    </div></header>
    <main id="top" className="page">
      <div className="intro"><p className="overline">ANÁLISE DE VALOR • DCF</p><h1>Entenda o valor por trás do preço.</h1><p>Compare a cotação com uma estimativa de valor por ação. Dados claros, premissas à vista.</p></div>
      <div className="workspace" id="calculadora">
        <section className="input-panel" aria-label="Dados da análise">
          <div className="section-heading"><span className="step-number">1</span><h2>Escolha a empresa</h2></div>
          <div className="type-switch" role="group" aria-label="Tipo de empresa">
            <button type="button" aria-pressed={type === 'listed'} onClick={() => switchType('listed')}>Listada na bolsa</button>
            <button type="button" aria-pressed={type === 'private'} onClick={() => switchType('private')}>Não listada</button>
          </div>
          {type === 'listed' ? <>
            <form onSubmit={search} className="search-form">
              <label htmlFor="company-search">Nome ou ticker da empresa</label>
              <div className="search-controls"><input id="company-search" maxLength={80} value={query} onChange={e => changeQuery(e.target.value)} placeholder="Ex.: Petrobras ou PETR4" autoComplete="off" />
                <button className="button secondary" disabled={searching || availability === false}>{searching ? 'Buscando…' : 'Buscar'}</button></div>
              <p className="hint">Ações brasileiras. Dados disponíveis são preenchidos automaticamente.</p>
            </form>
            {availability === false && <p className="notice">A consulta automática não está habilitada nesta instalação. O modo não listado permite uma análise manual.</p>}
            {searchError && <p className="error-box" role="alert">{searchError}</p>}
            {candidates.length > 0 && <ul className="search-results" aria-label="Empresas encontradas">{candidates.map(c => <li key={c.ticker}><button aria-label={'Selecionar ' + c.ticker + ' — ' + c.nome} onClick={() => loadCompany(c.ticker)}><b>{c.ticker}</b><span>{c.nome}</span><span aria-hidden="true">→</span></button></li>)}</ul>}
            {searched && candidates.length === 0 && <p className="notice">Nenhuma ação brasileira encontrada. Tente o ticker exato.</p>}
            {company && <div className="company-meta"><b>{company.ticker}</b><span>{company.nome_empresa}</span><small>{company.fonte} · consultado em {dateTime(company.consultado_em)}</small></div>}
          </> : <p className="hint mode-help">Informe os dados da empresa em reais. O preço por cota é opcional e serve apenas para comparação.</p>}

          {(type === 'private' || company) && <form noValidate onSubmit={calculate} className="valuation-form">
            <div className="data-heading"><h3>Dados financeiros</h3>{company && <button className="text-button" type="button" aria-pressed={editing} onClick={() => setEditing(!editing)}>{editing ? 'Proteger campos' : 'Ajustar dados'}</button>}</div>
            {field('nome_empresa')}
            <div className="form-grid">
              {field('fcf_inicial', company?.fcf_periodo ? 'FCF importado: exercício encerrado em ' + dateOnly(company.fcf_periodo) + '. Revise a base FCFF.' : 'Fluxo anual compatível com FCFF.', 'R$')}
              {field('quantidade_acoes', 'Total da empresa, não a sua posição.')}
              {field('divida', 'Dívida financeira total.', 'R$')}
              {field('caixa', 'Caixa e equivalentes.', 'R$')}
              <div className="full-width">{field('preco_atual', 'Opcional. Sem preço, o valor estimado continua disponível.', 'R$')}</div>
            </div>
            {company && <div className="import-note"><p>Campos “API” estão protegidos. Valores ausentes podem ser preenchidos. Nenhum dado faltante foi substituído por zero.</p>
              {adjusted.length > 0 && <button type="button" className="text-button" onClick={() => { invalidate(); const original = companyForm(company); setForm(f => ({ ...f, ...Object.fromEntries(dataKeys.filter(hasAutoValue).map(k => [k, original[k]])) })); setConfirmed(false); setErrors({}); setEditing(false) }}>Restaurar dados importados</button>}
            </div>}
            {company && company.avisos.length > 0 && <div className="notice"><b>Antes de calcular</b><ul>{company.avisos.map((w, i) => <li key={i}>{w}</li>)}</ul></div>}
            <div className="section-heading divided"><span className="step-number">2</span><h2>Defina as premissas</h2></div>
            <p className="hint">Estas taxas são hipóteses suas. Não são preenchidas como se fossem dados da empresa.</p>
            <div className="form-grid">
              {field('crescimento', 'Variação esperada do fluxo por ano.', '%')}
              {field('taxa_desconto', 'Custo de capital compatível com o fluxo.', '%')}
              {field('anos_projecao', 'Período explícito: 1 a 25 anos.')}
              {field('crescimento_perpetuo', 'Após a projeção; menor que o desconto.', '%')}
            </div>
            <label className="confirm-label"><input id="confirmed" type="checkbox" checked={confirmed} aria-invalid={!!errors.confirmed}
              onChange={e => { invalidate(); setConfirmed(e.target.checked); setErrors(v => ({ ...v, confirmed: undefined })) }} />
              <span>Revisei as premissas e confirmei que o fluxo informado é compatível com FCFF.</span></label>
            {errors.confirmed && <p className="field-error" role="alert">{errors.confirmed}</p>}
            <button className="button primary calculate-button" disabled={calculating}>{calculating ? 'Calculando…' : 'Calcular valor estimado'}<span aria-hidden="true">→</span></button>
            {error && <p className="error-box" role="alert">{error}</p>}
            <p className="hint privacy-note">A análise não cria histórico nem conta de usuário.</p>
          </form>}
          {type === 'listed' && !company && <div className="start-note"><span className="step-number">2</span><p>Após escolher a empresa, revise os dados e informe suas premissas para calcular.</p></div>}
        </section>
        <ResultPanel result={result} company={company} type={type} busy={calculating} adjusted={[...adjusted.map(k => labels[k] + ' (ajustado)'), ...completed.map(k => labels[k] + ' (ausente na API, preenchido manualmente)')]} />
      </div>
      <footer className="site-footer"><span>NexoDCF · Valuation com premissas claras</span><span>Desenvolvido por André Luiz · Ferramenta de análise educacional</span></footer>
    </main>
  </>
}
