# Valuation DCF Python

Sistema de Valuation por Fluxo de Caixa Descontado (DCF) desenvolvido em Python.

O projeto permite calcular o valor justo de empresas utilizando projeções financeiras, margem de segurança e cenários automáticos de valuation.

Além disso, o sistema possui integração com API da bolsa através do yfinance, permitindo buscar automaticamente dados financeiros de empresas listadas.

---

# Funcionalidades

* Valuation por Fluxo de Caixa Descontado (DCF)
* Integração com API da bolsa utilizando yfinance
* Suporte para empresas listadas e não listadas
* Cálculo de valor justo por ação
* Cálculo de margem de segurança
* Potencial de valorização
* Cenários automáticos:

  * Pessimista
  * Base
  * Otimista
* Geração automática de relatório TXT
* Interface simples via terminal

---

# Conceitos Financeiros Utilizados

## Fluxo de Caixa Descontado (DCF)

O método DCF (Discounted Cash Flow) é utilizado para estimar o valor justo de uma empresa com base nos fluxos de caixa futuros esperados, descontados a valor presente.

O modelo considera:

* crescimento esperado;
* taxa de desconto;
* valor terminal;
* projeções financeiras.

---

## Taxa de Desconto

A taxa de desconto representa o risco do investimento e o custo de oportunidade do capital.

Neste projeto, ela é composta por:

```text id="8qu9ts"
Taxa Selic + Prêmio de risco
```

Quanto maior a taxa de desconto:

* maior o risco;
* menor tende a ser o valuation.

---

## Valor Terminal

O valor terminal representa o valor da empresa após o período de projeção, considerando crescimento perpétuo.

Ele normalmente representa grande parte do valuation total da empresa.

---

## Margem de Segurança

A margem de segurança mede a diferença entre:

* o preço atual da ação;
* o valor justo calculado.

Ela ajuda a identificar possíveis ativos descontados.

---

## Potencial de Valorização

O potencial de valorização representa quanto a ação pode subir em relação ao preço atual, baseado no valuation calculado.

---

## Cenários Automáticos

O sistema gera automaticamente três cenários:

* Pessimista
* Base
* Otimista

Isso permite visualizar diferentes possibilidades de crescimento da empresa.

---

# Tecnologias Utilizadas

* Python
* yfinance

---

# Estrutura do Projeto


<img width="301" height="187" alt="Captura de tela 2026-06-01 130146" src="https://github.com/user-attachments/assets/80b5de9b-ab28-41ff-9469-63c8f6a60be1" />

---

# Como Executar

Clone o repositório:

```bash id="6c4u4g"
git clone https://github.com/SEU-USUARIO/valuation-dcf-python.git
```

Entre na pasta:

```bash id="i5c5j7"
cd valuation-dcf-python
```

Instale as dependências:

```bash id="r4zdhj"
pip install -r requirements.txt
```

Execute o projeto:

```bash id="74i4ot"
python main.py
```

---

# Exemplo de Uso

```text id="vb7zhg"
1 - Empresa listada na bolsa
2 - Empresa não listada / análise manual
```

Caso escolha empresa listada:

```text id="hrp6ht"
Ticker da empresa: VALE3.SA
```

O sistema irá buscar automaticamente:

* preço atual;
* dívida;
* caixa;
* quantidade de ações.

Depois disso, basta informar as projeções financeiras.

---

# Exemplo de Resultado

```text id="q72m8y"
Preço atual da ação: R$ 80,86
Preço justo calculado: R$ 108,70
Potencial de valorização: 34,42%
Margem de segurança: 25,61%
Diagnóstico: A ação aparenta estar descontada.
```

---

# Melhorias Futuras

* Dashboard com Streamlit
* Gráficos automáticos
* Histórico de análises
* Exportação em PDF
* Mais indicadores financeiros
* Interface web

---

# Objetivo do Projeto

O objetivo deste projeto é praticar conceitos de:

* análise financeira;
* valuation;
* integração com APIs;
* estruturação de projetos Python;
* automação de análises financeiras.

---

# Autor

André Luiz
