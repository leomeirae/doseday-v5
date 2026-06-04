import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import Purchases, { type CustomerInfo } from 'react-native-purchases'
import { resolveEntitlement, type EntitlementSource } from '@lib/subscription/entitlement'
import { getDevEntitlementOverride } from '@lib/subscription/devEntitlementStorage'
import {
  configureRevenueCat,
  identifyRevenueCatUser,
  signOutRevenueCatUser,
} from '@lib/revenuecat/configure'
import { hasPremiumEntitlement } from '@lib/revenuecat/offerings'
import { useSession } from '@contexts/AuthContext'

// Fonte ÚNICA de "é premium?" no app inteiro.
// Nenhuma tela consulta RevenueCat direto nem espalha isPremium — tudo passa
// por useEntitlements(). O SDK alimenta o provider; o mock dev (__DEV__) vira
// fallback de desenvolvimento. Nenhum consumidor de useEntitlements() mudou.

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
  const { user, loading: authLoading } = useSession()
  const [state, setState] = useState<Omit<Entitlements, 'refresh'>>({
    isPremium: false,
    isLoading: true,
    source: 'none',
  })
  const configuredRef = useRef(false)
  // O listener só processa eventos depois que a identidade do user atual está
  // aplicada — ver guard no effect do listener.
  const identityAppliedRef = useRef(false)

  // Combina entitlement real (se houver) com o fallback mock dev.
  const resolveFrom = useCallback(async (info: CustomerInfo | null) => {
    const devOverride = await getDevEntitlementOverride()
    const resolved = resolveEntitlement({
      isDevBuild: __DEV__,
      devOverride,
      entitlementActive: info ? hasPremiumEntitlement(info) : false,
    })
    setState({ isPremium: resolved.isPremium, isLoading: false, source: resolved.source })
  }, [])

  const refresh = useCallback(async () => {
    let info: CustomerInfo | null = null
    if (configuredRef.current) {
      try {
        info = await Purchases.getCustomerInfo()
      } catch {
        info = null // RevenueCat indisponível → trata como free; mock dev ainda vale.
      }
    }
    await resolveFrom(info)
  }, [resolveFrom])

  // Configura uma vez + registra listener de mudança de customerInfo
  // (compra/restore/expiração refletem sem reabrir o app).
  useEffect(() => {
    configuredRef.current = configureRevenueCat()
    if (!configuredRef.current) return
    const listener = (info: CustomerInfo) => {
      // O RevenueCat pode disparar o listener no momento do registro com o
      // customerInfo em cache (possivelmente o usuário ANÔNIMO), antes do logIn
      // completar. Processar isso derrubaria isLoading com estado free e
      // reabriria o flash de gate ao assinante no cold start. Ignora até a
      // identidade do user atual estar aplicada (ver effect abaixo). Guard
      // barato e à prova de mudança de comportamento do SDK.
      if (!identityAppliedRef.current) return
      void resolveFrom(info)
    }
    Purchases.addCustomerInfoUpdateListener(listener)
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener)
    }
  }, [resolveFrom])

  // Amarra o app_user_id à UUID do Supabase (guards dentro de identify/signOut)
  // ANTES do primeiro resolve. isLoading só vira false depois que a identidade
  // está aplicada — evita janela em que um pagante aparece como free no cold
  // start (effect anônimo resolvendo antes do logIn). Espera o auth assentar.
  useEffect(() => {
    if (authLoading) return
    let cancelled = false
    // Suprime o listener durante a transição de identidade (mount ou troca de user).
    identityAppliedRef.current = false
    void (async () => {
      if (configuredRef.current) {
        if (user?.id) {
          await identifyRevenueCatUser(user.id)
        } else {
          await signOutRevenueCatUser()
        }
      }
      if (cancelled) return
      // Identidade pronta: o listener pode processar eventos reais a partir daqui.
      identityAppliedRef.current = true
      await refresh()
    })()
    return () => {
      cancelled = true
    }
  }, [authLoading, user?.id, refresh])

  const value = useMemo<Entitlements>(() => ({ ...state, refresh }), [state, refresh])

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export function useEntitlements(): Entitlements {
  return useContext(SubscriptionContext)
}
