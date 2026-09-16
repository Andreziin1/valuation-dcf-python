import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const Disclaimer: React.FC = () => {
  return (
    <footer id="financial-disclaimer" className="mt-8 pt-6 pb-12 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
        <p className="text-xs font-semibold text-slate-700">
          Estimativa de valuation baseada nas premissas informadas.
        </p>
        <p className="text-[11px] text-slate-500 leading-relaxed max-w-2xl mx-auto">
          Os resultados são estimativas baseadas nas premissas fornecidas e não constituem recomendação financeira ou de investimento. O método de Fluxo de Caixa Descontado (DCF) depende de projeções futuras sujeitas a incertezas econômicas e de mercado.
        </p>
        <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span>FinSight © {new Date().getFullYear()}</span>
          <span>•</span>
          <span>Arquitetura Desacoplada (Frontend React + FastAPI Python)</span>
        </div>
      </div>
    </footer>
  );
};
