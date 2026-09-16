import React from 'react';
import { SCENARIO_PRESETS } from '../data/mockValuation';
import { ScenarioKey, ValuationFormState } from '../types/valuation';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { Shield, Target, Rocket, ArrowRight, Check } from 'lucide-react';

interface ScenariosViewProps {
  currentScenario: ScenarioKey;
  onSelectScenario: (scenarioKey: ScenarioKey, premissas: ValuationFormState) => void;
}

export const ScenariosView: React.FC<ScenariosViewProps> = ({
  currentScenario,
  onSelectScenario,
}) => {
  const scenariosList = [
    {
      key: 'conservative' as ScenarioKey,
      data: SCENARIO_PRESETS.conservative,
      icon: Shield,
      accent: 'border-amber-200 bg-amber-50/30 text-amber-900',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      key: 'base' as ScenarioKey,
      data: SCENARIO_PRESETS.base,
      icon: Target,
      accent: 'border-blue-200 bg-blue-50/30 text-blue-900',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      key: 'optimistic' as ScenarioKey,
      data: SCENARIO_PRESETS.optimistic,
      icon: Rocket,
      accent: 'border-emerald-200 bg-emerald-50/30 text-emerald-900',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
  ];

  return (
    <div id="scenarios-view-container" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Análise de Cenários Pré-configurados</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare o impacto de diferentes sensibilidades de crescimento e taxa de desconto.
          </p>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          3 Modelagens Demonstrativas
        </span>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenariosList.map(({ key, data, icon: Icon, accent, badge }) => {
            const isSelected = currentScenario === key;

            return (
              <div
                key={key}
                id={`scenario-card-${key}`}
                className={`rounded-xl border p-5 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-sm bg-white'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${badge}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {data.nome}
                    </span>
                    {isSelected && (
                      <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Ativo
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {data.descricao}
                  </p>

                  <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Crescimento (g):</span>
                      <span className="font-semibold text-slate-800 font-tabular">
                        {data.premissas.crescimento}% a.a.
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Taxa Desconto (WACC):</span>
                      <span className="font-semibold text-slate-800 font-tabular">
                        {data.premissas.taxaDesconto}% a.a.
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Perpetuidade (g):</span>
                      <span className="font-semibold text-slate-800 font-tabular">
                        {data.premissas.crescimentoPerpetuo}% a.a.
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Preço Justo Estimado
                    </span>
                    <span className="text-xl font-bold text-slate-900 font-tabular">
                      {formatCurrency(data.resultadoMock.valor_justo_acao)}
                    </span>
                  </div>
                </div>

                <button
                  id={`btn-apply-scenario-${key}`}
                  type="button"
                  onClick={() => onSelectScenario(key, data.premissas)}
                  className={`mt-4 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span>{isSelected ? 'Cenário Aplicado' : 'Carregar Premissas'}</span>
                  {!isSelected && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
