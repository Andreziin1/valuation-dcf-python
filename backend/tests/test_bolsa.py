from types import SimpleNamespace
from unittest.mock import patch

import pandas as pd
import pytest

from backend import bolsa


INFO = {"longName": "Empresa sintética", "quoteType": "EQUITY", "currency": "BRL", "financialCurrency": "BRL", "currentPrice": 10, "sharesOutstanding": 100, "totalDebt": 0, "totalCash": 20}


@pytest.fixture(autouse=True)
def clear_cache():
    bolsa._cache.clear()


def fake(info=None, flows=None):
    return SimpleNamespace(info=INFO if info is None else info, cashflow=pd.DataFrame() if flows is None else flows)


def test_fills_from_provider_and_preserves_zeros():
    df = pd.DataFrame({pd.Timestamp("2024-12-31"): [500], pd.Timestamp("2025-12-31"): [600]}, index=["Free Cash Flow"])
    with patch.object(bolsa.yf, "Ticker", return_value=fake(flows=df)):
        r = bolsa.buscar_dados_bolsa(" test3.sa ")
    assert r["fcf_inicial"] == 600 and r["fcf_periodo"] == "2025-12-31"
    assert r["divida"] == 0 and r["quantidade_acoes"] == 100
    assert r["ticker"] == "TEST3" and r["avisos"]


def test_missing_is_never_zero():
    with patch.object(bolsa.yf, "Ticker", return_value=fake({**INFO, "totalDebt": None, "totalCash": float("nan"), "sharesOutstanding": 0, "currentPrice": None})):
        r = bolsa.buscar_dados_bolsa("TEST3")
    for key in ("divida", "caixa", "quantidade_acoes", "preco_atual", "fcf_inicial"):
        assert r[key] is None


def test_different_financial_currency_does_not_mix_units():
    with patch.object(bolsa.yf, "Ticker", return_value=fake({**INFO, "financialCurrency": "USD"})):
        r = bolsa.buscar_dados_bolsa("TEST3")
    assert r["preco_atual"] == 10
    assert r["divida"] is r["caixa"] is r["fcf_inicial"] is None
    assert "convertidos" in r["avisos"][0]


def test_previous_close_is_labeled_without_fabricated_date():
    with patch.object(bolsa.yf, "Ticker", return_value=fake({**INFO, "currentPrice": None, "previousClose": 9, "regularMarketTime": 1000})):
        r = bolsa.buscar_dados_bolsa("TEST3")
    assert r["preco_tipo"] == "Fechamento anterior" and r["preco_atual"] == 9
    assert r["cotacao_em"] is None


@pytest.mark.parametrize("ticker", ["AAPL", "../x", "ABC3?", "<script>"])
def test_invalid_ticker(ticker):
    with pytest.raises(ValueError):
        bolsa.normalizar_ticker(ticker)


def test_equity_only_search_and_cache():
    quotes = [{"symbol": "TEST3.SA", "quoteType": "EQUITY", "longname": "Teste"}, {"symbol": "TEST11.SA", "quoteType": "ETF"}, {"symbol": "AAPL", "quoteType": "EQUITY"}]
    with patch.object(bolsa.yf, "Search", return_value=SimpleNamespace(quotes=quotes)) as provider:
        r = bolsa.pesquisar_empresas("teste")
        r.append({"ticker": "tamper"})
        assert bolsa.pesquisar_empresas("TESTE") == [{"ticker": "TEST3", "nome": "Teste"}]
        assert provider.call_count == 1


@pytest.mark.parametrize("info", [{}, {**INFO, "currency": "USD"}, {**INFO, "quoteType": "ETF"}])
def test_unknown_unsupported_or_wrong_quote_currency(info):
    with patch.object(bolsa.yf, "Ticker", return_value=fake(info)):
        with pytest.raises((LookupError, ValueError)):
            bolsa.buscar_dados_bolsa("TEST3")
