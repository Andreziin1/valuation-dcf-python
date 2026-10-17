"""Adaptador Yahoo Finance: ausente é None, nunca zero presumido."""
import math
import os
import re
import tempfile
import threading
import time
from copy import deepcopy
from datetime import datetime, timezone

import yfinance as yf

yf.set_tz_cache_location(os.path.join(tempfile.gettempdir(), "nexodcf-yfinance"))
_cache = {}
_lock = threading.Lock()


def numero(valor, minimo=None):
    if valor is None or isinstance(valor, bool):
        return None
    try:
        result = float(valor)
    except (TypeError, ValueError, OverflowError):
        return None
    if not math.isfinite(result) or (minimo is not None and result < minimo):
        return None
    return result


def normalizar_ticker(ticker):
    ticker = ticker.strip().upper().removesuffix(".SA")
    if not re.fullmatch(r"[A-Z]{4}\d{1,2}", ticker):
        raise ValueError("Informe um ticker brasileiro, como PETR4 ou VALE3.")
    return ticker + ".SA"


def _memo(chave, funcao):
    agora = time.monotonic()
    with _lock:
        registro = _cache.get(chave)
        if registro and agora - registro[0] < 300:
            return deepcopy(registro[1])
    result = funcao()
    with _lock:
        if len(_cache) >= 128:
            _cache.pop(next(iter(_cache)))
        _cache[chave] = (time.monotonic(), deepcopy(result))
    return result


def pesquisar_empresas(query):
    query = query.strip()
    if len(query) < 2:
        raise ValueError("Digite pelo menos dois caracteres.")
    def carregar():
        quotes = yf.Search(query, max_results=15, news_count=0, timeout=15).quotes
        return [{"ticker": q["symbol"].removesuffix(".SA"),
                 "nome": q.get("longname") or q.get("shortname") or q["symbol"]}
                for q in quotes if q.get("symbol", "").endswith(".SA") and q.get("quoteType") == "EQUITY"][:8]
    return _memo(("busca", query.casefold()), carregar)


def _data_epoch(value):
    try:
        return datetime.fromtimestamp(float(value), timezone.utc).isoformat() if value else None
    except (ValueError, TypeError, OverflowError, OSError):
        return None


def buscar_dados_bolsa(ticker):
    symbol = normalizar_ticker(ticker)
    return _memo(("empresa", symbol), lambda: _carregar_empresa(symbol))


def _carregar_empresa(symbol):
    empresa = yf.Ticker(symbol)
    dados = empresa.info or {}
    if not (dados.get("longName") or dados.get("shortName")):
        raise LookupError("Empresa não encontrada. Confira o ticker.")
    if dados.get("quoteType") not in (None, "EQUITY"):
        raise ValueError("Este modelo é para empresas. Fundos e ETFs não são suportados.")
    if dados.get("currency") != "BRL":
        raise ValueError("Não foi possível confirmar a cotação em reais. O modelo não faz conversão de moeda.")
    preco, tipo = None, None
    for campo, label in [("currentPrice", "Cotação informada"), ("regularMarketPrice", "Cotação informada"), ("previousClose", "Fechamento anterior")]:
        candidate = numero(dados.get(campo), 0.00000001)
        if candidate is not None:
            preco, tipo = candidate, label
            break
    moeda_financeira = dados.get("financialCurrency")
    financeiro_brl = moeda_financeira == "BRL"
    avisos = []
    fcf, fcf_periodo = None, None
    if financeiro_brl:
        try:
            df = empresa.cashflow
            if df is not None and not df.empty and "Free Cash Flow" in df.index:
                for periodo in sorted(df.columns, reverse=True):
                    valor = numero(df.loc["Free Cash Flow", periodo])
                    if valor is not None:
                        fcf, fcf_periodo = valor, str(periodo.date())
                        break
        except Exception:
            avisos.append("O demonstrativo de fluxo de caixa não pôde ser consultado.")
    else:
        avisos.append("Moeda dos demonstrativos não confirmada em BRL: informe fluxo, dívida e caixa em reais; os valores não foram convertidos.")
    acoes = numero(dados.get("sharesOutstanding"), 1)
    if acoes is not None and (not acoes.is_integer() or acoes > 9_007_199_254_740_991):
        acoes = None
    result = {
        "ticker": symbol.removesuffix(".SA"), "ticker_yfinance": symbol,
        "nome_empresa": dados.get("longName") or dados.get("shortName"),
        "preco_atual": preco, "preco_tipo": tipo,
        "cotacao_em": _data_epoch(dados.get("regularMarketTime")) if tipo != "Fechamento anterior" else None,
        "consultado_em": datetime.now(timezone.utc).isoformat(),
        "divida": numero(dados.get("totalDebt"), 0) if financeiro_brl else None,
        "caixa": numero(dados.get("totalCash"), 0) if financeiro_brl else None,
        "quantidade_acoes": int(acoes) if acoes is not None else None,
        "fcf_inicial": fcf, "fcf_periodo": fcf_periodo,
        "balanco_em": _data_epoch(dados.get("mostRecentQuarter")),
        "setor": dados.get("sector"), "moeda": "BRL",
        "moeda_financeira": moeda_financeira, "fonte": "Yahoo Finance via yfinance",
        "avisos": avisos,
    }
    if fcf is not None:
        avisos.append("O Free Cash Flow do fornecedor não é automaticamente FCFF. Confira ou ajuste sua compatibilidade com o modelo antes de calcular.")
    if dados.get("sector") == "Financial Services":
        avisos.append("Bancos e seguradoras exigem modelos específicos. Este DCF genérico não é adequado sem revisão especializada.")
    if symbol.endswith("11.SA"):
        avisos.append("Se este ativo for uma unit, a divisão por sharesOutstanding pode não representar o preço da unit. Confira a base de unidades.")
    return result
