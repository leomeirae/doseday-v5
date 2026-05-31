import { useEffect, useMemo, useState } from 'react'
import { Controller, type DefaultValues } from 'react-hook-form'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import type { z } from 'zod'
import { SelectionCard } from '@components/onboarding/SelectionCard'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { TextField } from '@components/ui/TextField'
import { useOnboarding, useOnboardingForm } from '@contexts/OnboardingContext'
import { colors, spacing, typography } from '@lib/theme/tokens'
import type { MedicalSupport } from '@lib/types/onboarding'
import {
  COUNTED_STEPS_TOTAL,
  getCountedStepNumber,
  medicalSupportSchema,
  type MedicalSupportInput,
} from '@lib/validation/onboardingSchemas'

const SUPPORT_ORDER: MedicalSupport[] = ['yes', 'sometimes', 'no']
const NEXT: Href = '/(onboarding)/concerns' as Href

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

  const { control, handleSubmit, formState, reset, watch } = useOnboardingForm<MedicalSupportInput>(
    medicalSupportSchema as z.ZodType<MedicalSupportInput, MedicalSupportInput>,
    defaultValues
  )

  // Nome do médico (opcional) — gerido em estado local; só aparece com suporte.
  const [doctorName, setDoctorName] = useState('')
  const support = watch('has_medical_support')
  const showDoctorField = support === 'yes' || support === 'sometimes'

  useEffect(() => {
    if (!state.isHydrated) return
    reset(defaultValues)
    setDoctorName(state.data.doctor_name ?? '')
  }, [defaultValues, reset, state.data.doctor_name, state.isHydrated])

  const onSubmit = handleSubmit(async (data) => {
    const payload = medicalSupportSchema.parse(data)
    const trimmed = doctorName.trim()
    const showsDoctor = payload.has_medical_support !== 'no'
    await submitStep('medical-support', {
      has_medical_support: payload.has_medical_support,
      ...(showsDoctor && trimmed.length > 0 ? { doctor_name: trimmed } : {}),
    })
    router.replace(NEXT)
  })

  function handleBack() {
    goBack()
    router.replace('/(onboarding)/weight' as Href)
  }

  return (
    <OnboardingShell
      step="medical-support"
      stepNumber={getCountedStepNumber('medical-support')}
      totalSteps={COUNTED_STEPS_TOTAL}
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
      <View style={styles.stack}>
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

        {showDoctorField ? (
          <View style={styles.doctorGroup}>
            <TextField
              label={t('doctorName.doctorNameLabel')}
              placeholder={t('doctorName.doctorNamePlaceholder')}
              value={doctorName}
              onChangeText={setDoctorName}
              autoCapitalize="words"
              testID="doctor-name-input"
            />
            <Text style={styles.note}>{t('doctorName.skipNote')}</Text>
          </View>
        ) : null}
      </View>
    </OnboardingShell>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  options: {
    gap: spacing.sm,
  },
  doctorGroup: {
    gap: spacing.sm,
  },
  note: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  error: {
    ...typography.caption,
    color: colors.semanticCritical,
  },
})
