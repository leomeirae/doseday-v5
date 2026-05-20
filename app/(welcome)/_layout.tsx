import { Stack } from 'expo-router'
import { colors } from '@lib/theme/tokens'

export default function WelcomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.bgBase },
      }}
    />
  )
}
