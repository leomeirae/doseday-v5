import { useEffect, useMemo } from 'react'
import { Controller, type DefaultValues } from 'react-hook-form'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import type { z } from 'zod'
import { NumericInput } from '@components/onboarding/NumericInput'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { WeightDeltaDisplay } from '@components/onboarding/WeightDeltaDisplay'
import { useOnboarding, useOnboardingForm } from '@contexts/OnboardingContext'
import { spacing } from '@lib/theme/tokens'
import {
  goalWeightSchema,
  type GoalWeightInput,
} from '@lib/validation/onboardingSchemas'

export default function GoalWeightScreen() {
  const { t } = useTranslation('onboarding')
  const { state, submitStep, goBack } = useOnboarding()
  const router = useRouter()

  const defaultValues = useMemo<DefaultValues<GoalWeightInput>>(
    () => ({
      ...(state.data.goal_weight !== undefined ? { goal_weight: state.data.goal_weight } : {}),
    }),
    [state.data.goal_weight]
  )

  const { control, handleSubmit, formState, reset, watch } = useOnboardingForm<GoalWeightInput>(
    goalWeightSchema as z.ZodType<GoalWeightInput, GoalWeightInput>,
    defaultValues
  )
  const goalWeight = watch('goal_weight')

  useEffect(() => {
    if (state.isHydrated) reset(defaultValues)
  }, [defaultValues, reset, state.isHydrated])

  const onSubmit = handleSubmit(async (data) => {
    const payload = goalWeightSchema.parse(data)
    await submitStep('goal-weight', payload)
    router.replace('/(onboarding)/treatment-status' as Href)
  })

  function handleBack() {
    goBack()
    router.replace('/(onboarding)/weight' as Href)
  }

  return (
    <OnboardingShell
      step="goal-weight"
      stepNumber={4}
      totalSteps={14}
      headline={t('goalWeight.headline')}
      subtitle={t('goalWeight.subtitle')}
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
          name="goal_weight"
          render={({ field, fieldState }) => (
            <NumericInput
              label={t('goalWeight.goalWeightLabel')}
              suffix={t('goalWeight.kgSuffix')}
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              returnKeyType="done"
              testID="goal-weight-input"
            />
          )}
        />
        <WeightDeltaDisplay
          currentWeight={state.data.current_weight}
          goalWeight={Number(goalWeight)}
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
