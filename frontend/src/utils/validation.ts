import { ValuationFormState, FormValidationErrors, ValuationRequest } from '../types/valuation';
import { sanitizeString } from './formatters';

/**
 * Validação rigorosa dos dados de entrada antes do envio ao backend
 * Nota: Conforme especificado, a validação no frontend visa melhorar UX e não substitui
 * a validação do backend FastAPI.
 */
export function validateValuationForm(values: ValuationFormState): {
  isValid: boolean;
  errors: FormValidationErrors;
} {
  const errors: FormValidationErrors = {};

  // 1. Nome da empresa
  const sanitizedName = sanitizeString(values.nomeEmpresa);
  if (!sanitizedName || sanitizedName.length < 2) {
    errors.nomeEmpresa = 'Informe o nome da empresa (mínimo de 2 caracteres).';
  } else if (sanitizedName.length > 70) {
    errors.nomeEmpresa = 'Nome muito longo (máximo de 70 caracteres).';
  }

  // 2. FCF Inicial (Fluxo de Caixa Livre Inicial)
  if (values.fcfInicial === undefined || values.fcfInicial === null || isNaN(values.fcfInicial)) {
    errors.fcfInicial = 'O FCF inicial é obrigatório.';
  } else if (values.fcfInicial <= 0) {
    errors.fcfInicial = 'O FCF inicial deve ser maior que zero.';
  } else if (values.fcfInicial > 100_000_000_000) {
    errors.fcfInicial = 'Valor excede o limite operacional seguro.';
  }

  // 3. Crescimento esperado (%)
  if (values.crescimento === undefined || values.crescimento === null || isNaN(values.crescimento)) {
    errors.crescimento = 'Informe a taxa de crescimento esperada.';
  } else if (values.crescimento < -50 || values.crescimento > 150) {
    errors.crescimento = 'A taxa deve estar entre -50% e 150%.';
  }

  // 4. Taxa de Desconto (WACC %)
  if (values.taxaDesconto === undefined || values.taxaDesconto === null || isNaN(values.taxaDesconto)) {
    errors.taxaDesconto = 'A taxa de desconto (WACC) é obrigatória.';
  } else if (values.taxaDesconto <= 0 || values.taxaDesconto > 60) {
    errors.taxaDesconto = 'A taxa de desconto deve estar entre 0,1% e 60%.';
  }

  // 5. Anos de Projeção
  if (!values.anosProjecao || !Number.isInteger(Number(values.anosProjecao))) {
    errors.anosProjecao = 'Informe um número inteiro de anos.';
  } else if (values.anosProjecao < 1 || values.anosProjecao > 25) {
    errors.anosProjecao = 'O período de projeção deve estar entre 1 e 25 anos.';
  }

  // 6. Crescimento Perpétuo (g %)
  if (values.crescimentoPerpetuo === undefined || values.crescimentoPerpetuo === null || isNaN(values.crescimentoPerpetuo)) {
    errors.crescimentoPerpetuo = 'Informe o crescimento perpétuo (g).';
  } else if (values.crescimentoPerpetuo < 0 || values.crescimentoPerpetuo > 12) {
    errors.crescimentoPerpetuo = 'O crescimento perpétuo deve estar entre 0% e 12%.';
  } else if (values.taxaDesconto && values.crescimentoPerpetuo >= values.taxaDesconto) {
    errors.crescimentoPerpetuo = 'O crescimento perpétuo deve ser estritamente menor que a taxa de desconto (WACC).';
  }

  // 7. Dívida
  if (values.divida === undefined || values.divida === null || isNaN(values.divida)) {
    errors.divida = 'Informe o valor da dívida (ou 0 se não houver).';
  } else if (values.divida < 0) {
    errors.divida = 'A dívida não pode ser negativa.';
  }

  // 8. Caixa
  if (values.caixa === undefined || values.caixa === null || isNaN(values.caixa)) {
    errors.caixa = 'Informe o caixa disponível (ou 0 se não houver).';
  } else if (values.caixa < 0) {
    errors.caixa = 'O caixa não pode ser negativo.';
  }

  // 9. Quantidade de ações
  if (!values.quantidadeAcoes || isNaN(values.quantidadeAcoes)) {
    errors.quantidadeAcoes = 'Informe a quantidade de ações.';
  } else if (values.quantidadeAcoes <= 0) {
    errors.quantidadeAcoes = 'A quantidade de ações deve ser maior que zero.';
  } else if (!Number.isInteger(Number(values.quantidadeAcoes))) {
    errors.quantidadeAcoes = 'A quantidade de ações deve ser um número inteiro.';
  }

  const isValid = Object.keys(errors).length === 0;

  return { isValid, errors };
}

/**
 * Converte o estado do formulário no payload exato esperado pela API FastAPI:
 * - Percentuais são convertidos de base 100 para decimais (ex: 8% -> 0.08)
 * - Valores são sanitizados
 */
export function prepareValuationPayload(values: ValuationFormState): ValuationRequest {
  return {
    nome_empresa: sanitizeString(values.nomeEmpresa),
    fcf_inicial: Number(values.fcfInicial),
    crescimento: Number((values.crescimento / 100).toFixed(6)),
    taxa_desconto: Number((values.taxaDesconto / 100).toFixed(6)),
    anos_projecao: Math.floor(Number(values.anosProjecao)),
    crescimento_perpetuo: Number((values.crescimentoPerpetuo / 100).toFixed(6)),
    divida: Number(values.divida),
    caixa: Number(values.caixa),
    quantidade_acoes: Math.floor(Number(values.quantidadeAcoes)),
  };
}
