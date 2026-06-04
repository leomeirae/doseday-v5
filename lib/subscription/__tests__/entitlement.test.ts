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

  it('retorna premium quando o entitlement do RevenueCat está ativo, MESMO em produção', () => {
    expect(
      resolveEntitlement({ isDevBuild: false, devOverride: false, entitlementActive: true }),
    ).toEqual({ isPremium: true, source: 'revenuecat' })
  })

  it('entitlement real tem prioridade sobre o mock dev', () => {
    expect(
      resolveEntitlement({ isDevBuild: true, devOverride: false, entitlementActive: true }),
    ).toEqual({ isPremium: true, source: 'revenuecat' })
  })

  it('sem entitlement real em produção continua free (sem premium indevido)', () => {
    expect(
      resolveEntitlement({ isDevBuild: false, devOverride: true, entitlementActive: false }),
    ).toEqual({ isPremium: false, source: 'none' })
  })
})
