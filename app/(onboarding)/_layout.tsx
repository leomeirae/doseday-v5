import { Stack } from 'expo-router'
import { OnboardingProvider } from '@contexts/OnboardingContext'
import { colors } from '@lib/theme/tokens'

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.bgBase },
        }}
      />
    </OnboardingProvider>
  )
}
