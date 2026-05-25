import { useState } from 'react'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { ConsentCheckbox } from '@components/onboarding/ConsentCheckbox'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { useOnboarding } from '@contexts/OnboardingContext'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

export default function ConsentScreen() {
  const { t } = useTranslation('onboarding')
  const { state, submitStep, goBack } = useOnboarding()
  const router = useRouter()
  const [accepted, setAccepted] = useState(state.data.consent_given ?? false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!accepted) return
    setSubmitting(true)
    await submitStep('consent', { consent_given: true })
    router.replace('/(onboarding)/loading' as Href)
  }

  function handleBack() {
    goBack()
    router.replace('/(onboarding)/concerns' as Href)
  }

  function openTerms() {
    Alert.alert(t('termsDialog.title'), t('termsDialog.comingSoon'))
  }

  function openPrivacy() {
    Alert.alert(t('privacyDialog.title'), t('privacyDialog.comingSoon'))
  }

  return (
    <OnboardingShell
      step="consent"
      stepNumber={13}
      totalSteps={15}
      headline={t('consent.title')}
      subtitle={t('consent.subtitle')}
      onBack={handleBack}
      primaryCTA={{
        label: submitting ? t('consent.buttonLoading') : t('consent.button'),
        onPress: handleSubmit,
        disabled: !accepted || !state.isHydrated,
        loading: submitting,
      }}
    >
      <View style={styles.stack}>
        <ConsentCheckbox
          checked={accepted}
          onToggle={() => setAccepted((value) => !value)}
          caption={t('consent.terms.required')}
          accessibilityLabel={t('consent.terms.label')}
          testID="consent-terms"
        >
          {t('consent.terms.label')}{' '}
          <Text style={styles.link} onPress={openTerms}>
            {t('consent.terms.termsLink')}
          </Text>{' '}
          {t('consent.terms.and')}{' '}
          <Text style={styles.link} onPress={openPrivacy}>
            {t('consent.terms.privacyLink')}
          </Text>
        </ConsentCheckbox>

        <Text style={styles.security}>{t('consent.security')}</Text>
      </View>
    </OnboardingShell>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  link: {
    ...typography.body,
    color: colors.textBrand,
  },
  security: {
    ...typography.caption,
    color: colors.textSecondary,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
  },
})
