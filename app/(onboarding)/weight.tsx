import { useEffect, useMemo } from 'react'
import { Controller, type DefaultValues } from 'react-hook-form'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import type { z } from 'zod'
import { NumericInput } from '@components/onboarding/NumericInput'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { useOnboarding, useOnboardingForm } from '@contexts/OnboardingContext'
import { spacing } from '@lib/theme/tokens'
import { weightSchema, type WeightInput } from '@lib/validation/onboardingSchemas'

export default function WeightScreen() {
  const { t } = useTranslation('onboarding')
  const { state, submitStep, goBack } = useOnboarding()
  const router = useRouter()

  const defaultValues = useMemo<DefaultValues<WeightInput>>(
    () => ({
      ...(state.data.initial_weight !== undefined
        ? { initial_weight: state.data.initial_weight }
        : {}),
      ...(state.data.current_weight !== undefined
        ? { current_weight: state.data.current_weight }
        : {}),
      ...(state.data.height !== undefined ? { height: state.data.height } : {}),
    }),
    [state.data.current_weight, state.data.height, state.data.initial_weight]
  )

  const { control, handleSubmit, formState, reset } = useOnboardingForm<WeightInput>(
    weightSchema as z.ZodType<WeightInput, WeightInput>,
    defaultValues
  )

  useEffect(() => {
    if (state.isHydrated) reset(defaultValues)
  }, [defaultValues, reset, state.isHydrated])

  const onSubmit = handleSubmit(async (data) => {
    const payload = weightSchema.parse(data)
    await submitStep('weight', payload)
    router.replace('/(onboarding)/goal-weight' as Href)
  })

  function handleBack() {
    goBack()
    router.replace('/(onboarding)/personal-info' as Href)
  }

  return (
    <OnboardingShell
      step="weight"
      stepNumber={3}
      totalSteps={14}
      headline={t('weight.headline')}
      subtitle={t('weight.subtitle')}
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
          name="initial_weight"
          render={({ field, fieldState }) => (
            <NumericInput
              label={t('weight.initialWeightLabel')}
              caption={t('weight.initialWeightCaption')}
              suffix={t('weight.kgSuffix')}
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              testID="weight-initial"
            />
          )}
        />
        <Controller
          control={control}
          name="current_weight"
          render={({ field, fieldState }) => (
            <NumericInput
              label={t('weight.currentWeightLabel')}
              suffix={t('weight.kgSuffix')}
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              testID="weight-current"
            />
          )}
        />
        <Controller
          control={control}
          name="height"
          render={({ field, fieldState }) => (
            <NumericInput
              label={t('weight.heightLabel')}
              suffix={t('weight.cmSuffix')}
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              decimals={false}
              returnKeyType="done"
              testID="weight-height"
            />
          )}
        />
      </View>
    </OnboardingShell>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
})
