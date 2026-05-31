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
  COUNTED_STEPS_TOTAL,
  getCountedStepNumber,
  weightWithGoalSchema,
  type WeightWithGoalInput,
} from '@lib/validation/onboardingSchemas'

export default function WeightScreen() {
  const { t } = useTranslation('onboarding')
  const { state, submitStep, goBack } = useOnboarding()
  const router = useRouter()

  const defaultValues = useMemo<DefaultValues<WeightWithGoalInput>>(
    () => ({
      ...(state.data.initial_weight !== undefined
        ? { initial_weight: state.data.initial_weight }
        : {}),
      ...(state.data.current_weight !== undefined
        ? { current_weight: state.data.current_weight }
        : {}),
      ...(state.data.height !== undefined ? { height: state.data.height } : {}),
      ...(state.data.goal_weight !== undefined ? { goal_weight: state.data.goal_weight } : {}),
    }),
    [state.data.current_weight, state.data.goal_weight, state.data.height, state.data.initial_weight]
  )

  const { control, handleSubmit, formState, reset, watch } = useOnboardingForm<WeightWithGoalInput>(
    weightWithGoalSchema as z.ZodType<WeightWithGoalInput, WeightWithGoalInput>,
    defaultValues
  )
  const goalWeight = watch('goal_weight')
  const currentWeight = watch('current_weight')

  useEffect(() => {
    if (state.isHydrated) reset(defaultValues)
  }, [defaultValues, reset, state.isHydrated])

  const onSubmit = handleSubmit(async (data) => {
    const payload = weightWithGoalSchema.parse(data)
    await submitStep('weight', payload)
    router.replace('/(onboarding)/medical-support' as Href)
  })

  function handleBack() {
    goBack()
    router.replace('/(onboarding)/dose' as Href)
  }

  return (
    <OnboardingShell
      step="weight"
      stepNumber={getCountedStepNumber('weight')}
      totalSteps={COUNTED_STEPS_TOTAL}
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
        <View style={styles.group}>
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
                testID="weight-height"
              />
            )}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.group}>
          <Controller
            control={control}
            name="goal_weight"
            render={({ field, fieldState }) => (
              <NumericInput
                label={t('goalWeight.goalWeightLabel')}
                suffix={t('weight.kgSuffix')}
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
                returnKeyType="done"
                testID="goal-weight-input"
              />
            )}
          />
          <WeightDeltaDisplay
            currentWeight={currentWeight ?? state.data.current_weight}
            goalWeight={Number(goalWeight)}
          />
        </View>
      </View>
    </OnboardingShell>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  group: {
    gap: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
})
