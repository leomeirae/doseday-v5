// PLACEHOLDER Fase 1 — espelha o shape mínimo de um offering do RevenueCat.
// Preço NUNCA é número real: o paywall exibe pricing.placeholder + nota
// "preço exibido pela App Store". Na Fase 2 este arquivo é substituído por
// Purchases.getOfferings() dentro do SubscriptionProvider.

export type PaywallPlanId = 'monthly' | 'yearly'

export type PaywallPlan = {
  id: PaywallPlanId
  titleKey: string // ex.: 'paywall.plans.yearly'
  periodKey: string // ex.: 'paywall.plans.perYear'
  badgeKey: string | null // ex.: 'paywall.plans.bestOffer' (só anual)
}

export const MOCK_PLANS: PaywallPlan[] = [
  {
    id: 'yearly',
    titleKey: 'paywall.plans.yearly',
    periodKey: 'paywall.plans.perYear',
    badgeKey: 'paywall.plans.bestOffer',
  },
  {
    id: 'monthly',
    titleKey: 'paywall.plans.monthly',
    periodKey: 'paywall.plans.perMonth',
    badgeKey: null,
  },
]
