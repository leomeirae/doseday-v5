import { useCallback, useEffect, useState } from 'react'
import { PACKAGE_TYPE, type PurchasesPackage } from 'react-native-purchases'
import { getDefaultOffering } from '@lib/revenuecat/offerings'
import { isRevenueCatConfigured } from '@lib/revenuecat/configure'

export type PaywallPlanId = 'monthly' | 'yearly'

export type PaywallPlan = {
  id: PaywallPlanId
  priceString: string // formatado pelo StoreKit (ex.: "R$ 19,90") — NUNCA hardcoded
  package: PurchasesPackage
}

export type PaywallPlansState = {
  plans: PaywallPlan[]
  loading: boolean
  error: boolean
  available: boolean // SDK configurado E offering carregada com planos
  reload: () => void // re-busca a offering (botão "tentar de novo" do loadError)
}

function mapType(pkg: PurchasesPackage): PaywallPlanId | null {
  if (pkg.packageType === PACKAGE_TYPE.ANNUAL) return 'yearly'
  if (pkg.packageType === PACKAGE_TYPE.MONTHLY) return 'monthly'
  return null
}

// Lê a offering 'default' e devolve os planos mensal/anual com preço do StoreKit.
// SDK não configurado (sem key / Expo Go / simulador sem módulo) → available=false,
// e o paywall cai no estado 'unavailable' existente. Nunca crash.
export function usePaywallPlans(): PaywallPlansState {
  const [data, setData] = useState<Omit<PaywallPlansState, 'reload'>>({
    plans: [],
    loading: true,
    error: false,
    available: isRevenueCatConfigured(),
  })
  const [reloadToken, setReloadToken] = useState(0)
  const reload = useCallback(() => setReloadToken((n) => n + 1), [])

  useEffect(() => {
    let active = true
    if (!isRevenueCatConfigured()) {
      setData({ plans: [], loading: false, error: false, available: false })
      return
    }
    setData((prev) => ({ ...prev, loading: true, error: false }))
    void (async () => {
      try {
        const offering = await getDefaultOffering()
        if (!active) return
        if (!offering) {
          setData({ plans: [], loading: false, error: true, available: true })
          return
        }
        const plans = offering.availablePackages
          .map((pkg): PaywallPlan | null => {
            const id = mapType(pkg)
            return id ? { id, priceString: pkg.product.priceString, package: pkg } : null
          })
          .filter((p): p is PaywallPlan => p !== null)
          // anual primeiro (mesma ordem visual da Fase 1)
          .sort((a, b) => (a.id === 'yearly' ? -1 : b.id === 'yearly' ? 1 : 0))
        setData({ plans, loading: false, error: plans.length === 0, available: true })
      } catch {
        if (active) setData({ plans: [], loading: false, error: true, available: true })
      }
    })()
    return () => {
      active = false
    }
  }, [reloadToken])

  return { ...data, reload }
}
