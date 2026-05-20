import AsyncStorage from '@react-native-async-storage/async-storage'

const HAS_SEEN_WELCOME_KEY = 'has_seen_welcome'

export async function hasSeenWelcome(): Promise<boolean> {
  const value = await AsyncStorage.getItem(HAS_SEEN_WELCOME_KEY)
  return value === 'true'
}

export async function markWelcomeSeen(): Promise<void> {
  await AsyncStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true')
}
