import AsyncStorage from '@react-native-async-storage/async-storage'

// Persistência do override de premium em DEV.
// Guard duplo: além do resolveEntitlement (que ignora o override fora de dev),
// em release este módulo nem sequer lê o storage.

const DEV_PREMIUM_KEY = 'dev_entitlement_premium'

export async function getDevEntitlementOverride(): Promise<boolean> {
  if (!__DEV__) return false
  const value = await AsyncStorage.getItem(DEV_PREMIUM_KEY)
  return value === 'true'
}

export async function setDevEntitlementOverride(enabled: boolean): Promise<void> {
  if (!__DEV__) return
  await AsyncStorage.setItem(DEV_PREMIUM_KEY, enabled ? 'true' : 'false')
}
