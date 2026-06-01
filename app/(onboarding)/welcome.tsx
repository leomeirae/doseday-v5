import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { SymbolView } from 'expo-symbols'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { useOnboarding } from '@contexts/OnboardingContext'
import {
  COUNTED_STEPS_TOTAL,
  getCountedStepNumber,
} from '@lib/validation/onboardingSchemas'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

const BULLETS = ['doses', 'weight', 'memory'] as const

export default function WelcomeScreen() {
  const { t } = useTranslation('onboarding')
  const { submitStep } = useOnboarding()
  const router = useRouter()

  async function handleStart() {
    await submitStep('welcome', {})
    router.replace('/(onboarding)/treatment-status' as Href)
  }

  return (
    <OnboardingShell
      step="welcome"
      stepNumber={getCountedStepNumber('welcome')}
      totalSteps={COUNTED_STEPS_TOTAL}
      headline={t('welcome.headline')}
      subtitle={t('welcome.body')}
      showBack={false}
      primaryCTA={{
        label: t('welcome.cta'),
        onPress: handleStart,
      }}
    >
      <View style={styles.bullets}>
        {BULLETS.map((key) => (
          <View key={key} style={styles.bulletRow}>
            <View style={styles.bulletIcon}>
              <SymbolView name="checkmark" size={13} tintColor={colors.brand} />
            </View>
            <Text style={styles.bulletText}>{t(`welcome.bullets.${key}`)}</Text>
          </View>
        ))}
      </View>
    </OnboardingShell>
  )
}

const styles = StyleSheet.create({
  bullets: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bulletIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,212,170,0.12)',
  },
  bulletText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
})
