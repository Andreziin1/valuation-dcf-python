import React from 'react';
import { TrendingUp, ShieldCheck, Server, Settings2 } from 'lucide-react';
import { ApiMode } from '../types/valuation';

interface HeaderProps {
  apiMode: ApiMode;
  onOpenConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({ apiMode, onOpenConfig }) => {
  return (
    <header id="finsight-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm ring-1 ring-slate-800">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">FinSight</span>
                <span className="hidden sm:inline-flex text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  DCF Valuation
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Análise Financeira e Estimativa de Fluxo de Caixa Descontado
              </p>
            </div>
          </div>

          {/* Right Actions & API Status */}
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div
              id="api-status-badge"
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                apiMode === 'fastapi'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  apiMode === 'fastapi' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="hidden sm:inline">
                {apiMode === 'fastapi' ? 'FastAPI Python (Ativo)' : 'Modo Mock (Demonstração)'}
              </span>
              <span className="sm:hidden">
                {apiMode === 'fastapi' ? 'FastAPI' : 'Mock'}
              </span>
            </div>

            {/* Config & Instructions button */}
            <button
              id="btn-open-api-config"
              onClick={onOpenConfig}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              title="Configurar endpoint do backend FastAPI"
            >
              <Settings2 className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Conexão API</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
