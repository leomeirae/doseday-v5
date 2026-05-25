import { useEffect, useMemo } from 'react'
import { Controller, type DefaultValues } from 'react-hook-form'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import type { z } from 'zod'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { TextField } from '@components/ui/TextField'
import { useOnboarding, useOnboardingForm } from '@contexts/OnboardingContext'
import { colors, spacing, typography } from '@lib/theme/tokens'
import { doctorNameSchema, type DoctorNameInput } from '@lib/validation/onboardingSchemas'

const NEXT: Href = '/(onboarding)/concerns' as Href

export default function DoctorNameScreen() {
  const { t } = useTranslation('onboarding')
  const { state, submitStep, goBack } = useOnboarding()
  const router = useRouter()

  const defaultValues = useMemo<DefaultValues<DoctorNameInput>>(
    () => ({ doctor_name: state.data.doctor_name ?? '' }),
    [state.data.doctor_name]
  )

  const { control, handleSubmit, formState, reset } = useOnboardingForm<DoctorNameInput>(
    doctorNameSchema as z.ZodType<DoctorNameInput, DoctorNameInput>,
    defaultValues
  )

  useEffect(() => {
    if (state.isHydrated) reset(defaultValues)
  }, [defaultValues, reset, state.isHydrated])

  const onSubmit = handleSubmit(async (data) => {
    const payload = doctorNameSchema.parse(data)
    const trimmed = payload.doctor_name?.trim()
    await submitStep('doctor-name', trimmed ? { doctor_name: trimmed } : {})
    router.replace(NEXT)
  })

  async function handleSkip() {
    await submitStep('doctor-name', {})
    router.replace(NEXT)
  }

  function handleBack() {
    goBack()
    router.replace('/(onboarding)/medical-support' as Href)
  }

  return (
    <OnboardingShell
      step="doctor-name"
      stepNumber={11}
      totalSteps={15}
      headline={t('doctorName.headline')}
      subtitle={t('doctorName.subtitle')}
      onBack={handleBack}
      primaryCTA={{
        label: t('common.continue'),
        onPress: onSubmit,
        disabled: !state.isHydrated,
        loading: formState.isSubmitting,
      }}
      secondaryCTA={{
        label: t('common.skip'),
        onPress: handleSkip,
      }}
    >
      <View style={styles.stack}>
        <Controller
          control={control}
          name="doctor_name"
          render={({ field, fieldState }) => (
            <TextField
              label={t('doctorName.doctorNameLabel')}
              placeholder={t('doctorName.doctorNamePlaceholder')}
              value={field.value ?? ''}
              onChangeText={field.onChange}
              autoCapitalize="words"
              testID="doctor-name-input"
              {...(fieldState.error?.message ? { error: fieldState.error.message } : {})}
            />
          )}
        />
        <Text style={styles.note}>{t('doctorName.skipNote')}</Text>
      </View>
    </OnboardingShell>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.sm,
  },
  note: {
    ...typography.caption,
    color: colors.textTertiary,
  },
})
