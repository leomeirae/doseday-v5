import { useEffect, useMemo } from 'react'
import { Controller, type DefaultValues } from 'react-hook-form'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { z } from 'zod'
import { NumericInput } from '@components/onboarding/NumericInput'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { useOnboarding, useOnboardingForm } from '@contexts/OnboardingContext'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'
import type { OnboardingMedication } from '@lib/types/onboarding'
import { doseSchema, type DoseInput } from '@lib/validation/onboardingSchemas'

const COMMON_DOSES: Record<OnboardingMedication, number[]> = {
  Mounjaro: [2.5, 5, 7.5, 10, 12.5, 15],
  Ozempic: [0.25, 0.5, 1, 2],
  Wegovy: [0.25, 0.5, 1, 1.7, 2.4],
  Saxenda: [0.6, 1.2, 1.8, 2.4, 3],
  Trulicity: [0.75, 1.5, 3, 4.5],
}

export default function DoseScreen() {
  const { t } = useTranslation('onboarding')
  const { state, submitStep, goBack } = useOnboarding()
  const router = useRouter()

  const medication = state.data.current_medication
  const commonDoses = medication ? COMMON_DOSES[medication] : []

  const defaultValues = useMemo<DefaultValues<DoseInput>>(
    () => ({
      ...(state.data.current_dose != null ? { current_dose: state.data.current_dose } : {}),
    }),
    [state.data.current_dose]
  )

  const { control, handleSubmit, formState, reset } = useOnboardingForm<DoseInput>(
    doseSchema as z.ZodType<DoseInput, DoseInput>,
    defaultValues
  )

  useEffect(() => {
    if (state.isHydrated) reset(defaultValues)
  }, [defaultValues, reset, state.isHydrated])

  const onSubmit = handleSubmit(async (data) => {
    const payload = doseSchema.parse(data)
    await submitStep('dose', payload)
    router.replace('/(onboarding)/dose-frequency' as Href)
  })

  async function handleSkipDose() {
    await submitStep('dose', { current_dose: null })
    router.replace('/(onboarding)/dose-frequency' as Href)
  }

  function handleBack() {
    goBack()
    router.replace('/(onboarding)/medication' as Href)
  }

  return (
    <OnboardingShell
      step="dose"
      stepNumber={8}
      totalSteps={15}
      headline={t('dose.headline')}
      subtitle={t('dose.subtitle')}
      onBack={handleBack}
      primaryCTA={{
        label: t('common.continue'),
        onPress: onSubmit,
        disabled: !formState.isValid || !state.isHydrated,
        loading: formState.isSubmitting,
      }}
      secondaryCTA={{
        label: t('dose.skipDose'),
        onPress: handleSkipDose,
      }}
    >
      <Controller
        control={control}
        name="current_dose"
        render={({ field, fieldState }) => (
          <View style={styles.stack}>
            <NumericInput
              label={t('dose.doseLabel')}
              suffix={t('dose.mgSuffix')}
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              returnKeyType="done"
              testID="dose-input"
            />
            {commonDoses.length > 0 && medication ? (
              <View style={styles.group}>
                <Text style={styles.groupLabel}>
                  {t('dose.commonDosesLabel', { medication })}
                </Text>
                <View style={styles.chips} accessibilityRole="radiogroup">
                  {commonDoses.map((dose) => {
                    const selected = Number(field.value) === dose
                    return (
                      <Pressable
                        key={dose}
                        onPress={() => field.onChange(String(dose))}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        accessibilityLabel={`${dose} ${t('dose.mgSuffix')}`}
                        testID={`dose-common-${dose}`}
                        style={[
                          styles.chip,
                          selected && styles.chipSelected,
                        ]}
                      >
                        <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                          {dose} {t('dose.mgSuffix')}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>
              </View>
            ) : null}
          </View>
        )}
      />
    </OnboardingShell>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  group: {
    gap: spacing.sm,
  },
  groupLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.semanticMuted,
  },
  chipSelected: {
    backgroundColor: colors.bgSurface,
    borderColor: colors.brand,
  },
  chipLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  chipLabelSelected: {
    color: colors.textPrimary,
  },
})
