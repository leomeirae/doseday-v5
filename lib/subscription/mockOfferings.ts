// PLACEHOLDER Fase 1 — espelha o shape mínimo de um offering do RevenueCat.
// Preço NUNCA é número real: o paywall exibe "Preço via App Store" no card de
// plano. Na Fase 2 este arquivo é substituído por Purchases.getOfferings()
// dentro do SubscriptionProvider, e o card volta a exibir preço real + badge
// de economia calculada.

export type PaywallPlanId = 'monthly' | 'yearly'

export type PaywallPlan = {
  id: PaywallPlanId
  titleKey: string // ex.: 'paywall.plans.yearly'
  periodKey: string // ex.: 'paywall.plans.perYear'
}

export const MOCK_PLANS: PaywallPlan[] = [
  {
    id: 'yearly',
    titleKey: 'paywall.plans.yearly',
    periodKey: 'paywall.plans.perYear',
  },
  {
    id: 'monthly',
    titleKey: 'paywall.plans.monthly',
    periodKey: 'paywall.plans.perMonth',
  },
]
