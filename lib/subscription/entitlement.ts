// Resolução de entitlement — Fase 1 (sem RevenueCat SDK).
//
// Este módulo é PURO (zero imports) de propósito: a regra de segurança
// "mock nunca ativa premium em produção" é coberta por unit test em
// lib/subscription/__tests__/entitlement.test.ts.
//
// FASE 2 (RevenueCat): resolveEntitlement passa a receber também o
// customerInfo real do SDK; o override de dev vira apenas fallback de
// desenvolvimento. A assinatura da função muda aqui e no provider —
// nenhum consumidor de useEntitlements() é afetado.

export type EntitlementSource = 'none' | 'mock-dev'

export type ResolvedEntitlement = {
  isPremium: boolean
  source: EntitlementSource
}

// Regra de segurança: fora de build dev, o mock NUNCA ativa premium. Sem exceção.
export function resolveEntitlement(input: {
  isDevBuild: boolean
  devOverride: boolean
}): ResolvedEntitlement {
  if (!input.isDevBuild) {
    return { isPremium: false, source: 'none' }
  }
  return input.devOverride
    ? { isPremium: true, source: 'mock-dev' }
    : { isPremium: false, source: 'none' }
}
