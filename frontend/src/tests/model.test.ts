import { describe, expect, it } from 'vitest'
import { companyForm, initialForm, parseNumber, toPayload, validate } from '../model'
import type { Company } from '../model'

describe('números e premissas', () => {
  it.each([['1.234,56', 1234.56], ['1234.56', 1234.56], ['12,5', 12.5], ['0', 0], ['-2,5', -2.5], ['1.234', 1234], ['', null], ['abc', null], ['NaN', null], ['Infinity', null], ['1,23,4', null], ['1.2.3', null]])('interpreta %s', (text, expected) => {
    expect(parseNumber(text as string)).toBe(expected)
  })
  const valid = { ...initialForm, nome_empresa: 'Empresa sintética', fcf_inicial: '1.000,50', crescimento: '5', taxa_desconto: '12', crescimento_perpetuo: '3', divida: '0', caixa: '0', quantidade_acoes: '100' }
  it('aceita zeros confirmados, sem preço, e não assume taxas padrão', () => {
    expect(validate(valid, true)).toEqual({})
    expect(initialForm.crescimento).toBe('')
    expect(toPayload(valid, true)).toMatchObject({ fcf_inicial: 1000.5, crescimento: .05, taxa_desconto: .12, preco_atual: null, modelo_confirmado: true })
  })
  it('não converte ausência em zero', () => {
    expect(validate({ ...valid, divida: '' }, true).divida).toBeTruthy()
    const form = companyForm({ nome_empresa: 'Teste', fcf_inicial: null, divida: 0, caixa: null, quantidade_acoes: 100, preco_atual: 0 } as Company)
    expect(form.divida).toBe('0')
    expect(form.caixa).toBe('')
    expect(form.fcf_inicial).toBe('')
  })
  it('impede perpetuidade inválida, perdas e quantidades fracionárias', () => {
    const errors = validate({ ...valid, crescimento_perpetuo: '12', fcf_inicial: '-1', quantidade_acoes: '1,5' }, false)
    expect(Object.keys(errors)).toEqual(expect.arrayContaining(['crescimento_perpetuo', 'fcf_inicial', 'quantidade_acoes', 'confirmed']))
  })
})
