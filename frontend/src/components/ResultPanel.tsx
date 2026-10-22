import type { Company, CompanyType, Result } from '../model'
import { dateTime, dateOnly, money, percent } from '../model'
import { reportText } from '../report'

type Props = { result: Result | null; company: Company | null; type: CompanyType; busy: boolean; adjusted: string[] }
export default function ResultPanel({ result: r, company, type, busy, adjusted }: Props) {
  const unit = type === 'listed' ? 'ação' : 'cota'
  const priceEdited = !!(r && company && r.preco_atual !== company.preco_atual)
  function download() {
    if (!r) return
    const blob = new Blob([reportText(r, type, company, adjusted)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'NexoDCF-relatorio.txt'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <section className="result-area" aria-label="Resultado do valuation" aria-busy={busy}>
    <div className="result-card">
      <div className="result-head">
        <div><p className="overline">RESULTADO DO VALUATION</p><h2 id="result-title" tabIndex={-1}>{r?.empresa || company?.nome_empresa || 'Sua análise, em números'}</h2></div>
        {r && <span className="badge">{company?.ticker || 'Análise manual'}</span>}
      </div>
      <div className="price-comparison">
        <div className="estimated">
          <span className="price-label">Valor estimado por {unit}</span>
          <strong className={!r ? 'empty-number' : !r.estimativa_positiva ? 'no-value' : ''}>
            {r ? money(r.valor_justo_acao) : '—'}
          </strong>
          <span className="price-caption">{r ? 'Estimativa pelo modelo DCF' : 'Preencha os dados para calcular'}</span>
        </div>
        <div className="quoted">
          <span className="price-label">{priceEdited ? 'Preço informado pelo usuário' : type === 'listed' ? (company?.preco_tipo || 'Cotação de referência') : 'Preço de referência'}</span>
          <strong>{money(r ? r.preco_atual : company?.preco_atual)}</strong>
          <span className="price-caption">{r && r.preco_atual === null ? 'Não informado · comparação indisponível' : company && !priceEdited ? 'Data: ' + dateTime(company.cotacao_em) + ' · pode haver atraso' : 'Por ' + unit + ' · valor de comparação'}</span>
        </div>
      </div>
      <div className={'reading ' + (r && !r.estimativa_positiva ? 'warning' : '')} aria-live="polite">
        {busy ? <><strong>Calculando sua análise…</strong><p>Aguarde o resultado da API.</p></> :
        !r ? <><strong>Quanto a {unit} pode valer pelas suas premissas?</strong><p>O resultado compara o valor estimado pelo modelo com a cotação informada. Nenhum preço será calculado antes de você revisar os dados.</p></> :
        !r.estimativa_positiva ? <><strong>O cálculo resultou em {money(r.valor_justo_acao)} por {unit}.</strong><p>Esse é o resultado matemático do modelo após descontar dívida e somar caixa. Um valor negativo não significa que a ação será negociada por um preço negativo; indica que, com estas premissas, o valor operacional não cobre as obrigações líquidas. Revise os dados financeiros e as premissas.</p></> :
        r.potencial_valorizacao === null ? <><strong>O modelo estima {money(r.valor_justo_acao)} por {unit}.</strong><p>Sem preço de referência, não é possível calcular a diferença para o mercado.</p></> :
        <><strong>{Math.abs(r.potencial_valorizacao) < 0.005 ? 'A estimativa é igual à cotação de referência.' :
          'A estimativa está ' + percent(Math.abs(r.potencial_valorizacao)) + (r.potencial_valorizacao >= 0 ? ' acima' : ' abaixo') + ' da cotação.'}</strong>
          <p>Com estas premissas, o modelo estima <b>{money(r.valor_justo_acao)}</b> por {unit}, comparado a <b>{money(r.preco_atual)}</b>. Essa diferença não é retorno garantido.</p></>}
      </div>
      <p className="disclaimer">Estimativa, não recomendação. O resultado depende das premissas e não prevê a cotação futura.</p>
      {r && <div className="result-actions"><span>Calculado em {dateTime(r.calculado_em)} · Brasília</span><button type="button" className="text-button" onClick={download}>Baixar relatório .txt ↓</button></div>}
    </div>

    {!r ? <div className="explanation">
      <h3>Uma leitura simples</h3>
      <ol><li><b>Escolha a empresa.</b><span>Busque uma ação brasileira ou informe uma empresa não listada.</span></li>
        <li><b>Revise as premissas.</b><span>Crescimento e taxa de desconto são hipóteses da análise, não dados garantidos.</span></li>
        <li><b>Compare o resultado.</b><span>Veja o preço estimado e explore os cenários apenas se quiser aprofundar.</span></li></ol>
    </div> : <div className="details-stack">
      <details className="detail-card">
        <summary><span>Cenários de valor por {unit}<small>Como uma mudança no crescimento altera o resultado</small></span><span className="chevron" aria-hidden="true">⌄</span></summary>
        <div className="detail-body">
          <p>Somente o crescimento anual varia: 2 pontos percentuais abaixo ou acima da base. As demais premissas ficam iguais. Não são probabilidades.</p>
          <table><caption className="sr-only">Cenários estimados por {unit}</caption><thead><tr><th>Cenário</th><th>Crescimento/ano</th><th>Valor por {unit}</th></tr></thead><tbody>
            {(['pessimista', 'base', 'otimista'] as const).map((key, i) => <tr key={key} className={key === 'base' ? 'base-row' : ''}>
              <th scope="row">{['Pessimista', 'Base', 'Otimista'][i]}</th>
              <td>{percent((r.premissas.crescimento + (i - 1) * 0.02) * 100)}</td>
              <td>{money(r.cenarios[key])}</td></tr>)}
          </tbody></table>
        </div>
      </details>
      <details className="detail-card">
        <summary><span>Projeção do fluxo de caixa<small>Valores futuros e quanto representam hoje</small></span><span className="chevron" aria-hidden="true">⌄</span></summary>
        <div className="detail-body">
          <p>O fluxo projetado é o valor esperado em cada ano. O valor presente desconta esse fluxo pela taxa informada.</p>
          <div className="chart-legend"><span><i className="future-key" />Fluxo projetado</span><span><i className="present-key" />Valor presente</span></div>
          <div className="chart-scroll" tabIndex={0} aria-label="Gráfico rolável; valores exatos na tabela abaixo">
            <div className="flow-chart" style={{ minWidth: Math.max(300, r.fluxos_projetados.length * 58) }}>
              {r.fluxos_projetados.map(f => {
                const max = Math.max(...r.fluxos_projetados.map(x => x.fluxo))
                return <div className="chart-col" key={f.ano}><div className="bar-pair" aria-label={'Ano ' + f.ano + ': projetado ' + money(f.fluxo) + ', presente ' + money(f.valor_presente)}>
                  <div className="bar future-key" style={{ height: f.fluxo / max * 130 }} />
                  <div className="bar present-key" style={{ height: f.valor_presente / max * 130 }} />
                </div><span>Ano {f.ano}</span></div>
              })}
            </div>
          </div>
          <div className="table-scroll"><table><caption>Valores anuais em reais</caption><thead><tr><th>Ano</th><th>Fluxo projetado</th><th>Valor presente</th></tr></thead><tbody>
            {r.fluxos_projetados.map(f => <tr key={f.ano}><th scope="row">{f.ano}</th><td>{money(f.fluxo)}</td><td>{money(f.valor_presente)}</td></tr>)}
          </tbody></table></div>
        </div>
      </details>
      <details className="detail-card">
        <summary><span>Memória do cálculo e fontes<small>Premissas, margem de segurança e dados utilizados</small></span><span className="chevron" aria-hidden="true">⌄</span></summary>
        <div className="detail-body">
          <dl className="data-list">
            <div><dt>Valor operacional</dt><dd>{money(r.valor_operacional)}</dd></div>
            <div><dt>Valor dos acionistas, após dívida e caixa</dt><dd>{money(r.valuation_total)}</dd></div>
            <div><dt>Margem de segurança</dt><dd>{percent(r.margem_seguranca == null ? null : r.margem_seguranca * 100)}</dd></div>
            <div><dt>Valor terminal, descontado a hoje</dt><dd>{money(r.valor_terminal_presente)}</dd></div>
            <div><dt>Peso do terminal no valor operacional</dt><dd>{percent(r.participacao_terminal == null ? null : r.participacao_terminal * 100)}</dd></div>
            <div><dt>Taxa de desconto</dt><dd>{percent(r.premissas.taxa_desconto * 100)}</dd></div>
            <div><dt>Crescimento anual / perpétuo</dt><dd>{percent(r.premissas.crescimento * 100)} / {percent(r.premissas.crescimento_perpetuo * 100)}</dd></div>
          </dl>
          <p>Margem = (estimativa − cotação) ÷ estimativa. A diferença principal usa a cotação como denominador; por isso os percentuais são diferentes.</p>
          <p>Quanto maior o peso do valor terminal, maior a dependência do resultado em relação às premissas de longo prazo.</p>
          {company ? <div className="source-note"><b>{company.fonte}</b>
            <p>Consulta: {dateTime(company.consultado_em)} (Brasília). Cotação: {dateTime(company.cotacao_em)}. Dados podem estar defasados.</p>
            <p>FCF anual encerrado em {dateOnly(company.fcf_periodo)}. Referência de balanço informada pelo fornecedor: {dateOnly(company.balanco_em)}. As datas e bases podem ser diferentes.</p>
            <p>Ajustados manualmente: {adjusted.length ? adjusted.join(', ') : 'nenhum campo'}.</p>
          </div> : <p>Fonte: dados preenchidos manualmente pelo usuário, sem verificação externa.</p>}
        </div>
      </details>
    </div>}
    <details className="method-card" id="metodo"><summary>Entenda o método e seus limites <span aria-hidden="true">⌄</span></summary><div>
      <p>O DCF projeta um fluxo de caixa anual, desconta os valores para hoje e inclui uma perpetuidade. O modelo soma caixa, desconta dívida e divide o valor dos acionistas pela quantidade total de ações ou cotas.</p>
      <p>Essa estrutura pressupõe <b>FCFF</b> (fluxo de caixa livre para a firma) e uma taxa de desconto compatível, o <b>WACC</b>. Selic mais prêmio de risco não é automaticamente WACC. O Free Cash Flow do Yahoo Finance também não é automaticamente FCFF.</p>
      <p>Se o fluxo não estiver adequado ao modelo, ajuste-o com base nos demonstrativos. Confira moeda, datas, classes de ações e units. Bancos, seguradoras e empresas com fluxo negativo exigem análise específica.</p>
      <p>Não existe um único preço justo garantido. Use esta ferramenta como apoio ao estudo, nunca como critério isolado para investir.</p>
    </div></details>
  </section>
}
