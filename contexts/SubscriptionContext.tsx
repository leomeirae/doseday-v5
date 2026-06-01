import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { resolveEntitlement, type EntitlementSource } from '@lib/subscription/entitlement'
import { getDevEntitlementOverride } from '@lib/subscription/devEntitlementStorage'

// Fonte ÚNICA de "é premium?" no app inteiro.
// Nenhuma tela consulta RevenueCat direto nem espalha isPremium — tudo passa
// por useEntitlements() (ver plano 2026-06-01-release-readiness-paywall-freemium).

export type Entitlements = {
  isPremium: boolean
  isLoading: boolean
  source: EntitlementSource
  refresh: () => Promise<void>
}

const SubscriptionContext = createContext<Entitlements>({
  isPremium: false,
  isLoading: true,
  source: 'none',
  refresh: async () => {},
})

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<Entitlements, 'refresh'>>({
    isPremium: false,
    isLoading: true,
    source: 'none',
  })

  const refresh = useCallback(async () => {
    // FASE 1: a única fonte possível é o override de dev (mock).
    // FASE 2 (RevenueCat): aqui entram Purchases.getCustomerInfo() +
    //   Purchases.addCustomerInfoUpdateListener; resolveEntitlement() passa a
    //   receber o customerInfo real e o mock vira apenas fallback de dev.
    //   NENHUM consumidor de useEntitlements() muda.
    const devOverride = await getDevEntitlementOverride()
    const resolved = resolveEntitlement({ isDevBuild: __DEV__, devOverride })
    setState({ isPremium: resolved.isPremium, isLoading: false, source: resolved.source })
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<Entitlements>(() => ({ ...state, refresh }), [state, refresh])

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export function useEntitlements(): Entitlements {
  return useContext(SubscriptionContext)
}
