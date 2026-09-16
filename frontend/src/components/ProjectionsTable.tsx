import React from 'react';
import { CashFlowItem } from '../types/valuation';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { Calendar, ArrowDownRight, Layers } from 'lucide-react';

interface ProjectionsTableProps {
  fluxos: CashFlowItem[];
  wacc: number;
}

export const ProjectionsTable: React.FC<ProjectionsTableProps> = ({ fluxos, wacc }) => {
  const totalFluxoNominal = fluxos.reduce((acc, f) => acc + f.fluxo_projetado, 0);
  const totalValorPresente = fluxos.reduce((acc, f) => acc + f.valor_presente, 0);

  return (
    <div id="projections-table-container" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Projeção dos Fluxos de Caixa Explícitos</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Fluxos nominais descontados pela taxa WACC ({wacc}% a.a.)
          </p>
        </div>
        <div className="text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md font-medium">
          {fluxos.length} períodos anuais
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table id="table-fluxos-dcf" className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-700 text-xs uppercase tracking-wider font-semibold">
              <th className="py-3 px-6">Ano</th>
              <th className="py-3 px-6 text-right">Fluxo Projetado (Nominal)</th>
              <th className="py-3 px-6 text-right hidden sm:table-cell">Fator de Desconto</th>
              <th className="py-3 px-6 text-right">Valor Presente (VP)</th>
              <th className="py-3 px-6 text-right hidden md:table-cell">Desconto Acumulado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {fluxos.map((item) => {
              const fatorDesconto = Math.pow(1 + wacc / 100, item.ano);
              const diferenca = item.fluxo_projetado - item.valor_presente;
              const percentualDesconto = item.fluxo_projetado > 0 ? (diferenca / item.fluxo_projetado) * 100 : 0;

              return (
                <tr
                  key={item.ano}
                  id={`row-ano-${item.ano}`}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs flex items-center justify-center font-bold">
                      {item.ano}
                    </span>
                    <span>Ano {item.ano}</span>
                  </td>
                  <td className="py-3.5 px-6 text-right font-medium text-slate-900 font-tabular">
                    {formatCurrency(item.fluxo_projetado)}
                  </td>
                  <td className="py-3.5 px-6 text-right text-xs text-slate-500 font-tabular hidden sm:table-cell">
                    {(1 / fatorDesconto).toFixed(4)}x
                  </td>
                  <td className="py-3.5 px-6 text-right font-bold text-blue-950 font-tabular">
                    {formatCurrency(item.valor_presente)}
                  </td>
                  <td className="py-3.5 px-6 text-right text-xs text-rose-700 font-tabular hidden md:table-cell">
                    <span className="inline-flex items-center gap-1">
                      <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                      -{percentualDesconto.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t-2 border-slate-200 text-slate-900 font-semibold text-sm">
              <td className="py-3.5 px-6">
                Total Período Explícito
              </td>
              <td className="py-3.5 px-6 text-right font-tabular">
                {formatCurrency(totalFluxoNominal)}
              </td>
              <td className="py-3.5 px-6 text-right text-xs text-slate-500 hidden sm:table-cell">
                —
              </td>
              <td className="py-3.5 px-6 text-right font-bold text-blue-600 font-tabular">
                {formatCurrency(totalValorPresente)}
              </td>
              <td className="py-3.5 px-6 text-right text-xs text-slate-500 hidden md:table-cell">
                —
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
