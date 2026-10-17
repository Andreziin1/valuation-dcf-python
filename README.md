# NexoDCF

Calculadora de valuation por Fluxo de Caixa Descontado (DCF), desenvolvida no projeto de André Luiz. A interface destaca o **valor estimado por ação/cota**, o preço de referência e a diferença entre eles.

## O que esta versão faz

- Empresa listada: busca por nome ou ticker brasileiro, preenchimento dos dados disponíveis e identificação da fonte.
- Empresa não listada: preenchimento manual, com preço de referência opcional.
- Dados ausentes ficam em branco; zero só é usado quando fornecido ou informado.
- Crescimento e desconto são premissas do usuário. O período começa em 5 anos e pode ser alterado.
- Resultados, cenários e projeções são calculados no backend. Não há resultados fictícios na aplicação.
- Cenários, gráfico e memória do cálculo ficam em seções recolhidas.
- Relatório TXT baixado pelo navegador; análises não são gravadas em banco de dados.
- Paleta clara, layout responsivo, sem animações, símbolo próprio e favicon NexoDCF.

**É uma estimativa condicionada às premissas, não previsão de cotação nem recomendação de investimento.** O FCF importado deve ser conferido quanto à compatibilidade com FCFF/WACC.

## Pastas

| Pasta | Conteúdo |
| --- | --- |
| `backend/` | API FastAPI, integração de dados, cálculo DCF, terminal e testes Python |
| `frontend/` | React/TypeScript, estilos, logo, testes de componentes e configuração Vite |
| `docs/` | Método, execução/deploy, validação, identidade visual e BPMN original |

A fórmula original está preservada em `backend/valuation.py`. As validações e a apresentação do resultado foram revisadas.

## Abrir no VS Code — Windows

Requisitos: **Python 3.12** e **Node.js 24**. Extraia o ZIP e abra a pasta `nexodcf` no VS Code.

Abra **Terminal → Novo Terminal**. No primeiro terminal:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn api:app --reload --port 8000
```

Abra um **segundo terminal**, começando novamente na pasta `nexodcf`:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Abra **[http://localhost:5173](http://localhost:5173)** no navegador e mantenha os dois terminais abertos. Não é necessário ativar a venv nem alterar a política do PowerShell. O uso de `npm.cmd` evita bloqueio de `npm.ps1`.

Documentação da API: [http://localhost:8000/api/docs](http://localhost:8000/api/docs).

Se aparecer “Não foi possível conectar à API”, confira o primeiro terminal. Se a porta estiver ocupada, encerre o processo anterior: esta configuração usa exatamente 8000 e 5173.

## Linux/macOS

No primeiro terminal:

```bash
cd backend
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m uvicorn api:app --reload --port 8000
```

No segundo terminal, a partir da raiz:

```bash
cd frontend
npm ci
npm run dev
```

## Uso

1. Escolha listada ou não listada. Na busca, use o nome ou o ticker, como PETR4.
2. Revise os dados. Campos “API” vêm preenchidos e protegidos; “Ajustar dados” permite corrigir. Os campos ausentes já ficam liberados.
3. Informe as premissas e confirme a compatibilidade do fluxo. Valores em reais, sem abreviar em milhões/bilhões. Use `1.234,56` ou `1234.56`; `1.234` é interpretado como 1234.
4. Calcule. O valor por ação/cota e a comparação aparecem primeiro. Abra os detalhes se quiser aprofundar.
5. Baixe o relatório para guardar os dados e as premissas usadas.

Ao alterar dados, premissas ou empresa, o resultado anterior é invalidado para evitar comparação com uma análise desatualizada.

## Vercel

A configuração está em `vercel.json`, com frontend e API no mesmo domínio por Vercel Services, recurso atualmente em beta. **O deploy ainda não foi executado.** Leia [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md).

O adaptador atual usa Yahoo Finance via yfinance. A documentação do projeto alerta que a API de dados é destinada a uso pessoal. Para uso público, é necessário confirmar os direitos dos dados ou integrar um fornecedor autorizado. Por isso a consulta automática fica desabilitada por padrão na Vercel; a calculadora manual permanece funcional. Mudar uma variável não concede licença.

## Verificação

Na raiz, com as dependências Python instaladas:

```bash
python -m pip install -r backend/requirements-test.txt
python -m pytest backend/tests -q
```

No frontend:

```bash
npm test
npm run build
```

Foram aprovados **42 testes Python, 25 testes da interface e o build de produção**. Os testes de integração usam dados sintéticos identificados nos arquivos de teste, sem incluí-los na interface. Não houve teste visual em navegador, consulta de mercado ao vivo ou deploy de homologação. Consulte [docs/ESTADO_ATUAL.md](docs/ESTADO_ATUAL.md).

## Terminal

Na pasta backend, execute o Python do ambiente com `main.py`. O terminal compartilha as validações da API e gera relatório TXT no diretório de execução, com nome seguro e identificador para evitar sobrescrita.

## Documentação

- [Método e limitações](docs/METODOLOGIA.md)
- [Deploy na Vercel](docs/DEPLOY_VERCEL.md)
- [Estado da revisão](docs/ESTADO_ATUAL.md)
- [Identidade visual](docs/IDENTIDADE_VISUAL.md)

O BPMN original e o README original estão preservados em `docs/`. O README original é histórico e pode divergir da implementação atual.
