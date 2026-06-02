import { resolveEntitlement } from '../entitlement'

describe('resolveEntitlement', () => {
  it('NUNCA retorna premium fora de build dev, mesmo com override ligado', () => {
    expect(resolveEntitlement({ isDevBuild: false, devOverride: true })).toEqual({
      isPremium: false,
      source: 'none',
    })
  })

  it('NUNCA retorna premium fora de build dev com override desligado', () => {
    expect(resolveEntitlement({ isDevBuild: false, devOverride: false })).toEqual({
      isPremium: false,
      source: 'none',
    })
  })

  it('retorna premium em build dev com override ligado', () => {
    expect(resolveEntitlement({ isDevBuild: true, devOverride: true })).toEqual({
      isPremium: true,
      source: 'mock-dev',
    })
  })

  it('retorna free em build dev com override desligado', () => {
    expect(resolveEntitlement({ isDevBuild: true, devOverride: false })).toEqual({
      isPremium: false,
      source: 'none',
    })
  })
})
