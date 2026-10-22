"""Dados sintéticos e fornecedor simulado; não são cotações reais."""
import asyncio
import json
from unittest.mock import patch

import httpx
import pytest

from backend.api import app
from backend.valuation import calcular_valuation


BASE = dict(nome_empresa="Empresa de teste", fcf_inicial=1000, crescimento=.05,
            taxa_desconto=.12, anos_projecao=5, crescimento_perpetuo=.03,
            divida=200, caixa=100, quantidade_acoes=100, preco_atual=80,
            modelo_confirmado=True)


def call(method, path, **kwargs):
    async def send():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            return await client.request(method, path, **kwargs)
    return asyncio.run(send())


def test_formula_and_api_agree_with_independent_calculation():
    result = call("POST", "/api/calcular-valuation", json=BASE)
    assert result.status_code == 200
    r = result.json()
    flows = [1000 * 1.05 ** year / 1.12 ** year for year in range(1, 6)]
    terminal = (1000 * 1.05 ** 5 * 1.03 / .09) / 1.12 ** 5
    expected = (sum(flows) + terminal - 200 + 100) / 100
    assert r["valor_justo_acao"] == pytest.approx(expected)
    assert r["valuation_total"] == pytest.approx(r["valor_operacional"] - 100)
    assert r["potencial_valorizacao"] == pytest.approx((expected / 80 - 1) * 100)
    assert r["margem_seguranca"] == pytest.approx((expected - 80) / expected)
    assert r["cenarios"]["pessimista"] < r["cenarios"]["base"] < r["cenarios"]["otimista"]
    assert r["cenarios"]["base"] == r["valor_justo_acao"]
    assert len(r["fluxos_projetados"]) == 5
    assert "no-store" in result.headers["cache-control"]


@pytest.mark.parametrize("changes", [
    {"fcf_inicial": 0}, {"fcf_inicial": -1}, {"divida": None}, {"caixa": -1},
    {"quantidade_acoes": 0}, {"quantidade_acoes": 3.5}, {"preco_atual": 0},
    {"crescimento_perpetuo": .12}, {"taxa_desconto": 0}, {"anos_projecao": 26},
    {"anos_projecao": 1.5}, {"nome_empresa": " "}, {"modelo_confirmado": False},
    {"fcf_inicial": "NaN"}, {"taxa_desconto": "Infinity"}, {"extra": True},
])
def test_invalid_inputs_rejected_without_echoing_private_input(changes):
    r = call("POST", "/api/calcular-valuation", json={**BASE, **changes})
    assert r.status_code == 422
    assert "erros" in r.json()
    assert all(set(error) == {"campo", "mensagem"} for error in r.json()["erros"])
    assert BASE["nome_empresa"] not in r.text


def test_optional_reference_and_confirmed_zeros():
    r = call("POST", "/api/calcular-valuation", json={**BASE, "preco_atual": None, "caixa": 0, "divida": 0}).json()
    assert r["estimativa_positiva"]
    assert r["margem_seguranca"] is None
    assert r["potencial_valorizacao"] is None


@pytest.mark.parametrize("zero", [True, False])
def test_nonpositive_equity_has_no_target_or_division_error(zero):
    args = {k: v for k, v in BASE.items() if k not in ("nome_empresa", "preco_atual", "modelo_confirmado")}
    ev = calcular_valuation(**{**args, "divida": 0, "caixa": 0})["valor_empresa"]
    response = call("POST", "/api/calcular-valuation", json={**BASE, "caixa": 0, "divida": ev if zero else ev * 2})
    assert response.status_code == 200
    r = response.json()
    assert not r["estimativa_positiva"]
    assert (r["valor_justo_acao"] == pytest.approx(0) if zero else r["valor_justo_acao"] < 0)
    assert r["margem_seguranca"] is None and r["potencial_valorizacao"] is None
    assert r["avisos"]


def test_production_market_requires_explicit_enable(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")
    monkeypatch.delenv("ENABLE_MARKET_DATA", raising=False)
    assert not call("GET", "/api/health").json()["market_data_enabled"]
    assert call("GET", "/api/empresa/PETR4").status_code == 503
    assert call("POST", "/api/calcular-valuation", json=BASE).status_code == 200


@pytest.mark.parametrize("error,status", [(ValueError("Ticker inválido"), 422), (LookupError("Não encontrada"), 404), (TimeoutError(), 504), (RuntimeError("sensitive-provider-error"), 502)])
def test_provider_errors_are_mapped_and_sanitized(monkeypatch, error, status):
    monkeypatch.setenv("ENABLE_MARKET_DATA", "true")
    with patch("backend.api.buscar_dados_bolsa", side_effect=error):
        r = call("GET", "/api/empresa/TEST3")
    assert r.status_code == status
    assert "sensitive-provider-error" not in r.text


def test_search_endpoint(monkeypatch):
    monkeypatch.setenv("ENABLE_MARKET_DATA", "true")
    with patch("backend.api.pesquisar_empresas", return_value=[{"ticker": "TEST3", "nome": "Teste"}]):
        assert call("GET", "/api/empresas?q=teste").json()["empresas"][0]["ticker"] == "TEST3"
    assert call("GET", "/api/empresas?q=x").status_code == 422


def test_extreme_allowed_values_stay_finite():
    response = call("POST", "/api/calcular-valuation", json={**BASE, "fcf_inicial": 1e16, "crescimento": 1.5, "taxa_desconto": .12001, "crescimento_perpetuo": .12, "anos_projecao": 25})
    assert response.status_code == 200
    assert "Infinity" not in json.dumps(response.json())
