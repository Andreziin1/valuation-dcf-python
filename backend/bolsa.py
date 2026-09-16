import yfinance as yf


def buscar_dados_bolsa(ticker):
    empresa = yf.Ticker(ticker)

    dados = empresa.info

    return {
        "ticker": ticker,
        "preco_atual": dados.get("currentPrice"),
        "divida": dados.get("totalDebt"),
        "caixa": dados.get("totalCash"),
        "quantidade_acoes": dados.get("sharesOutstanding")
    }