import React, { useState } from 'react';
import { CashFlowItem } from '../types/valuation';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import { BarChart3, LineChart, TrendingUp, Info } from 'lucide-react';

interface ValuationChartsProps {
  fluxos: CashFlowItem[];
}

export const ValuationCharts: React.FC<ValuationChartsProps> = ({ fluxos }) => {
  const [activeTab, setActiveTab] = useState<'both' | 'evolution' | 'comparison'>('both');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!fluxos || fluxos.length === 0) return null;

  // Dimensões padrão SVG
  const width = 500;
  const height = 260;
  const padding = { top: 30, right: 20, bottom: 40, left: 65 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Valores máximos para escala Y
  const maxFluxo = Math.max(...fluxos.map((f) => f.fluxo), 1);
  const maxValorPresente = Math.max(...fluxos.map((f) => f.valor_presente), 1);
  const maxY = Math.max(maxFluxo, maxValorPresente) * 1.15; // 15% de margem no topo

  const getX = (index: number) => {
    return padding.left + (index + 0.5) * (chartWidth / fluxos.length);
  };

  const getY = (val: number) => {
    return padding.top + chartHeight - (val / maxY) * chartHeight;
  };

  // Pontos da linha de evolução
  const linePoints = fluxos
    .map((f, i) => `${getX(i)},${getY(f.fluxo)}`)
    .join(' ');

  // Linha de área sombreada
  const areaPoints = `${getX(0)},${padding.top + chartHeight} ${linePoints} ${getX(
    fluxos.length - 1
  )},${padding.top + chartHeight}`;

  return (
    <div id="valuation-charts-container" className="space-y-4">
      {/* Header dos Gráficos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Visualizações Financeiras do DCF
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Análise gráfica do crescimento nominal e do desconto a valor presente.
          </p>
        </div>

        {/* Tabs switcher */}
        <div className="inline-flex p-1 bg-slate-200/70 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('both')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'both'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ambos os Gráficos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('evolution')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'evolution'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Evolução
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Comparativo VP
          </button>
        </div>
      </div>

      {/* Grid de Gráficos */}
      <div
        className={`grid gap-4 ${
          activeTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* ========================================================================= */}
        {/* GRÁFICO 1: Evolução dos fluxos de caixa projetados */}
        {/* ========================================================================= */}
        {(activeTab === 'both' || activeTab === 'evolution') && (
          <div
            id="chart-evolucao-fluxos"
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">
                  Gráfico 1: Evolução dos fluxos de caixa projetados
                </span>
                <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Fluxos Anuais
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Trajetória da geração de caixa ao longo do período explícito de projeção.
              </p>
            </div>

            <div className="relative w-full aspect-[500/260] overflow-visible">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full overflow-visible"
              >
                {/* Linhas de Grade Y */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const yVal = maxY * ratio;
                  const yPos = getY(yVal);
                  return (
                    <g key={ratio}>
                      <line
                        x1={padding.left}
                        y1={yPos}
                        x2={width - padding.right}
                        y2={yPos}
                        stroke="#e2e8f0"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={padding.left - 8}
                        y={yPos + 4}
                        textAnchor="end"
                        className="text-[10px] fill-slate-400 font-tabular"
                      >
                        {formatCompactCurrency(yVal)}
                      </text>
                    </g>
                  );
                })}

                {/* Área preenchida */}
                <polygon
                  points={areaPoints}
                  fill="rgba(59, 130, 246, 0.08)"
                />

                {/* Linha de projeção */}
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Pontos interativos */}
                {fluxos.map((f, i) => {
                  const cx = getX(i);
                  const cy = getY(f.fluxo);
                  const isHovered = hoveredIndex === i;

                  return (
                    <g
                      key={f.ano}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Eixo X labels */}
                      <text
                        x={cx}
                        y={height - 15}
                        textAnchor="middle"
                        className={`text-[11px] font-semibold ${
                          isHovered ? 'fill-blue-600 font-bold' : 'fill-slate-500'
                        }`}
                      >
                        Ano {f.ano}
                      </text>

                      {/* Círculo do ponto */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 6 : 4}
                        fill={isHovered ? '#1d4ed8' : '#2563eb'}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all"
                      />

                      {/* Valor sobre o ponto */}
                      <text
                        x={cx}
                        y={cy - 10}
                        textAnchor="middle"
                        className={`text-[10px] font-bold font-tabular ${
                          isHovered ? 'fill-blue-700' : 'fill-slate-700'
                        }`}
                      >
                        {formatCompactCurrency(f.fluxo)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-blue-600 inline-block" />
                Fluxo Nominal Projetado
              </span>
              <span>Total: {formatCurrency(fluxos.reduce((a, b) => a + b.fluxo, 0), false)}</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* GRÁFICO 2: Fluxo projetado x Valor presente */}
        {/* ========================================================================= */}
        {(activeTab === 'both' || activeTab === 'comparison') && (
          <div
            id="chart-comparativo-vp"
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">
                  Gráfico 2: Fluxo projetado x Valor presente
                </span>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Comparação de Desconto
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Efeito do custo de oportunidade temporal descontando os fluxos futuros.
              </p>
            </div>

            <div className="relative w-full aspect-[500/260] overflow-visible">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full overflow-visible"
              >
                {/* Linhas de Grade Y */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const yVal = maxY * ratio;
                  const yPos = getY(yVal);
                  return (
                    <g key={ratio}>
                      <line
                        x1={padding.left}
                        y1={yPos}
                        x2={width - padding.right}
                        y2={yPos}
                        stroke="#e2e8f0"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={padding.left - 8}
                        y={yPos + 4}
                        textAnchor="end"
                        className="text-[10px] fill-slate-400 font-tabular"
                      >
                        {formatCompactCurrency(yVal)}
                      </text>
                    </g>
                  );
                })}

                {/* Barras agrupadas para cada ano */}
                {fluxos.map((f, i) => {
                  const groupCenterX = getX(i);
                  const barWidth = Math.min(chartWidth / (fluxos.length * 3.2), 22);

                  const x1 = groupCenterX - barWidth - 2;
                  const y1 = getY(f.fluxo);
                  const h1 = padding.top + chartHeight - y1;

                  const x2 = groupCenterX + 2;
                  const y2 = getY(f.valor_presente);
                  const h2 = padding.top + chartHeight - y2;

                  const isHovered = hoveredIndex === i;

                  return (
                    <g
                      key={f.ano}
                      className="cursor-pointer transition-opacity"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      opacity={hoveredIndex !== null && !isHovered ? 0.6 : 1}
                    >
                      {/* Eixo X labels */}
                      <text
                        x={groupCenterX}
                        y={height - 15}
                        textAnchor="middle"
                        className={`text-[11px] font-semibold ${
                          isHovered ? 'fill-blue-600 font-bold' : 'fill-slate-500'
                        }`}
                      >
                        Ano {f.ano}
                      </text>

                      {/* Barra 1: Fluxo Nominal */}
                      <rect
                        x={x1}
                        y={y1}
                        width={barWidth}
                        height={Math.max(h1, 2)}
                        rx={3}
                        fill="#3b82f6"
                        className="transition-all"
                      />

                      {/* Barra 2: Valor Presente */}
                      <rect
                        x={x2}
                        y={y2}
                        width={barWidth}
                        height={Math.max(h2, 2)}
                        rx={3}
                        fill="#0f172a"
                        className="transition-all"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legenda e resumo */}
            <div className="flex flex-wrap items-center justify-between pt-3 mt-2 border-t border-slate-100 text-xs text-slate-600 gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-blue-500" />
                  Fluxo Projetado (Nominal)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-slate-900" />
                  Valor Presente (VP)
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Passe o mouse para comparar
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
