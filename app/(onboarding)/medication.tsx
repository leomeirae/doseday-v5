import { useEffect, useMemo } from 'react'
import { Controller, type DefaultValues } from 'react-hook-form'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { SelectionCard } from '@components/onboarding/SelectionCard'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { useOnboarding, useOnboardingForm } from '@contexts/OnboardingContext'
import { colors, spacing, typography } from '@lib/theme/tokens'
import { MEDICATION_OPTIONS } from '@lib/types/onboarding'
import { medicationSchema, type MedicationInput } from '@lib/validation/onboardingSchemas'

export default function MedicationScreen() {
  const { t } = useTranslation('onboarding')
  const { state, submitStep, goBack } = useOnboarding()
  const router = useRouter()

  const defaultValues = useMemo<DefaultValues<MedicationInput>>(
    () => ({
      ...(state.data.current_medication
        ? { current_medication: state.data.current_medication }
        : {}),
    }),
    [state.data.current_medication]
  )

  const { control, handleSubmit, formState, reset } = useOnboardingForm(
    medicationSchema,
    defaultValues
  )

  useEffect(() => {
    if (state.isHydrated) reset(defaultValues)
  }, [defaultValues, reset, state.isHydrated])

  const onSubmit = handleSubmit(async (data) => {
    await submitStep('medication', data)
    router.replace('/(onboarding)' as Href)
  })

  function handleBack() {
    goBack()
    const backRoute =
      state.data.treatment_status === 'planning'
        ? '/(onboarding)/treatment-status'
        : '/(onboarding)/treatment-duration'
    router.replace(backRoute as Href)
  }

  return (
    <OnboardingShell
      step="medication"
      stepNumber={7}
      totalSteps={14}
      headline={t('medication.headline')}
      subtitle={t('medication.subtitle')}
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
        name="current_medication"
        render={({ field, fieldState }) => (
          <View accessibilityRole="radiogroup" style={styles.options}>
            {MEDICATION_OPTIONS.map((option) => (
              <SelectionCard
                key={option}
                title={t(`medication.options.${option}.label`)}
                caption={t(`medication.options.${option}.caption`)}
                selected={field.value === option}
                onPress={() => field.onChange(option)}
                accessibilityLabel={t(`medication.options.${option}.label`)}
                accessibilityHint={t(`medication.options.${option}.caption`)}
                testID={`medication-${option}`}
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
