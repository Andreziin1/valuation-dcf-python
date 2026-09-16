/**
 * ============================================================================
 * CAMADA DE SERVIÇO DE API (FinSight Valuation Service)
 * ============================================================================
 * Preparada para consumo do backend Python + FastAPI em:
 * POST http://127.0.0.1:8000/calcular-valuation
 *
 * Durante a fase inicial, opera em modo MOCK seguro sem falhas de rede.
 * Possibilita alternar para a API REAL assim que o servidor FastAPI estiver ativo.
 */

import { ValuationRequest, ValuationResponse, ApiMode } from '../types/valuation';
import { generateMockValuation } from '../data/mockValuation';

export interface ApiServiceConfig {
  baseUrl: string;
  mode: ApiMode;
  timeoutMs: number;
}

export const DEFAULT_API_CONFIG: ApiServiceConfig = {
  baseUrl: 'http://127.0.0.1:8000',
  mode: 'fastapi', // Inicia em Mock conforme especificação do projeto
  timeoutMs: 10000,
};

// Armazenamento em memória da configuração ativa
let currentConfig: ApiServiceConfig = { ...DEFAULT_API_CONFIG };

export function getApiConfig(): ApiServiceConfig {
  return { ...currentConfig };
}

export function setApiConfig(config: Partial<ApiServiceConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

/**
 * Executa o cálculo de valuation.
 * Se o modo for 'mock', resolve com os dados mockados estruturados.
 * Se o modo for 'fastapi', realiza a chamada HTTP POST real para o backend Python.
 */
export async function calcularValuation(payload: ValuationRequest): Promise<ValuationResponse> {
  const config = getApiConfig();

  // 1. MODO MOCK (Ambiente inicial seguro)
  if (config.mode === 'mock') {
    // Simula uma pequena latência de rede realista para testar estados visuais de loading
    await new Promise((resolve) => setTimeout(resolve, 600));
    return generateMockValuation(payload);
  }

  // 2. MODO API REAL (Python + FastAPI)
  const endpoint = `${config.baseUrl.replace(/\/$/, '')}/calcular-valuation`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Tratamento de erros HTTP
    if (!response.ok) {
      if (response.status === 422 || response.status === 400) {
        throw new Error('Verifique os dados informados.');
      }
      if (response.status >= 500) {
        throw new Error('O servidor de cálculo encontrou uma instabilidade. Tente novamente mais tarde.');
      }
      throw new Error('Não foi possível realizar o cálculo. Tente novamente.');
    }

    const data: ValuationResponse = await response.json();

    // Sanitização e validação da resposta recebida
    if (typeof data.valuation_total !== 'number' || typeof data.valor_justo_acao !== 'number') {
      throw new Error('Não foi possível realizar o cálculo. Tente novamente.');
    }

    return data;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    // Mensagens amigáveis e protegidas contra vazamento de detalhes internos
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('O tempo limite para resposta do servidor expirou. Verifique se a API está disponível.');
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('fetch')) {
        throw new Error('Não foi possível conectar ao servidor. Verifique se a API está disponível em ' + config.baseUrl);
      }
      // Retorna a mensagem amigável pré-definida sem vazar detalhes técnicos
      throw new Error(error.message);
    }

    throw new Error('Não foi possível realizar o cálculo. Tente novamente.');
  }
}

/**
 * Testa conectividade com a API FastAPI (útil quando o usuário quiser verificar se seu backend Python está ativo)
 */
export async function testApiConnection(baseUrl: string): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return response.ok;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
}