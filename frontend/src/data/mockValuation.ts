/**
 * ============================================================================
 * DADOS MOCKADOS (DEMONSTRAÇÃO INICIAL)
 * ============================================================================
 * Este arquivo contém EXCLUSIVAMENTE dados de demonstração.
 * Toda a lógica real de valuation será processada pelo backend Python + FastAPI.
 * Quando a API real for conectada, estes dados servem de fallback e documentação de contrato.
 */

import { ValuationFormState, ValuationRequest, ValuationResponse, ValuationScenario } from '../types/valuation';

/**
 * Premissas padrão para demonstração inicial (Cenário Base)
 */
export const DEFAULT_FORM_VALUES: ValuationFormState = {
  nomeEmpresa: 'Empresa Teste S.A.',
  tipoEmpresa: 'listed',
  fcfInicial: 500000,
  crescimento: 8.0, // 8.0%
  taxaDesconto: 12.0, // 12.0% (WACC)
  anosProjecao: 5,
  crescimentoPerpetuo: 3.0, // 3.0% (g)
  divida: 100000,
  caixa: 50000,
  quantidadeAcoes: 100000,
};

/**
 * Resposta Mock Padrão (Contrato da API)
 */
export const MOCK_BASE_RESPONSE: ValuationResponse = {
  empresa: 'Empresa Teste S.A.',
  valuation_total: 6245820,
  valor_justo_acao: 61.96,
  valor_terminal: 8254120,
  valor_terminal_presente: 4683520,
  fluxos_projetados: [
    { ano: 1, fluxo_projetado: 540000, valor_presente: 482143 },
    { ano: 2, fluxo_projetado: 583200, valor_presente: 464902 },
    { ano: 3, fluxo_projetado: 629856, valor_presente: 448277 },
    { ano: 4, fluxo_projetado: 680244, valor_presente: 432247 },
    { ano: 5, fluxo_projetado: 734664, valor_presente: 416790 },
  ],
  mensagem: 'Valuation calculado com sucesso (Dados Demonstrativos - Mock)',
};

/**
 * Cenários Pré-configurados (Conservador, Base, Otimista)
 * Estrutura preparada para receber diferentes premissas e comparar resultados
 */
export const SCENARIO_PRESETS: Record<'conservative' | 'base' | 'optimistic', ValuationScenario> = {
  conservative: {
    id: 'conservative',
    nome: 'Conservador',
    descricao: 'Crescimento moderado e taxa de desconto elevada considerando maior risco de mercado.',
    premissas: {
      nomeEmpresa: 'Empresa Teste S.A.',
      tipoEmpresa: 'listed',
      fcfInicial: 500000,
      crescimento: 4.5,
      taxaDesconto: 14.5,
      anosProjecao: 5,
      crescimentoPerpetuo: 2.0,
      divida: 100000,
      caixa: 50000,
      quantidadeAcoes: 100000,
    },
    resultadoMock: {
      empresa: 'Empresa Teste S.A.',
      valuation_total: 4410250,
      valor_justo_acao: 43.60,
      valor_terminal: 5120000,
      valor_terminal_presente: 2601000,
      fluxos_projetados: [
        { ano: 1, fluxo_projetado: 522500, valor_presente: 456332 },
        { ano: 2, fluxo_projetado: 546013, valor_presente: 416480 },
        { ano: 3, fluxo_projetado: 570583, valor_presente: 380102 },
        { ano: 4, fluxo_projetado: 596260, valor_presente: 346903 },
        { ano: 5, fluxo_projetado: 623091, valor_presente: 316601 },
      ],
      mensagem: 'Cenário Conservador simulado com sucesso (Mock)',
    },
  },
  base: {
    id: 'base',
    nome: 'Cenário Base',
    descricao: 'Premissas centrais equilibradas alinhadas ao histórico da empresa e projeções de mercado.',
    premissas: DEFAULT_FORM_VALUES,
    resultadoMock: MOCK_BASE_RESPONSE,
  },
  optimistic: {
    id: 'optimistic',
    nome: 'Otimista',
    descricao: 'Expansão acelerada de fluxo de caixa com compressão de risco e taxa de desconto favorável.',
    premissas: {
      nomeEmpresa: 'Empresa Teste S.A.',
      tipoEmpresa: 'listed',
      fcfInicial: 500000,
      crescimento: 12.0,
      taxaDesconto: 10.5,
      anosProjecao: 5,
      crescimentoPerpetuo: 3.5,
      divida: 100000,
      caixa: 50000,
      quantidadeAcoes: 100000,
    },
    resultadoMock: {
      empresa: 'Empresa Teste S.A.',
      valuation_total: 9284100,
      valor_justo_acao: 92.34,
      valor_terminal: 12890400,
      valor_terminal_presente: 7824100,
      fluxos_projetados: [
        { ano: 1, fluxo_projetado: 560000, valor_presente: 506787 },
        { ano: 2, fluxo_projetado: 627200, valor_presente: 513665 },
        { ano: 3, fluxo_projetado: 702464, valor_presente: 520635 },
        { ano: 4, fluxo_projetado: 786760, valor_presente: 527699 },
        { ano: 5, fluxo_projetado: 881171, valor_presente: 534857 },
      ],
      mensagem: 'Cenário Otimista simulado com sucesso (Mock)',
    },
  },
};

/**
 * Função geradora de mock dinâmico (somente para prototipação antes da conexão com a API Python):
 * Permite que a interface reaja aos números inseridos pelo usuário no modo Mock,
 * sem executar cálculos financeiros complexos que competem com o valuation.py.
 */
export function generateMockValuation(payload: ValuationRequest): ValuationResponse {
  const {
    nome_empresa,
    fcf_inicial,
    crescimento,
    taxa_desconto,
    anos_projecao,
    crescimento_perpetuo,
    divida,
    caixa,
    quantidade_acoes,
  } = payload;

  const fluxos_projetados = [];
  let ultimoFluxo = fcf_inicial;
  let somaValorPresenteFluxos = 0;

  for (let ano = 1; ano <= anos_projecao; ano++) {
    ultimoFluxo = ultimoFluxo * (1 + crescimento);
    const fatorDesconto = Math.pow(1 + taxa_desconto, ano);
    const valorPresente = ultimoFluxo / fatorDesconto;
    somaValorPresenteFluxos += valorPresente;

    fluxos_projetados.push({
      ano,
      fluxo_projetado: Math.round(ultimoFluxo),
      valor_presente: Math.round(valorPresente),
    });
  }

  // Gordon Growth simples para valor terminal demonstrativo
  const fluxoTerminal = ultimoFluxo * (1 + crescimento_perpetuo);
  const denominador = Math.max(taxa_desconto - crescimento_perpetuo, 0.001);
  const valorTerminal = fluxoTerminal / denominador;
  const fatorDescontoTerminal = Math.pow(1 + taxa_desconto, anos_projecao);
  const valorTerminalPresente = valorTerminal / fatorDescontoTerminal;

  const enterpriseValue = somaValorPresenteFluxos + valorTerminalPresente;
  const equityValue = enterpriseValue - divida + caixa;
  const valorJustoAcao = quantidade_acoes > 0 ? equityValue / quantidade_acoes : 0;

  return {
    empresa: nome_empresa || 'Empresa Analisada',
    valuation_total: Math.round(enterpriseValue),
    valor_justo_acao: Number(valorJustoAcao.toFixed(2)),
    valor_terminal: Math.round(valorTerminal),
    valor_terminal_presente: Math.round(valorTerminalPresente),
    fluxos_projetados,
    mensagem: 'Valuation calculado com sucesso via Mock de Demonstração',
  };
}
