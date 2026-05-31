import { useEffect, useMemo } from 'react'
import { Controller, type DefaultValues } from 'react-hook-form'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import type { z } from 'zod'
import { ConcernsChips } from '@components/onboarding/ConcernsChips'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { useOnboarding, useOnboardingForm } from '@contexts/OnboardingContext'
import { CONCERN_OPTIONS, type OnboardingConcern } from '@lib/types/onboarding'
import {
  COUNTED_STEPS_TOTAL,
  concernsSchema,
  getCountedStepNumber,
  type ConcernsInput,
} from '@lib/validation/onboardingSchemas'

const NEXT: Href = '/(onboarding)/consent' as Href

export default function ConcernsScreen() {
  const { t } = useTranslation('onboarding')
  const { state, submitStep, goBack } = useOnboarding()
  const router = useRouter()

  const defaultValues = useMemo<DefaultValues<ConcernsInput>>(
    () => ({ main_concerns: state.data.main_concerns ?? [] }),
    [state.data.main_concerns]
  )

  const { control, handleSubmit, formState, reset } = useOnboardingForm<ConcernsInput>(
    concernsSchema as z.ZodType<ConcernsInput, ConcernsInput>,
    defaultValues
  )

  useEffect(() => {
    if (state.isHydrated) reset(defaultValues)
  }, [defaultValues, reset, state.isHydrated])

  const onSubmit = handleSubmit(async (data) => {
    const payload = concernsSchema.parse(data)
    await submitStep('concerns', payload.main_concerns ? { main_concerns: payload.main_concerns } : {})
    router.replace(NEXT)
  })

  async function handleSkip() {
    await submitStep('concerns', {})
    router.replace(NEXT)
  }

  function handleBack() {
    goBack()
    router.replace('/(onboarding)/medical-support' as Href)
  }

  return (
    <OnboardingShell
      step="concerns"
      stepNumber={getCountedStepNumber('concerns')}
      totalSteps={COUNTED_STEPS_TOTAL}
      headline={t('concerns.headline')}
      subtitle={t('concerns.subtitle')}
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
      <Controller
        control={control}
        name="main_concerns"
        render={({ field }) => {
          const selected = field.value ?? []
          return (
            <ConcernsChips
              options={CONCERN_OPTIONS}
              selected={selected}
              labelFor={(value) => t(`concerns.options.${value}`)}
              onToggle={(value) => {
                const concern = value as OnboardingConcern
                field.onChange(
                  selected.includes(concern)
                    ? selected.filter((item) => item !== concern)
                    : [...selected, concern]
                )
              }}
            />
          )
        }}
      />
    </OnboardingShell>
  )
}
