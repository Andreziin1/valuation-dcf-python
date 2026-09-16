import React, { useState } from 'react';
import {
  X,
  Server,
  Code2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { ApiMode } from '../types/valuation';
import { getApiConfig, setApiConfig, testApiConnection } from '../services/api';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: ApiMode;
  onModeChange: (newMode: ApiMode) => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onModeChange,
}) => {
  const [baseUrl, setBaseUrl] = useState(getApiConfig().baseUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiConfig({ baseUrl });
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const ok = await testApiConnection(baseUrl);
    setIsTesting(false);
    setTestResult(ok ? 'success' : 'error');
  };

  const samplePythonCode = `# main.py (FastAPI)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="FinSight DCF Valuation API")

# Configuração de CORS para desenvolvimento local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Substitua pelos domínios autorizados em produção
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ValuationRequest(BaseModel):
    nome_empresa: str
    fcf_inicial: float
    crescimento: float
    taxa_desconto: float
    anos_projecao: int
    crescimento_perpetuo: float
    divida: float
    caixa: float
    quantidade_acoes: int

class CashFlowItem(BaseModel):
    ano: int
    fluxo_projetado: float
    valor_presente: float

class ValuationResponse(BaseModel):
    empresa: str
    valuation_total: float
    valor_justo_acao: float
    valor_terminal: float
    valor_terminal_presente: float
    fluxos_projetados: List[CashFlowItem]
    mensagem: str = "Valuation calculado com sucesso"

@app.post("/calcular-valuation", response_model=ValuationResponse)
def calcular_valuation(req: ValuationRequest):
    # Chamada para o valuation.py
    import valuation
    resultado = valuation.calcular_dcf(req)
    return resultado`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(samplePythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="api-config-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="api-config-modal"
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-fadeIn"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Integração API Python + FastAPI</h3>
              <p className="text-xs text-slate-500">
                Alterne entre dados de demonstração (Mock) e o backend FastAPI local.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Seletor de Modo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Modo de Operação
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onModeChange('mock');
                  setApiConfig({ mode: 'mock' });
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  currentMode === 'mock'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/10'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-slate-900">Modo Mock (Demonstração)</span>
                  {currentMode === 'mock' && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Utiliza os dados demonstrativos isolados em <code className="text-slate-700 font-mono">data/mockValuation.ts</code> sem necessidade de backend rodando.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  onModeChange('fastapi');
                  setApiConfig({ mode: 'fastapi' });
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  currentMode === 'fastapi'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/10'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-slate-900">API FastAPI (Python)</span>
                  {currentMode === 'fastapi' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Realiza requisições HTTP reais para o endpoint local <code className="text-slate-700 font-mono">POST /calcular-valuation</code>.
                </p>
              </button>
            </div>
          </div>

          {/* Configuração do Endpoint */}
          <div className="space-y-2">
            <label htmlFor="api-base-url-input" className="block text-xs font-semibold text-slate-700">
              URL Base do Servidor FastAPI
            </label>
            <div className="flex items-center gap-2">
              <input
                id="api-base-url-input"
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://127.0.0.1:8000"
                className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Testar Conexão</span>
              </button>
            </div>

            {testResult === 'success' && (
              <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Servidor FastAPI detectado com sucesso.
              </p>
            )}
            {testResult === 'error' && (
              <p className="text-xs text-amber-600 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-4 h-4" />
                API não encontrada em {baseUrl}. Inicie seu servidor Python ou continue em modo Mock.
              </p>
            )}
          </div>

          {/* Estrutura do Endpoint e Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
                Contrato do Endpoint FastAPI esperado:
              </span>
              <button
                type="button"
                onClick={copyToClipboard}
                className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar Exemplo FastAPI'}
              </button>
            </div>

            <div className="bg-slate-900 rounded-lg p-3 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
              <pre>{samplePythonCode}</pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Endpoint ativo: <strong className="text-slate-700">{baseUrl}/calcular-valuation</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Confirmar Configuração
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
