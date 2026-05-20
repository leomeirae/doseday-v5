import { useEffect, useMemo } from 'react'
import { Controller, type DefaultValues } from 'react-hook-form'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { SelectionCard } from '@components/onboarding/SelectionCard'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { useOnboarding, useOnboardingForm } from '@contexts/OnboardingContext'
import { colors, spacing, typography } from '@lib/theme/tokens'
import { TREATMENT_DURATION_OPTIONS } from '@lib/types/onboarding'
import {
  treatmentDurationSchema,
  type TreatmentDurationInput,
} from '@lib/validation/onboardingSchemas'

export default function TreatmentDurationScreen() {
  const { t } = useTranslation('onboarding')
  const { state, submitStep, goBack } = useOnboarding()
  const router = useRouter()

  const defaultValues = useMemo<DefaultValues<TreatmentDurationInput>>(
    () => ({
      ...(state.data.treatment_duration
        ? { treatment_duration: state.data.treatment_duration }
        : {}),
    }),
    [state.data.treatment_duration]
  )

  const { control, handleSubmit, formState, reset } = useOnboardingForm(
    treatmentDurationSchema,
    defaultValues
  )

  useEffect(() => {
    if (state.isHydrated) reset(defaultValues)
  }, [defaultValues, reset, state.isHydrated])

  const onSubmit = handleSubmit(async (data) => {
    await submitStep('treatment-duration', data)
    router.replace('/(onboarding)/medication' as Href)
  })

  function handleBack() {
    goBack()
    router.replace('/(onboarding)/treatment-status' as Href)
  }

  return (
    <OnboardingShell
      step="treatment-duration"
      stepNumber={6}
      totalSteps={14}
      headline={t('treatmentDuration.headline')}
      subtitle={t('treatmentDuration.subtitle')}
      onBack={handleBack}
      primaryCTA={{
        label: t('common.continue'),
        onPress: onSubmit,
        disabled: !formState.isValid || !state.isHydrated,
        loading: formState.isSubmitting,
      }}
    >
      <Controller
        control={control}
        name="treatment_duration"
        render={({ field, fieldState }) => (
          <View accessibilityRole="radiogroup" style={styles.options}>
            {TREATMENT_DURATION_OPTIONS.map((option) => (
              <SelectionCard
                key={option}
                title={t(`treatmentDuration.options.${option}`)}
                selected={field.value === option}
                onPress={() => field.onChange(option)}
                accessibilityLabel={t(`treatmentDuration.options.${option}`)}
                testID={`treatment-duration-${option}`}
              />
            ))}
            {fieldState.error ? <Text style={styles.error}>{fieldState.error.message}</Text> : null}
          </View>
        )}
      />
    </OnboardingShell>
  )
}

const styles = StyleSheet.create({
  options: {
    gap: spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.semanticCritical,
  },
})
