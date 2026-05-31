import { useEffect, useMemo, useState } from 'react'
import { Controller, type DefaultValues } from 'react-hook-form'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { z } from 'zod'
import { NumericInput } from '@components/onboarding/NumericInput'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { useOnboarding, useOnboardingForm } from '@contexts/OnboardingContext'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'
import type { OnboardingMedication } from '@lib/types/onboarding'
import {
  COUNTED_STEPS_TOTAL,
  doseSchema,
  getCountedStepNumber,
  type DoseInput,
} from '@lib/validation/onboardingSchemas'

const COMMON_DOSES: Record<OnboardingMedication, number[]> = {
  Mounjaro: [2.5, 5, 7.5, 10, 12.5, 15],
  Ozempic: [0.25, 0.5, 1, 2],
  Wegovy: [0.25, 0.5, 1, 1.7, 2.4],
  Saxenda: [0.6, 1.2, 1.8, 2.4, 3],
  Trulicity: [0.75, 1.5, 3, 4.5],
}

const INTERVAL_OPTIONS = [1, 7, 10, 14] as const
const NEXT: Href = '/(onboarding)/weight' as Href
const PREVIOUS: Href = '/(onboarding)/medication' as Href

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

  // Frequência do lembrete (opcional) — gerida em estado local; null = sem lembrete.
  const [daysText, setDaysText] = useState('')

  useEffect(() => {
    if (!state.isHydrated) return
    reset(defaultValues)
    setDaysText(
      state.data.dose_frequency_days == null ? '' : String(state.data.dose_frequency_days)
    )
  }, [defaultValues, reset, state.data.dose_frequency_days, state.isHydrated])

  const parsedDays = useMemo(() => {
    if (daysText.trim() === '') return null
    const value = Number(daysText)
    return Number.isInteger(value) ? value : null
  }, [daysText])

  const frequencyInvalid = daysText.trim() !== '' && (parsedDays === null || parsedDays < 1 || parsedDays > 90)

  function selectInterval(days: number) {
    setDaysText(String(days))
  }

  function handleChangeDays(value: string) {
    setDaysText(value.replace(/[^0-9]/g, ''))
  }

  function buildFrequency(): number | null {
    if (parsedDays !== null && parsedDays >= 1 && parsedDays <= 90) return parsedDays
    return null
  }

  const onSubmit = handleSubmit(async (data) => {
    if (frequencyInvalid) return
    const payload = doseSchema.parse(data)
    await submitStep('dose', {
      current_dose: payload.current_dose,
      dose_frequency_days: buildFrequency(),
    })
    router.replace(NEXT)
  })

  async function handleSkipDose() {
    if (frequencyInvalid) return
    await submitStep('dose', {
      current_dose: null,
      dose_frequency_days: buildFrequency(),
    })
    router.replace(NEXT)
  }

  function handleBack() {
    goBack()
    router.replace(PREVIOUS)
  }

  return (
    <OnboardingShell
      step="dose"
      stepNumber={getCountedStepNumber('dose')}
      totalSteps={COUNTED_STEPS_TOTAL}
      headline={t('dose.headline')}
      subtitle={t('dose.subtitle')}
      onBack={handleBack}
      primaryCTA={{
        label: t('common.continue'),
        onPress: onSubmit,
        disabled: !formState.isValid || frequencyInvalid || !state.isHydrated,
        loading: formState.isSubmitting,
      }}
      secondaryCTA={{
        label: t('dose.skipDose'),
        onPress: handleSkipDose,
      }}
    >
      <View style={styles.stack}>
        <Controller
          control={control}
          name="current_dose"
          render={({ field, fieldState }) => (
            <View style={styles.group}>
              <NumericInput
                label={t('dose.doseLabel')}
                suffix={t('dose.mgSuffix')}
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
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
                          style={[styles.chip, selected && styles.chipSelected]}
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

        <View style={styles.divider} />

        <View style={styles.group}>
          <View style={styles.frequencyHeader}>
            <Text style={styles.frequencyTitle}>{t('dose.frequencyTitle')}</Text>
            <Text style={styles.frequencyHint}>{t('dose.frequencySubtitle')}</Text>
          </View>
          <View style={styles.chips}>
            {INTERVAL_OPTIONS.map((days) => {
              const selected = parsedDays === days
              return (
                <Pressable
                  key={days}
                  onPress={() => selectInterval(days)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={t('doseFrequency.optionA11y', { count: days })}
                  testID={`dose-frequency-${days}`}
                  style={[styles.chip, selected && styles.intervalChipSelected]}
                >
                  <Text style={[styles.chipLabel, selected && styles.intervalChipLabelSelected]}>
                    {t(days === 1 ? 'doseFrequency.optionOne' : 'doseFrequency.optionOther', {
                      count: days,
                    })}
                  </Text>
                </Pressable>
              )
            })}
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('doseFrequency.otherLabel')}</Text>
            <View style={styles.inputCard}>
              <TextInput
                value={daysText}
                onChangeText={handleChangeDays}
                keyboardType="number-pad"
                placeholder={t('doseFrequency.placeholder')}
                placeholderTextColor={colors.textTertiary}
                style={styles.input}
                maxLength={2}
                accessibilityLabel={t('doseFrequency.inputA11y')}
                testID="dose-frequency-input"
              />
              <Text style={styles.inputSuffix}>{t('doseFrequency.daysSuffix')}</Text>
            </View>
            {frequencyInvalid ? <Text style={styles.error}>{t('doseFrequency.error')}</Text> : null}
          </View>
          <Text style={styles.note}>{t('dose.frequencyNote')}</Text>
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
  intervalChipSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  intervalChipLabelSelected: {
    color: colors.textInverse,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  frequencyHeader: {
    gap: spacing.xxs,
  },
  frequencyTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  frequencyHint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputCard: {
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    borderWidth: 0.5,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  input: {
    ...typography.headline,
    color: colors.textPrimary,
    flex: 1,
    minHeight: 64,
    paddingVertical: 0,
  },
  inputSuffix: {
    ...typography.body,
    color: colors.textSecondary,
  },
  error: {
    ...typography.caption,
    color: colors.semanticCritical,
  },
  note: {
    ...typography.caption,
    color: colors.textTertiary,
    lineHeight: 20,
  },
})
