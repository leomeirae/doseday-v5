import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, typography } from '@lib/theme/tokens'
import { useOnboarding } from '@contexts/OnboardingContext'
import { getOnboardingStepNumber } from '@lib/validation/onboardingSchemas'
import { ONBOARDING_STEPS } from '@lib/types/onboarding'

export default function OnboardingIndexScreen() {
  const { currentStep } = useOnboarding()
  const stepNumber = getOnboardingStepNumber(currentStep)

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.kicker}>
          Passo {stepNumber} de {ONBOARDING_STEPS.length}
        </Text>
        <Text style={styles.title}>Onboarding</Text>
        <Text style={styles.body}>
          A fundação do fluxo já está pronta. As telas de captura entram nos próximos prompts.
        </Text>
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
