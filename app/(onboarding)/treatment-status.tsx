import { useEffect, useMemo } from 'react'
import { Controller, type DefaultValues } from 'react-hook-form'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { SelectionCard } from '@components/onboarding/SelectionCard'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { useOnboarding, useOnboardingForm } from '@contexts/OnboardingContext'
import { colors, spacing, typography } from '@lib/theme/tokens'
import { TREATMENT_STATUS_OPTIONS } from '@lib/types/onboarding'
import {
  treatmentStatusSchema,
  type TreatmentStatusInput,
} from '@lib/validation/onboardingSchemas'

export default function TreatmentStatusScreen() {
  const { t } = useTranslation('onboarding')
  const { state, submitStep, goBack } = useOnboarding()
  const router = useRouter()

  const defaultValues = useMemo<DefaultValues<TreatmentStatusInput>>(
    () => ({
      ...(state.data.treatment_status ? { treatment_status: state.data.treatment_status } : {}),
    }),
    [state.data.treatment_status]
  )

  const { control, handleSubmit, formState, reset } = useOnboardingForm(
    treatmentStatusSchema,
    defaultValues
  )

  useEffect(() => {
    if (state.isHydrated) reset(defaultValues)
  }, [defaultValues, reset, state.isHydrated])

  const onSubmit = handleSubmit(async (data) => {
    await submitStep('treatment-status', data)
    if (data.treatment_status === 'planning') {
      await submitStep('treatment-duration', { treatment_duration: null })
      router.replace('/(onboarding)/medication' as Href)
    } else {
      router.replace('/(onboarding)/treatment-duration' as Href)
    }
  })

  function handleBack() {
    goBack()
    router.replace('/(onboarding)/goal-weight' as Href)
  }

  return (
    <OnboardingShell
      step="treatment-status"
      stepNumber={5}
      totalSteps={14}
      headline={t('treatmentStatus.headline')}
      subtitle={t('treatmentStatus.subtitle')}
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
        name="treatment_status"
        render={({ field, fieldState }) => (
          <View accessibilityRole="radiogroup" style={styles.options}>
            {TREATMENT_STATUS_OPTIONS.map((option) => (
              <SelectionCard
                key={option}
                title={t(`treatmentStatus.options.${option}.label`)}
                caption={t(`treatmentStatus.options.${option}.caption`)}
                selected={field.value === option}
                onPress={() => field.onChange(option)}
                accessibilityLabel={t(`treatmentStatus.options.${option}.label`)}
                accessibilityHint={t(`treatmentStatus.options.${option}.caption`)}
                testID={`treatment-status-${option}`}
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
