import { useEffect } from 'react'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, typography } from '@lib/theme/tokens'
import { useOnboarding } from '@contexts/OnboardingContext'
import { getOnboardingStepNumber } from '@lib/validation/onboardingSchemas'
import { ONBOARDING_STEPS, type OnboardingStep } from '@lib/types/onboarding'

const IMPLEMENTED_ROUTES: Partial<Record<OnboardingStep, Href>> = {
  welcome: '/(onboarding)/welcome' as Href,
  'personal-info': '/(onboarding)/personal-info' as Href,
  weight: '/(onboarding)/weight' as Href,
  'goal-weight': '/(onboarding)/goal-weight' as Href,
  'treatment-status': '/(onboarding)/treatment-status' as Href,
  'treatment-duration': '/(onboarding)/treatment-duration' as Href,
  medication: '/(onboarding)/medication' as Href,
  dose: '/(onboarding)/dose' as Href,
  'dose-frequency': '/(onboarding)/dose-frequency' as Href,
  'doctor-name': '/(onboarding)/doctor-name' as Href,
  'medical-support': '/(onboarding)/medical-support' as Href,
  concerns: '/(onboarding)/concerns' as Href,
  consent: '/(onboarding)/consent' as Href,
  loading: '/(onboarding)/loading' as Href,
  result: '/(onboarding)/result' as Href,
}

export default function OnboardingIndexScreen() {
  const { t } = useTranslation('onboarding')
  const { state, currentStep } = useOnboarding()
  const router = useRouter()
  const stepNumber = getOnboardingStepNumber(currentStep)

  useEffect(() => {
    if (!state.isHydrated) return
    const route = IMPLEMENTED_ROUTES[currentStep]
    if (route) router.replace(route)
  }, [currentStep, router, state.isHydrated])

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.kicker}>
          {t('progress.step', { current: stepNumber, total: ONBOARDING_STEPS.length })}
        </Text>
        <Text style={styles.title}>{t('welcome.headline')}</Text>
        <Text style={styles.body}>{t('welcome.body')}</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  kicker: {
    ...typography.label,
    color: colors.semanticInfo,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
})
