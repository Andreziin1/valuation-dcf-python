import React from 'react';
import { ValuationResponse, ValuationFormState } from '../types/valuation';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { DollarSign, Award, Target, Landmark, ArrowUpRight, TrendingUp } from 'lucide-react';

interface ResultsSummaryProps {
  result: ValuationResponse;
  formState: ValuationFormState;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({ result, formState }) => {
  // Cálculo de apoio para visualização de estrutura de valor
  const somaVPFluxos = result.fluxos_projetados.reduce((acc, curr) => acc + curr.valor_presente, 0);
  const percentualTerminal =
    result.valuation_total > 0
      ? ((result.valor_terminal_presente / result.valuation_total) * 100).toFixed(1)
      : '0';
  const percentualFluxos =
    result.valuation_total > 0
      ? ((somaVPFluxos / result.valuation_total) * 100).toFixed(1)
      : '0';

  // Equity Value = Enterprise Value - Dívida + Caixa
  const equityValue = result.valuation_total - (formState.divida || 0) + (formState.caixa || 0);

  return (
    <section id="results-summary-section" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Resultado da Avaliação
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {result.empresa}
          </h2>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 border border-slate-200">
          <span>{result.fluxos_projetados.length} Anos Projetados</span>
          <span className="text-slate-300">•</span>
          <span>WACC: {formState.taxaDesconto}%</span>
          <span className="text-slate-300">•</span>
          <span>g: {formState.crescimentoPerpetuo}%</span>
        </div>
      </div>

      {/* Grid de Cards Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Valor Justo por Ação (Destaque Principal) */}
        <div
          id="card-valor-justo-acao"
          className="bg-white rounded-xl p-5 border-2 border-blue-600 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
              Valor Justo por Ação
            </span>
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-tabular tracking-tight">
              {formatCurrency(result.valor_justo_acao)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span>Base: {formatNumber(formState.quantidadeAcoes)} ações</span>
          </p>
        </div>

        {/* Card 2: Valor da Empresa (Enterprise Value) */}
        <div
          id="card-valuation-total"
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Valor da Empresa (EV)
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-slate-900 font-tabular tracking-tight">
              {formatCurrency(result.valuation_total, false)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            VP dos Fluxos + VP da Perpetuidade
          </p>
        </div>

        {/* Card 3: Valor Terminal (Perpetuidade) */}
        <div
          id="card-valor-terminal"
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Valor Terminal (Nominal)
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-slate-900 font-tabular tracking-tight">
              {formatCurrency(result.valor_terminal, false)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Estimativa nominal ao final do ano {formState.anosProjecao}
          </p>
        </div>

        {/* Card 4: VP do Valor Terminal */}
        <div
          id="card-valor-terminal-presente"
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              VP do Valor Terminal
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-slate-900 font-tabular tracking-tight">
              {formatCurrency(result.valor_terminal_presente, false)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Representa <strong className="text-slate-700">{percentualTerminal}%</strong> do EV
          </p>
        </div>
      </div>

      {/* Barra estrutural de decomposição do Enterprise Value */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 mb-2 gap-1">
          <span className="font-semibold text-slate-800">Composição do Enterprise Value:</span>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
              VP Fluxos Explícitos ({percentualFluxos}%): {formatCurrency(somaVPFluxos, false)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-800" />
              VP Valor Terminal ({percentualTerminal}%): {formatCurrency(result.valor_terminal_presente, false)}
            </span>
          </div>
        </div>

        {/* Barra proporcional visual */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${percentualFluxos}%` }}
            className="h-full bg-blue-500 transition-all duration-500"
            title={`Fluxos explícitos: ${percentualFluxos}%`}
          />
          <div
            style={{ width: `${percentualTerminal}%` }}
            className="h-full bg-slate-800 transition-all duration-500"
            title={`Valor terminal descontado: ${percentualTerminal}%`}
          />
        </div>

        {/* Resumo da ponte de Equity */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-slate-100 text-xs text-slate-500">
          <div>
            <span>Enterprise Value:</span>
            <p className="font-semibold text-slate-800 font-tabular">{formatCurrency(result.valuation_total, false)}</p>
          </div>
          <div>
            <span>(-) Dívida:</span>
            <p className="font-semibold text-rose-700 font-tabular">- {formatCurrency(formState.divida, false)}</p>
          </div>
          <div>
            <span>(+) Caixa:</span>
            <p className="font-semibold text-emerald-700 font-tabular">+ {formatCurrency(formState.caixa, false)}</p>
          </div>
          <div>
            <span>(=) Equity Value:</span>
            <p className="font-semibold text-blue-900 font-tabular">{formatCurrency(equityValue, false)}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
