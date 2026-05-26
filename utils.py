# Função para formatar valores em reais
def formatar_moeda(valor):
    return f"R$ {valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


# Função para formatar porcentagens
def formatar_porcentagem(valor):
    return f"{valor * 100:.2f}%"


# Função para validar se um valor é maior que zero
def validar_maior_que_zero(valor, nome_campo):
    if valor <= 0:
        raise ValueError(f"O campo '{nome_campo}' precisa ser maior que zero.")


# Função para validar se um valor não é negativo
def validar_nao_negativo(valor, nome_campo):
    if valor < 0:
        raise ValueError(f"O campo '{nome_campo}' não pode ser negativo.")


# Função para validar as taxas usadas no valuation
def validar_taxas(taxa_desconto, crescimento_perpetuo):
    if taxa_desconto <= 0:
        raise ValueError("A taxa de desconto precisa ser maior que zero.")

    if crescimento_perpetuo < 0:
        raise ValueError("O crescimento perpétuo não pode ser negativo.")

    if crescimento_perpetuo >= taxa_desconto:
        raise ValueError("O crescimento perpétuo precisa ser menor que a taxa de desconto.")


# Função para calcular a margem de segurança
def calcular_margem_seguranca(valor_justo_acao, preco_atual):
    return (valor_justo_acao - preco_atual) / valor_justo_acao


# Função para gerar um diagnóstico simples
def gerar_diagnostico(margem_seguranca):
    if margem_seguranca >= 0.20:
        return "A ação aparenta estar descontada."

    elif margem_seguranca > -0.10:
        return "A ação aparenta estar próxima do valor justo."

    else:
        return "A ação aparenta estar cara."
    
def linha():
    print("=" * 50)


def titulo(texto):
    print("\n" + "=" * 50)
    print(texto.center(50))
    print("=" * 50)


def subtitulo(texto):
    print("\n" + "-" * 50)
    print(texto)
    print("-" * 50)

def gerar_cenarios(crescimento_base):

    crescimento_pessimista = crescimento_base - 0.02
    crescimento_otimista = crescimento_base + 0.02

    return {
        "pessimista": crescimento_pessimista,
        "base": crescimento_base,
        "otimista": crescimento_otimista
    }

def calcular_potencial_valorizacao(valor_justo, preco_atual):
    return ((valor_justo - preco_atual) / preco_atual) * 100