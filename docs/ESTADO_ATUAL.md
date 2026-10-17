# Estado da revisão — 16/10/2026

## Implementado

- Identidade NexoDCF com símbolo “N”, paleta clara e favicon.
- Interface simples, sem animações e com adaptações para telas menores.
- Comparação principal: valor estimado por ação/cota, referência e diferença percentual explicada.
- Cenários, gráfico de fluxo projetado versus valor presente e memória do cálculo em detalhes recolhidos.
- Busca por nome ou ticker brasileiro; preenchimento automático de dados disponíveis.
- Edição explícita dos importados; restauração preserva complementos de campos ausentes.
- Empresa não listada totalmente manual; nome aceita texto; preço de referência opcional.
- Taxas sem valores iniciais presumidos; projeção de 5 anos claramente editável.
- Campos ausentes não viram zero; dívida/caixa zerados são aceitos quando informados.
- Margem de segurança convertida corretamente para porcentagem na interface e no relatório.
- Resultado não positivo sem preço-alvo e sem divisão por zero.
- Cancelamento/ignorância de respostas antigas ao alterar empresa ou tipo de análise.
- Relatório TXT na interface e terminal alinhado às validações da API.
- Chamadas relativas a /api e proxy local; configuração Vercel Services.
- Fonte, horário da consulta e referências temporais informados quando disponíveis.
- Dados financeiros em outra moeda não são combinados automaticamente com reais.

## Evidências de verificação

| Verificação | Resultado |
| --- | --- |
| Pytest: API, cálculo, validações, integração simulada e terminal | 42 aprovados |
| Vitest/jsdom: formulário, busca, importação, edição, erros, resultado e relatório | 25 aprovados |
| TypeScript e build Vite de produção | Aprovados |
| Compilação dos módulos Python | Aprovada |

Os testes usam dados sintéticos exclusivamente como fixtures. A API foi exercitada diretamente pela interface ASGI em memória. O cálculo foi comparado com uma expressão independente da função original. O JavaScript foi exercitado em DOM simulado, sem navegador real.

## Limites que permanecem

- Aparência, responsividade e navegação por teclado ainda precisam de inspeção em navegador real.
- Não foi validada a resposta ao vivo do Yahoo Finance nem sua cobertura de empresas. A busca lista as correspondências retornadas pelo fornecedor, não um cadastro completo garantido da B3.
- Não houve deploy na Vercel. A configuração foi preparada conforme a documentação oficial consultada nesta data; o recurso Services está em beta.
- Sem auditoria financeira especializada. Confirmar FCFF/WACC não transforma automaticamente o FCF do fornecedor em FCFF.
- Os cenários variam apenas crescimento em ±2 pontos percentuais. Não são previsões nem intervalos de confiança.
- O cache de consulta é por instância, dura até 5 minutos e não constitui limitação distribuída de requisições.
- A API devolve timeout após 22 segundos; uma chamada de fornecedor que já começou em thread pode continuar até o timeout interno dela.
- O deploy não possui proteção de abuso configurada na conta Vercel. Monitoramento e regras de acesso dependem do ambiente publicado.
- O app não cria histórico de análises. A infraestrutura e o fornecedor podem manter logs técnicos; não é uma garantia de ausência total de logs.

## Antes de liberar ao público

Confirme os direitos de uso/redistribuição dos dados e escolha um fornecedor compatível com a finalidade pública. Teste o preview na Vercel, a consulta real, a precisão dos dados e a experiência em desktop/celular. O modo manual permite validar o fluxo sem depender de cotação externa.

## Preservado

- Fórmula de `backend/valuation.py`.
- Separação entre backend, frontend e documentação.
- Seleção listada/não listada, cenários e relatório.
- `docs/BPMN_v.png` original, sem alteração.
- `docs/README_original.md` para referência histórica.
