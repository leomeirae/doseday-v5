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

export type EntitlementSource = 'none' | 'mock-dev' | 'revenuecat'

export type ResolvedEntitlement = {
  isPremium: boolean
  source: EntitlementSource
}

// Ordem de prioridade:
//   1. Entitlement real do RevenueCat (vale inclusive em produção) → 'revenuecat'.
//   2. Fora de build dev, o mock NUNCA ativa premium → 'none'. Sem exceção.
//   3. Em build dev sem entitlement real, o override de dev vale → 'mock-dev'.
// O campo entitlementActive é opcional: chamadas legadas (sem ele) mantêm o
// comportamento da Fase 1 — por isso os 4 testes originais continuam passando.
export function resolveEntitlement(input: {
  isDevBuild: boolean
  devOverride: boolean
  entitlementActive?: boolean
}): ResolvedEntitlement {
  if (input.entitlementActive) {
    return { isPremium: true, source: 'revenuecat' }
  }
  if (!input.isDevBuild) {
    return { isPremium: false, source: 'none' }
  }
  return input.devOverride
    ? { isPremium: true, source: 'mock-dev' }
    : { isPremium: false, source: 'none' }
}
