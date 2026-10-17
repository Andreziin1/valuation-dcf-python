# Método e interpretação

## Resultado principal

O primeiro valor é a estimativa por ação ou cota calculada com os dados e premissas informados. O segundo é o preço de referência, que pode vir do fornecedor ou ser preenchido manualmente. Eles não são preços garantidos.

Diferença percentual = (estimativa / preço de referência − 1) × 100.

A margem de segurança, apresentada nos detalhes, usa outro denominador: (estimativa − preço de referência) / estimativa × 100. Por isso não é igual à diferença principal.

Sem preço de referência, a estimativa continua disponível e a comparação fica indisponível. Se o patrimônio estimado for zero ou negativo, o sistema informa ausência de estimativa positiva e não oferece o valor negativo como preço-alvo.

## Fórmula preservada

Para cada ano t, o fluxo inicial cresce pela taxa anual:

`Fluxo(t) = Fluxo inicial × (1 + crescimento)^t`

`Valor presente(t) = Fluxo(t) / (1 + desconto)^t`

Ao final de N anos:

`Terminal = Fluxo(N) × (1 + crescimento perpétuo) / (desconto − crescimento perpétuo)`

O terminal também é descontado por N anos. O valor operacional soma os fluxos descontados e o terminal descontado. Depois:

`Valor dos acionistas = valor operacional − dívida + caixa`

`Estimativa por ação/cota = valor dos acionistas / quantidade total`

A chave histórica `valor_empresa` do módulo original representa o valor após dívida e caixa; a interface agora a identifica corretamente como valor dos acionistas.

## Compatibilidade dos dados

Esta estrutura corresponde a fluxo da firma (FCFF) descontado pelo custo médio ponderado de capital (WACC), seguido da ponte até o patrimônio. Fluxo do acionista (FCFE) requer tratamento diferente. O app não calcula o WACC automaticamente.

O campo Free Cash Flow do fornecedor não é automaticamente uma medida de FCFF. É necessário verificar demonstrativos, juros, impostos e demais ajustes aplicáveis. A confirmação do usuário registra a revisão, mas não constitui validação financeira automatizada.

O FCF importado usa o último exercício anual disponível na série do fornecedor; pode estar defasado. Dívida e caixa podem ter outra data-base. O app exibe as referências disponíveis e não presume alinhamento temporal.

- Moeda da cotação deve ser BRL.
- Fluxo, dívida e caixa só são importados automaticamente quando a moeda financeira é confirmada como BRL.
- Ausência é representada por campo vazio, não zero.
- Não há conversão cambial.
- Quantidade de ações deve ser total e compatível com as classes/units. Não use o tamanho da sua posição.
- Bancos, seguradoras, empresas com perdas e estruturas complexas precisam de modelos e ajustes específicos.

## Cenários e gráfico

Pessimista e otimista reduzem ou aumentam o crescimento anual em 2 pontos percentuais. Desconto, perpetuidade, dívida, caixa e quantidade ficam iguais. São análises de sensibilidade simplificadas, não probabilidades.

O gráfico mostra, para cada ano, o fluxo projetado e seu valor presente. A tabela logo abaixo contém os valores exatos em reais. O gráfico não representa a cotação da ação.

O peso do valor terminal mostra quanto do valor operacional depende do período após a projeção explícita. A interface não transforma esse indicador em um selo de confiança.

## Validações técnicas

Fluxo inicial e quantidade positivos; dívida/caixa não negativos; referência opcional positiva. Projeção inteira entre 1 e 25 anos. Crescimento anual entre −50% e 150%; desconto maior que 0,1% e até 60%; crescimento perpétuo entre 0% e 12%, sempre menor que o desconto.

Esses intervalos evitam entradas inadequadas ao modelo e não recomendam taxas financeiras. Nem todos os valores aceitos são economicamente plausíveis para uma empresa.

## Referências

- [Aswath Damodaran — material de valuation/DCF, NYU Stern](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/valuation/val.htm)
- [Investment Valuation — capítulo 15, FCFF e WACC](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/Inv3ed.htm)
- [yfinance — origem e restrições dos dados](https://github.com/ranaroussi/yfinance)

O sistema oferece apoio educacional à análise. Não substitui avaliação especializada e não recomenda comprar ou vender ativos.
