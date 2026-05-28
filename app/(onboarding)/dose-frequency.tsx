import { useEffect, useMemo, useState } from 'react'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { z } from 'zod'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { useOnboarding, useOnboardingForm } from '@contexts/OnboardingContext'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'
import {
  doseFrequencySchema,
  type DoseFrequencyInput,
} from '@lib/validation/onboardingSchemas'

const INTERVAL_OPTIONS = [1, 7, 10, 14] as const
const NEXT: Href = '/(onboarding)/medical-support' as Href
const PREVIOUS: Href = '/(onboarding)/dose' as Href

export default function DoseFrequencyScreen() {
  const { t } = useTranslation('onboarding')
  const { state, submitStep, goBack } = useOnboarding()
  const router = useRouter()
  const [daysText, setDaysText] = useState('')

  const defaultValues = useMemo<DoseFrequencyInput>(
    () => ({
      dose_frequency_days: state.data.dose_frequency_days ?? null,
    }),
    [state.data.dose_frequency_days]
  )

  const { handleSubmit, formState, reset, setValue } = useOnboardingForm<DoseFrequencyInput>(
    doseFrequencySchema as z.ZodType<DoseFrequencyInput, DoseFrequencyInput>,
    defaultValues
  )

  useEffect(() => {
    if (!state.isHydrated) return
    reset(defaultValues)
    setDaysText(defaultValues.dose_frequency_days == null ? '' : String(defaultValues.dose_frequency_days))
  }, [defaultValues, reset, state.isHydrated])

  const parsedDays = useMemo(() => {
    if (daysText.trim() === '') return null
    const value = Number(daysText)
    return Number.isInteger(value) ? value : null
  }, [daysText])

  const isValid = parsedDays !== null && parsedDays >= 1 && parsedDays <= 90

  function setInterval(days: number) {
    setDaysText(String(days))
    setValue('dose_frequency_days', days, { shouldDirty: true, shouldValidate: true })
  }

  function handleChangeText(value: string) {
    const nextValue = value.replace(/[^0-9]/g, '')
    const nextNumber = nextValue === '' ? null : Number(nextValue)
    setDaysText(nextValue)
    setValue('dose_frequency_days', nextNumber, { shouldDirty: true, shouldValidate: true })
  }

  const onSubmit = handleSubmit(async () => {
    if (!isValid || parsedDays === null) return
    const payload = doseFrequencySchema.parse({
      dose_frequency_days: parsedDays,
    })
    await submitStep('dose-frequency', payload)
    router.replace(NEXT)
  })

  async function handleSkip() {
    await submitStep('dose-frequency', {
      dose_frequency_days: null,
    })
    router.replace(NEXT)
  }

  function handleBack() {
    goBack()
    router.replace(PREVIOUS)
  }

  return (
    <OnboardingShell
      step="dose-frequency"
      stepNumber={9}
      totalSteps={15}
      headline={t('doseFrequency.headline')}
      subtitle={t('doseFrequency.subtitle')}
      onBack={handleBack}
      primaryCTA={{
        label: t('common.continue'),
        onPress: onSubmit,
        disabled: !isValid || !state.isHydrated,
        loading: formState.isSubmitting,
      }}
      secondaryCTA={{
        label: t('doseFrequency.skip'),
        onPress: handleSkip,
      }}
    >
      <View style={styles.stack}>
        <View style={styles.chips}>
          {INTERVAL_OPTIONS.map((days) => {
            const selected = parsedDays === days
            return (
              <Pressable
                key={days}
                onPress={() => setInterval(days)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={t('doseFrequency.optionA11y', { count: days })}
                testID={`dose-frequency-${days}`}
                style={[
                  styles.chip,
                  selected && styles.chipSelected,
                ]}
              >
                <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
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
              onChangeText={handleChangeText}
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
          {daysText.trim() !== '' && !isValid ? (
            <Text style={styles.error}>{t('doseFrequency.error')}</Text>
          ) : null}
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>{t('doseFrequency.note')}</Text>
        </View>
      </View>
    </OnboardingShell>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.xl,
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
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  chipLabelSelected: {
    color: colors.textInverse,
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
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md,
    borderWidth: 0.5,
    padding: spacing.md,
  },
  noteText: {
    ...typography.caption,
    color: colors.textTertiary,
    lineHeight: 20,
  },
})
