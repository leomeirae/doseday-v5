import { useEffect, useMemo } from 'react'
import { Controller, type DefaultValues } from 'react-hook-form'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import type { z } from 'zod'
import { SelectionCard } from '@components/onboarding/SelectionCard'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { useOnboarding, useOnboardingForm } from '@contexts/OnboardingContext'
import { colors, spacing, typography } from '@lib/theme/tokens'
import type { MedicalSupport } from '@lib/types/onboarding'
import {
  medicalSupportSchema,
  type MedicalSupportInput,
} from '@lib/validation/onboardingSchemas'

const SUPPORT_ORDER: MedicalSupport[] = ['yes', 'sometimes', 'no']

export default function MedicalSupportScreen() {
  const { t } = useTranslation('onboarding')
  const { state, submitStep, goBack } = useOnboarding()
  const router = useRouter()

  const defaultValues = useMemo<DefaultValues<MedicalSupportInput>>(
    () => ({
      ...(state.data.has_medical_support
        ? { has_medical_support: state.data.has_medical_support }
        : {}),
    }),
    [state.data.has_medical_support]
  )

  const { control, handleSubmit, formState, reset } = useOnboardingForm<MedicalSupportInput>(
    medicalSupportSchema as z.ZodType<MedicalSupportInput, MedicalSupportInput>,
    defaultValues
  )

  useEffect(() => {
    if (state.isHydrated) reset(defaultValues)
  }, [defaultValues, reset, state.isHydrated])

  const onSubmit = handleSubmit(async (data) => {
    const payload = medicalSupportSchema.parse(data)
    await submitStep('medical-support', payload)
    if (payload.has_medical_support === 'no') {
      router.replace('/(onboarding)/concerns' as Href)
    } else {
      router.replace('/(onboarding)/doctor-name' as Href)
    }
  })

  function handleBack() {
    goBack()
    router.replace('/(onboarding)/dose-frequency' as Href)
  }

  return (
    <OnboardingShell
      step="medical-support"
      stepNumber={10}
      totalSteps={15}
      headline={t('medicalSupport.headline')}
      subtitle={t('medicalSupport.subtitle')}
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
        name="has_medical_support"
        render={({ field, fieldState }) => (
          <View accessibilityRole="radiogroup" style={styles.options}>
            {SUPPORT_ORDER.map((option) => (
              <SelectionCard
                key={option}
                title={t(`medicalSupport.options.${option}.label`)}
                caption={t(`medicalSupport.options.${option}.caption`)}
                selected={field.value === option}
                onPress={() => field.onChange(option)}
                accessibilityLabel={t(`medicalSupport.options.${option}.label`)}
                accessibilityHint={t(`medicalSupport.options.${option}.caption`)}
                testID={`medical-support-${option}`}
              />
            ))}
            {fieldState.error ? (
              <Text style={styles.error}>{fieldState.error.message}</Text>
            ) : null}
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
