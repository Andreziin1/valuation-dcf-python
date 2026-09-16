/**
 * Utilitários de formatação financeira para a plataforma FinSight
 */

/**
 * Formata valores numéricos para moeda brasileira (BRL)
 * Ex: 1234567 -> R$ 1.234.567,00
 */
export function formatCurrency(value: number, includeDecimals = true): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(value);
}

/**
 * Formata números com separador de milhares limpo
 * Ex: 100000 -> 100.000
 */
export function formatNumber(value: number, decimals = 0): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formata valores percentuais
 * Ex: 8 -> 8,00% ou 8%
 */
export function formatPercent(value: number, decimals = 2): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0%';
  }
  return `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)}%`;
}

/**
 * Formata valores grandes de forma compacta e elegante para badges
 * Ex: 1500000 -> R$ 1,5M
 */
export function formatCompactCurrency(value: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0';
  }
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `R$ ${(value / 1_000_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}B`;
  }
  if (abs >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}M`;
  }
  if (abs >= 1_000) {
    return `R$ ${(value / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`;
  }
  return formatCurrency(value);
}

/**
 * Sanitiza strings de entrada para evitar injeções e caracteres de controle
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // remove potenciais tags
    .slice(0, 80); // limita tamanho para segurança
}
