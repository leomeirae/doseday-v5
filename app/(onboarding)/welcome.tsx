import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { useOnboarding } from '@contexts/OnboardingContext'

export default function WelcomeScreen() {
  const { t } = useTranslation('onboarding')
  const { submitStep } = useOnboarding()
  const router = useRouter()

  async function handleStart() {
    await submitStep('welcome', {})
    router.replace('/(onboarding)/personal-info' as Href)
  }

  return (
    <OnboardingShell
      step="welcome"
      stepNumber={1}
      totalSteps={14}
      headline={t('welcome.headline')}
      subtitle={t('welcome.body')}
      showBack={false}
      primaryCTA={{
        label: t('welcome.cta'),
        onPress: handleStart,
      }}
    >
      <View />
    </OnboardingShell>
  )
}
