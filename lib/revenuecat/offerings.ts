import Purchases, {
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesError,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases'

const PREMIUM_ENTITLEMENT = 'premium'

// Offering canônica por lookup key. Nunca depende do nome de paywall do
// dashboard — busca 'default' e cai pra current se preciso.
export async function getDefaultOffering(): Promise<PurchasesOffering | null> {
  const offerings = await Purchases.getOfferings()
  return offerings.all['default'] ?? offerings.current ?? null
}

export function hasPremiumEntitlement(info: CustomerInfo): boolean {
  return info.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined
}

export type PurchaseOutcome =
  | { status: 'success'; info: CustomerInfo }
  | { status: 'cancelled' }
  | { status: 'error' }

export async function purchase(pkg: PurchasesPackage): Promise<PurchaseOutcome> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg)
    return { status: 'success', info: customerInfo }
  } catch (e) {
    const err = e as PurchasesError
    if (err?.userCancelled || err?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { status: 'cancelled' }
    }
    return { status: 'error' }
  }
}

export type RestoreOutcome =
  | { status: 'restored'; info: CustomerInfo }
  | { status: 'nothing'; info: CustomerInfo }
  | { status: 'error' }

export async function restore(): Promise<RestoreOutcome> {
  try {
    const info = await Purchases.restorePurchases()
    return hasPremiumEntitlement(info)
      ? { status: 'restored', info }
      : { status: 'nothing', info }
  } catch {
    return { status: 'error' }
  }
}
