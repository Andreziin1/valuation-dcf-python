# Deploy na Vercel

**Configuração preparada; nenhuma publicação foi realizada nesta entrega.**

## Arquitetura

A raiz do projeto contém `vercel.json`. Ele declara dois serviços:

| Serviço | Raiz | Entrada/saída |
| --- | --- | --- |
| frontend | frontend/ | Vite; build `npm run build`; saída dist |
| backend | backend/ | FastAPI; entrada `api:app` |

As URLs `/api/...` são direcionadas ao backend e as demais ao frontend. O backend recebe o caminho com `/api` preservado. A interface não contém URL de localhost no código de produção.

Essa configuração usa **Vercel Services, em beta** na documentação consultada em 16/10/2026.

## Implantação

1. Coloque o conteúdo de `nexodcf/` em um repositório.
2. Importe o repositório na Vercel.
3. Use como **Root Directory a pasta que contém vercel.json**. Se o repositório tiver uma pasta externa chamada nexodcf, selecione essa pasta; se seus conteúdos estiverem diretamente na raiz, mantenha a raiz.
4. Use Node.js 24. A versão Python especificada em backend/.python-version é 3.12.
5. Preserve os comandos definidos por serviço em vercel.json. Não configure o projeto inteiro como somente frontend: isso deixaria a API de fora.
6. Faça primeiro um preview e confira os logs dos dois serviços.
7. Abra `/api/health`; deve retornar status online. Abra a página inicial e teste o cálculo manual.
8. Valide consulta real e navegação em desktop/celular antes de promover para produção.

Se o painel ou CLI não reconhecer `services`, confira a documentação atual da Vercel e a disponibilidade do recurso na conta. Não apague a configuração nem publique somente a interface como se o sistema completo estivesse funcionando.

## Dados de mercado

| Variável | Comportamento |
| --- | --- |
| ENABLE_MARKET_DATA ausente em ambiente local | Consulta habilitada |
| ENABLE_MARKET_DATA ausente com VERCEL definido | Consulta desabilitada |
| ENABLE_MARKET_DATA=false | Consulta desabilitada |
| ENABLE_MARKET_DATA=true | Habilita o adaptador Yahoo Finance |

O README oficial do yfinance identifica uso pessoal da API Yahoo Finance e orienta conferir os termos dos dados. A licença de software do yfinance não é licença de redistribuição das informações financeiras.

**Para abrir a consulta automática ao público, confirme antes os direitos de uso ou implemente um fornecedor que permita essa finalidade.** Não há token, contrato ou licença incluídos nesta entrega. Habilitar a variável não resolve direitos, limites do fornecedor ou confiabilidade.

O modo manual funciona sem consulta externa. Localmente, para usar um arquivo de ambiente, copie backend/.env.example para backend/.env e inicie o Uvicorn com `--env-file .env`. Na Vercel, configure variáveis no projeto e refaça o deploy.

## Rotas

| Método | Rota | Função |
| --- | --- | --- |
| GET | /api/health | Saúde e disponibilidade da consulta |
| GET | /api/empresas?q=nome | Correspondências de ações brasileiras |
| GET | /api/empresa/PETR4 | Dados financeiros disponíveis |
| POST | /api/calcular-valuation | Cálculo validado |
| GET | /api/docs | Documentação interativa da API |

Para calcular, envie `modelo_confirmado: true` após revisar a compatibilidade do fluxo com FCFF/WACC. A entrada está documentada em /api/docs. Taxas na API são frações: 12% é 0.12. Na interface, digita-se 12.

## Verificações do preview

- Ausência de dados e falhas de fornecedor devem apresentar mensagens, sem preencher zero artificialmente.
- Editar premissas deve remover o resultado antigo.
- O relatório deve corresponder exatamente à análise mostrada.
- A cotação deve ter origem/data verificáveis; não anunciar “tempo real”.
- Testar consulta e cálculo no domínio publicado, não apenas localmente.
- Revisar limites, custos e proteção contra abuso no projeto Vercel conforme o tráfego esperado.

## Referências oficiais

- [Vercel Services](https://vercel.com/docs/services)
- [Configuração de serviços](https://vercel.com/docs/services/config-reference)
- [Roteamento de serviços](https://vercel.com/docs/services/routing)
- [yfinance: documentação e aviso de uso dos dados](https://github.com/ranaroussi/yfinance)
