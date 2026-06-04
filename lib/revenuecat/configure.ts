import Purchases, { LOG_LEVEL, type CustomerInfo } from 'react-native-purchases'

// Configuração do SDK RevenueCat (iOS). A key é PÚBLICA de client (pode ir no
// bundle, igual à anon key do Supabase). O SubscriptionProvider é o ÚNICO
// consumidor destes helpers — nenhuma tela chama o SDK direto.

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY

let configured = false

// Idempotente: configura uma única vez por processo. Sem key → no-op e o app
// segue funcionando como free (fallback seguro, nunca crash).
export function configureRevenueCat(): boolean {
  if (configured) return true
  if (!IOS_KEY) return false
  try {
    if (__DEV__) void Purchases.setLogLevel(LOG_LEVEL.DEBUG)
    Purchases.configure({ apiKey: IOS_KEY })
    configured = true
    return true
  } catch {
    return false
  }
}

export function isRevenueCatConfigured(): boolean {
  return configured
}

// Guard 2 (logIn): só chama logIn quando o app_user_id atual difere da UUID do
// Supabase — evita rede a cada render/refresh do provider. O app_user_id PRECISA
// ser a UUID: o webhook revenuecat-webhook só casa a linha em user_subscriptions
// quando app_user_id passa no regex de UUID.
export async function identifyRevenueCatUser(userId: string): Promise<void> {
  if (!configured) return
  try {
    const current = await Purchases.getAppUserID()
    if (current === userId) return
    await Purchases.logIn(userId)
  } catch {
    // Identidade é best-effort; nunca quebra o fluxo de auth.
  }
}

// Guard 1 (logOut): Purchases.logOut() LANÇA se o usuário atual já é anônimo.
// Checar isAnonymous() antes; sign-out nunca pode crashar por causa do RevenueCat.
export async function signOutRevenueCatUser(): Promise<void> {
  if (!configured) return
  try {
    const anonymous = await Purchases.isAnonymous()
    if (anonymous) return
    await Purchases.logOut()
  } catch {
    // best-effort.
  }
}

export type { CustomerInfo }
