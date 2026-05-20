import { useEffect, useMemo } from 'react'
import { Controller, type DefaultValues } from 'react-hook-form'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import type { z } from 'zod'
import { SelectionCard } from '@components/onboarding/SelectionCard'
import { NumericInput } from '@components/onboarding/NumericInput'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { TextField } from '@components/ui/TextField'
import { useOnboarding, useOnboardingForm } from '@contexts/OnboardingContext'
import { BIOLOGICAL_SEX_OPTIONS } from '@lib/types/onboarding'
import {
  personalInfoSchema,
  type PersonalInfoInput,
} from '@lib/validation/onboardingSchemas'
import { colors, spacing, typography } from '@lib/theme/tokens'

export default function PersonalInfoScreen() {
  const { t } = useTranslation('onboarding')
  const { state, submitStep, goBack } = useOnboarding()
  const router = useRouter()

  const defaultValues = useMemo<DefaultValues<PersonalInfoInput>>(
    () => ({
      full_name: state.data.full_name ?? '',
      ...(state.data.age !== undefined ? { age: state.data.age } : {}),
      ...(state.data.biological_sex ? { biological_sex: state.data.biological_sex } : {}),
    }),
    [state.data.age, state.data.biological_sex, state.data.full_name]
  )

  const { control, handleSubmit, formState, reset } = useOnboardingForm<PersonalInfoInput>(
    personalInfoSchema as z.ZodType<PersonalInfoInput, PersonalInfoInput>,
    defaultValues
  )

  useEffect(() => {
    if (state.isHydrated) reset(defaultValues)
  }, [defaultValues, reset, state.isHydrated])

  const onSubmit = handleSubmit(async (data) => {
    const payload = personalInfoSchema.parse(data)
    await submitStep('personal-info', payload)
    router.replace('/(onboarding)/weight' as Href)
  })

  function handleBack() {
    goBack()
    router.replace('/(onboarding)/welcome' as Href)
  }

  return (
    <OnboardingShell
      step="personal-info"
      stepNumber={2}
      totalSteps={14}
      headline={t('personalInfo.headline')}
      subtitle={t('personalInfo.subtitle')}
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
          name="full_name"
          render={({ field, fieldState }) => (
            <TextField
              label={t('personalInfo.fullNameLabel')}
              placeholder={t('personalInfo.fullNamePlaceholder')}
              value={field.value}
              onChangeText={field.onChange}
              autoCapitalize="words"
              textContentType="name"
              testID="personal-info-full-name"
              {...(fieldState.error?.message ? { error: fieldState.error.message } : {})}
            />
          )}
        />

        <Controller
          control={control}
          name="age"
          render={({ field, fieldState }) => (
            <NumericInput
              label={t('personalInfo.ageLabel')}
              placeholder={t('personalInfo.agePlaceholder')}
              suffix={t('personalInfo.agePlaceholder')}
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              decimals={false}
              testID="personal-info-age"
            />
          )}
        />

        <View style={styles.group}>
          <Text style={styles.groupLabel}>{t('personalInfo.biologicalSexLabel')}</Text>
          <Text style={styles.groupCaption}>{t('personalInfo.biologicalSexCaption')}</Text>
          <Controller
            control={control}
            name="biological_sex"
            render={({ field, fieldState }) => (
              <View accessibilityRole="radiogroup" style={styles.options}>
                {BIOLOGICAL_SEX_OPTIONS.map((option) => (
                  <SelectionCard
                    key={option}
                    title={t(`personalInfo.biologicalSexOptions.${option}`)}
                    selected={field.value === option}
                    onPress={() => field.onChange(option)}
                    accessibilityLabel={t(`personalInfo.biologicalSexOptions.${option}`)}
                    accessibilityHint={t('personalInfo.biologicalSexCaption')}
                    testID={`personal-info-sex-${option}`}
                  />
                ))}
                {fieldState.error ? (
                  <Text style={styles.error}>{fieldState.error.message}</Text>
                ) : null}
              </View>
            )}
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
    gap: spacing.xs,
  },
  groupLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  groupCaption: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  options: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  error: {
    ...typography.caption,
    color: colors.semanticCritical,
  },
})
