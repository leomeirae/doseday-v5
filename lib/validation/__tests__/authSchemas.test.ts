import { signInSchema, signUpSchema, recoverSchema } from '../authSchemas'

// Regressão da rejeição App Store 2.1: email com espaço no fim falhava o login.
// O fix é `z.string().trim().email()` + uso de `result.data.email` nas telas.
describe('authSchemas — trim de email', () => {
  test('signInSchema remove espaços ao redor do email', () => {
    const result = signInSchema.parse({ email: '  marina@exemplo.com  ', password: '123456' })
    expect(result.email).toBe('marina@exemplo.com')
  })

  test('signUpSchema remove espaços ao redor do email', () => {
    const result = signUpSchema.parse({
      name: 'Marina',
      email: ' marina@exemplo.com ',
      password: 'senha1234',
    })
    expect(result.email).toBe('marina@exemplo.com')
  })

  test('recoverSchema remove espaços ao redor do email', () => {
    const result = recoverSchema.parse({ email: '  a@b.com ' })
    expect(result.email).toBe('a@b.com')
  })

  test('email inválido continua sendo rejeitado após o trim', () => {
    const result = signInSchema.safeParse({ email: '  não-é-email  ', password: '123456' })
    expect(result.success).toBe(false)
  })

  test('email só com espaços é rejeitado', () => {
    const result = signInSchema.safeParse({ email: '   ', password: '123456' })
    expect(result.success).toBe(false)
  })
})
