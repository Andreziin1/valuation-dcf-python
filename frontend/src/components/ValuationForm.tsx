import React, { useState } from 'react';
import {
  Building2,
  Percent,
  Calendar,
  Layers,
  Coins,
  DollarSign,
  HelpCircle,
  Loader2,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ValuationFormState, FormValidationErrors, CompanyType } from '../types/valuation';
import { DEFAULT_FORM_VALUES } from '../data/mockValuation';

interface ValuationFormProps {
  initialValues: ValuationFormState;
  onSubmit: (values: ValuationFormState) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  onClearError: () => void;
}

export const ValuationForm: React.FC<ValuationFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
  errorMessage,
  onClearError,
}) => {
  const [formData, setFormData] = useState<ValuationFormState>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FormValidationErrors>({});

  // Atualiza um campo com limpeza de erro associado
  const updateField = <K extends keyof ValuationFormState>(key: K, value: ValuationFormState[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (errorMessage) {
      onClearError();
    }
  };

  const handleResetDefaults = () => {
    setFormData(DEFAULT_FORM_VALUES);
    setFieldErrors({});
    onClearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    await onSubmit(formData);
  };

  return (
    <div id="valuation-form-container" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Form Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Premissas do Modelo DCF</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Insira os dados cadastrais, projeções de fluxo de caixa e estrutura de capital.
          </p>
        </div>
        <button
          id="btn-reset-form"
          type="button"
          onClick={handleResetDefaults}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Padrão</span>
        </button>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div
          id="form-error-banner"
          className="mx-6 mt-5 p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm animate-fadeIn"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Erro na operação</span>
            <span className="text-xs text-rose-700 leading-relaxed">{errorMessage}</span>
          </div>
        </div>
      )}

      <form id="valuation-main-form" onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* ========================================================================= */}
        {/* 1. IDENTIFICAÇÃO DA EMPRESA */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              1. Identificação da Empresa
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome da Empresa */}
            <div>
              <label htmlFor="input-nome-empresa" className="block text-xs font-semibold text-slate-700 mb-1">
                Nome da Empresa <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-nome-empresa"
                type="text"
                required
                maxLength={70}
                value={formData.nomeEmpresa}
                onChange={(e) => updateField('nomeEmpresa', e.target.value)}
                placeholder="Ex: Empresa Teste S.A."
                className={`w-full px-3 py-2 text-sm bg-slate-50/50 border rounded-lg focus:outline-hidden focus:ring-2 transition-all ${
                  fieldErrors.nomeEmpresa
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
              />
              {fieldErrors.nomeEmpresa && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.nomeEmpresa}</p>
              )}
            </div>

            {/* Tipo de Empresa */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Empresa
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-type-listed"
                  onClick={() => updateField('tipoEmpresa', 'listed' as CompanyType)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                    formData.tipoEmpresa === 'listed'
                      ? 'bg-blue-50 border-blue-300 text-blue-800 ring-1 ring-blue-300 font-semibold'
                      : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Listada na Bolsa
                </button>
                <button
                  type="button"
                  id="btn-type-private"
                  onClick={() => updateField('tipoEmpresa', 'private' as CompanyType)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                    formData.tipoEmpresa === 'private'
                      ? 'bg-blue-50 border-blue-300 text-blue-800 ring-1 ring-blue-300 font-semibold'
                      : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Privada / Manual
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {formData.tipoEmpresa === 'listed'
                  ? 'Adequada para companhias abertas com ações negociadas em bolsa.'
                  : 'Para companhias fechadas, startups ou sociedades limitadas.'}
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. PREMISSAS DO VALUATION (DCF) */}
        {/* ========================================================================= */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Percent className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              2. Premissas de Fluxo de Caixa e Desconto
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* FCF Inicial */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="input-fcf-inicial" className="text-xs font-semibold text-slate-700">
                  FCF Inicial (Ano 0) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500" title="Fluxo de Caixa Livre do último exercício">
                  R$
                </span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-slate-400">
                  R$
                </span>
                <input
                  id="input-fcf-inicial"
                  type="number"
                  step="any"
                  min="1"
                  required
                  value={formData.fcfInicial || ''}
                  onChange={(e) => updateField('fcfInicial', Number(e.target.value))}
                  placeholder="500000"
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-slate-50/50 border rounded-lg focus:outline-hidden focus:ring-2 font-tabular ${
                    fieldErrors.fcfInicial
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Fluxo de caixa livre operacional base.
              </p>
              {fieldErrors.fcfInicial && (
                <p className="text-xs text-rose-600 mt-0.5">{fieldErrors.fcfInicial}</p>
              )}
            </div>

            {/* Crescimento Esperado */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="input-crescimento" className="text-xs font-semibold text-slate-700">
                  Crescimento Esperado <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">% a.a.</span>
              </div>
              <div className="relative">
                <input
                  id="input-crescimento"
                  type="number"
                  step="0.1"
                  min="-50"
                  max="150"
                  required
                  value={formData.crescimento !== undefined ? formData.crescimento : ''}
                  onChange={(e) => updateField('crescimento', Number(e.target.value))}
                  placeholder="8.0"
                  className={`w-full pr-8 pl-3 py-2 text-sm bg-slate-50/50 border rounded-lg focus:outline-hidden focus:ring-2 font-tabular ${
                    fieldErrors.crescimento
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-semibold text-slate-400">
                  %
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Taxa média de expansão no período explícito.
              </p>
              {fieldErrors.crescimento && (
                <p className="text-xs text-rose-600 mt-0.5">{fieldErrors.crescimento}</p>
              )}
            </div>

            {/* Taxa de Desconto (WACC) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="input-taxa-desconto" className="text-xs font-semibold text-slate-700">
                  Taxa de Desconto (WACC) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">% a.a.</span>
              </div>
              <div className="relative">
                <input
                  id="input-taxa-desconto"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="60"
                  required
                  value={formData.taxaDesconto !== undefined ? formData.taxaDesconto : ''}
                  onChange={(e) => updateField('taxaDesconto', Number(e.target.value))}
                  placeholder="12.0"
                  className={`w-full pr-8 pl-3 py-2 text-sm bg-slate-50/50 border rounded-lg focus:outline-hidden focus:ring-2 font-tabular ${
                    fieldErrors.taxaDesconto
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-semibold text-slate-400">
                  %
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Custo Médio Ponderado de Capital (WACC).
              </p>
              {fieldErrors.taxaDesconto && (
                <p className="text-xs text-rose-600 mt-0.5">{fieldErrors.taxaDesconto}</p>
              )}
            </div>

            {/* Anos de Projeção */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="input-anos-projecao" className="text-xs font-semibold text-slate-700">
                  Anos de Projeção <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">anos</span>
              </div>
              <div className="relative">
                <input
                  id="input-anos-projecao"
                  type="number"
                  min="1"
                  max="25"
                  required
                  value={formData.anosProjecao || ''}
                  onChange={(e) => updateField('anosProjecao', Math.floor(Number(e.target.value)))}
                  placeholder="5"
                  className={`w-full pl-3 pr-3 py-2 text-sm bg-slate-50/50 border rounded-lg focus:outline-hidden focus:ring-2 font-tabular ${
                    fieldErrors.anosProjecao
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Horizonte de projeção detalhada (ex: 5 anos).
              </p>
              {fieldErrors.anosProjecao && (
                <p className="text-xs text-rose-600 mt-0.5">{fieldErrors.anosProjecao}</p>
              )}
            </div>

            {/* Crescimento Perpétuo (g) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="input-crescimento-perpetuo" className="text-xs font-semibold text-slate-700">
                  Crescimento Perpétuo (g) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">% a.a.</span>
              </div>
              <div className="relative">
                <input
                  id="input-crescimento-perpetuo"
                  type="number"
                  step="0.1"
                  min="0"
                  max="12"
                  required
                  value={formData.crescimentoPerpetuo !== undefined ? formData.crescimentoPerpetuo : ''}
                  onChange={(e) => updateField('crescimentoPerpetuo', Number(e.target.value))}
                  placeholder="3.0"
                  className={`w-full pr-8 pl-3 py-2 text-sm bg-slate-50/50 border rounded-lg focus:outline-hidden focus:ring-2 font-tabular ${
                    fieldErrors.crescimentoPerpetuo
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-semibold text-slate-400">
                  %
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Crescimento estável a longo prazo (&lt; WACC).
              </p>
              {fieldErrors.crescimentoPerpetuo && (
                <p className="text-xs text-rose-600 mt-0.5">{fieldErrors.crescimentoPerpetuo}</p>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. ESTRUTURA FINANCEIRA E CAPITAL */}
        {/* ========================================================================= */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Coins className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              3. Estrutura Financeira e Ações
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Dívida */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="input-divida" className="text-xs font-semibold text-slate-700">
                  Dívida Total <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">R$</span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-slate-400">
                  R$
                </span>
                <input
                  id="input-divida"
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={formData.divida !== undefined ? formData.divida : ''}
                  onChange={(e) => updateField('divida', Number(e.target.value))}
                  placeholder="100000"
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-slate-50/50 border rounded-lg focus:outline-hidden focus:ring-2 font-tabular ${
                    fieldErrors.divida
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Dívida financeira onerosa de curto e longo prazo.
              </p>
              {fieldErrors.divida && (
                <p className="text-xs text-rose-600 mt-0.5">{fieldErrors.divida}</p>
              )}
            </div>

            {/* Caixa */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="input-caixa" className="text-xs font-semibold text-slate-700">
                  Caixa e Equivalentes <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">R$</span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-slate-400">
                  R$
                </span>
                <input
                  id="input-caixa"
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={formData.caixa !== undefined ? formData.caixa : ''}
                  onChange={(e) => updateField('caixa', Number(e.target.value))}
                  placeholder="50000"
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-slate-50/50 border rounded-lg focus:outline-hidden focus:ring-2 font-tabular ${
                    fieldErrors.caixa
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Disponibilidades e aplicações de liquidez imediata.
              </p>
              {fieldErrors.caixa && (
                <p className="text-xs text-rose-600 mt-0.5">{fieldErrors.caixa}</p>
              )}
            </div>

            {/* Quantidade de Ações */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="input-quantidade-acoes" className="text-xs font-semibold text-slate-700">
                  Quantidade de Ações <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">unid.</span>
              </div>
              <div className="relative">
                <input
                  id="input-quantidade-acoes"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={formData.quantidadeAcoes || ''}
                  onChange={(e) => updateField('quantidadeAcoes', Math.floor(Number(e.target.value)))}
                  placeholder="100000"
                  className={`w-full pl-3 pr-3 py-2 text-sm bg-slate-50/50 border rounded-lg focus:outline-hidden focus:ring-2 font-tabular ${
                    fieldErrors.quantidadeAcoes
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Total de ações emitidas (utilizado para valor por ação).
              </p>
              {fieldErrors.quantidadeAcoes && (
                <p className="text-xs text-rose-600 mt-0.5">{fieldErrors.quantidadeAcoes}</p>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BOTÃO PRINCIPAL DE CÁLCULO */}
        {/* ========================================================================= */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Payload pronto para:</span>{' '}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-800 font-mono">
              POST /calcular-valuation
            </code>
          </div>

          <button
            id="btn-calcular-valuation"
            type="submit"
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer ${
              isLoading
                ? 'bg-blue-400 text-white cursor-not-allowed opacity-90'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-600/20 hover:shadow-md'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Processando valuation...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Calcular Valuation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
