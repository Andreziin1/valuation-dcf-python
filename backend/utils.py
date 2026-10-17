# Função para formatar valores em reais
def formatar_moeda(valor):
    if valor is None:
        return "—"
    return f"R$ {valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


# Função para formatar porcentagens
def formatar_porcentagem(valor):
    if valor is None:
        return "—"
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
    if valor_justo_acao <= 0 or preco_atual is None or preco_atual <= 0:
        return None
    return (valor_justo_acao - preco_atual) / valor_justo_acao


# Função para gerar um diagnóstico simples
def gerar_diagnostico(margem_seguranca):
    if margem_seguranca is None:
        return "Sem comparação válida para estas premissas."
    if margem_seguranca > 0:
        return "A estimativa está acima do preço de referência; não é retorno garantido."
    if margem_seguranca < 0:
        return "A estimativa está abaixo do preço de referência; depende das premissas."
    return "Estimativa e preço de referência coincidem."
    
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
    if valor_justo <= 0 or preco_atual is None or preco_atual <= 0:
        return None
    return ((valor_justo - preco_atual) / preco_atual) * 100
