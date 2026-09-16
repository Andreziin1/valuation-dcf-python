import React, { useState } from 'react';
import { Header } from './components/Header';
import { ValuationForm } from './components/ValuationForm';
import { ResultsSummary } from './components/ResultsSummary';
import { ValuationCharts } from './components/ValuationCharts';
import { ProjectionsTable } from './components/ProjectionsTable';
import { ScenariosView } from './components/ScenariosView';
import { ApiConfigModal } from './components/ApiConfigModal';
import { Disclaimer } from './components/Disclaimer';
import {
  ValuationFormState,
  ValuationResponse,
  ScenarioKey,
  ApiMode,
} from './types/valuation';
import {
  DEFAULT_FORM_VALUES,
  MOCK_BASE_RESPONSE,
  SCENARIO_PRESETS,
} from './data/mockValuation';
import { validateValuationForm, prepareValuationPayload } from './utils/validation';
import { calcularValuation, getApiConfig } from './services/api';
import { Calculator, CheckCircle, Sliders } from 'lucide-react';

export default function App() {
  const [formState, setFormState] = useState<ValuationFormState>(DEFAULT_FORM_VALUES);
  const [valuationResult, setValuationResult] = useState<ValuationResponse>(MOCK_BASE_RESPONSE);
  const [currentScenario, setCurrentScenario] = useState<ScenarioKey>('base');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiMode, setApiMode] = useState<ApiMode>(getApiConfig().mode);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);

  // Manipulador principal de cálculo
  const handleCalculate = async (values: ValuationFormState) => {
    setErrorMessage(null);

    // 1. Validação no Frontend
    const { isValid, errors } = validateValuationForm(values);
    if (!isValid) {
      const firstError = Object.values(errors)[0];
      setErrorMessage(firstError || 'Verifique os dados informados.');
      return;
    }

    // 2. Preparação do Payload conforme contrato da API
    const payload = prepareValuationPayload(values);

    setIsLoading(true);
    try {
      // 3. Execução através da camada de serviço (Mock ou FastAPI)
      const response = await calcularValuation(payload);
      setValuationResult(response);
      setFormState(values);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Não foi possível realizar o cálculo. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega um cenário pré-configurado
  const handleSelectScenario = (key: ScenarioKey, premissas: ValuationFormState) => {
    setCurrentScenario(key);
    setFormState(premissas);
    setErrorMessage(null);

    // Se estiver em modo mock, já utiliza o resultado mockado correspondente ao cenário
    if (apiMode === 'mock') {
      const preset = SCENARIO_PRESETS[key];
      if (preset) {
        setValuationResult(preset.resultadoMock);
      }
    } else {
      // Em modo FastAPI, submete as premissas do cenário ao backend
      handleCalculate(premissas);
    }
  };

  return (
    <div id="finsight-app" className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header Superior da Plataforma */}
      <Header
        apiMode={apiMode}
        onOpenConfig={() => setIsConfigModalOpen(true)}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Informativo Superior */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Modelo de Fluxo de Caixa Descontado (DCF)
              </h1>
            </div>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Plataforma financeira de projeção e precificação intrínseca de ativos. Informe as premissas operacionais e de taxa de desconto para apurar o Enterprise Value e o Preço Justo por Ação.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-quick-config"
              onClick={() => setIsConfigModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Conexão FastAPI: {apiMode === 'fastapi' ? 'Ligada' : 'Mock'}</span>
            </button>
          </div>
        </div>

        {/* Layout Principal em Grid: Formulário de Entrada e Resultados */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna Esquerda: Formulário de Premissas (5 Colunas no Desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <ValuationForm
              key={JSON.stringify(formState)} // Força atualização quando mudar via cenários
              initialValues={formState}
              onSubmit={handleCalculate}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onClearError={() => setErrorMessage(null)}
            />

            {/* Cenários Pré-configurados abaixo do formulário */}
            <ScenariosView
              currentScenario={currentScenario}
              onSelectScenario={handleSelectScenario}
            />
          </div>

          {/* Coluna Direita: Resultados, Projeções e Gráficos (7 Colunas no Desktop) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Cards de Resultados Principais */}
            <ResultsSummary
              result={valuationResult}
              formState={formState}
            />

            {/* 2. Visualizações Gráficas (Evolução e Comparativo VP) */}
            <ValuationCharts
              fluxos={valuationResult.fluxos_projetados}
            />

            {/* 3. Tabela Detalhada de Projeções */}
            <ProjectionsTable
              fluxos={valuationResult.fluxos_projetados}
              wacc={formState.taxaDesconto}
            />
          </div>
        </div>
      </main>

      {/* Modal de Configuração da API FastAPI */}
      <ApiConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        currentMode={apiMode}
        onModeChange={(mode) => setApiMode(mode)}
      />

      {/* Disclaimer de Responsabilidade Financeira */}
      <Disclaimer />
    </div>
  );
}
