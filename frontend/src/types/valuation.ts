/**
 * FinSight - Definições de Tipos TypeScript para Valuation DCF
 * Preparado para consumo direto da API REST Python FastAPI (POST /calcular-valuation)
 */

export type CompanyType = 'listed' | 'private';

export type ApiMode = 'mock' | 'fastapi';

/**
 * Payload exato esperado pelo endpoint POST /calcular-valuation no backend FastAPI (Python)
 */
export interface ValuationRequest {
  nome_empresa: string;
  fcf_inicial: number;
  crescimento: number;
  taxa_desconto: number;
  anos_projecao: number;
  crescimento_perpetuo: number;
  divida: number;
  caixa: number;
  quantidade_acoes: number;
}

/**
 * Projeção anual individual do fluxo de caixa
 */
export interface CashFlowItem {
  ano: number;
  fluxo: number;
  valor_presente: number;
}

/**
 * Resposta retornada pelo backend FastAPI após execução do valuation.py
 */
export interface ValuationResponse {
  empresa: string;
  valuation_total: number;
  valor_justo_acao: number;
  valor_terminal: number;
  valor_terminal_presente: number;
  fluxos_projetados: CashFlowItem[];
  mensagem?: string;
}

/**
 * Estado interno dos campos do formulário na interface
 */
export interface ValuationFormState {
  nomeEmpresa: string;
  tipoEmpresa: CompanyType;
  fcfInicial: number;
  crescimento: number; // Ex: 8 para 8% na interface, convertido para 0.08 no payload
  taxaDesconto: number; // Ex: 12 para 12% na interface, convertido para 0.12 no payload
  anosProjecao: number; // Ex: 5
  crescimentoPerpetuo: number; // Ex: 3 para 3% na interface, convertido para 0.03 no payload
  divida: number; // R$
  caixa: number; // R$
  quantidadeAcoes: number; // Unidades
}

/**
 * Erros de validação por campo
 */
export type FormValidationErrors = Partial<Record<keyof ValuationFormState, string>>;

/**
 * Cenários de análise pré-configurados
 */
export type ScenarioKey = 'conservative' | 'base' | 'optimistic';

export interface ValuationScenario {
  id: ScenarioKey;
  nome: string;
  descricao: string;
  premissas: ValuationFormState;
  resultadoMock: ValuationResponse;
}
