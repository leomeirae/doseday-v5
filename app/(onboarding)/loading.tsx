import { useEffect, useRef, useState } from 'react'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useReducedMotion } from 'react-native-reanimated'
import {
  LoadingStepIndicator,
  type LoadingStepStatus,
} from '@components/onboarding/LoadingStepIndicator'
import { PulseAnimation } from '@components/onboarding/PulseAnimation'
import { useOnboarding } from '@contexts/OnboardingContext'
import { useOnboardingInsight } from '@hooks/useOnboardingInsight'
import { colors, spacing, typography } from '@lib/theme/tokens'

const STEP_KEYS = ['stage', 'patterns', 'reminders', 'memory', 'insight'] as const
const STEP_INTERVAL_MS = 900
const MIN_DURATION_MS = 5000
const MAX_DURATION_MS = 15000

export default function LoadingScreen() {
  const { t } = useTranslation('onboarding')
  const { state, submitStep } = useOnboarding()
  const router = useRouter()
  const reducedMotion = useReducedMotion()

  const isPlanning = state.data.treatment_status === 'planning'
  const insight = useOnboardingInsight(state.data, !isPlanning)

  const [stepIndex, setStepIndex] = useState(0)
  const [minElapsed, setMinElapsed] = useState(false)
  const [maxElapsed, setMaxElapsed] = useState(false)
  const navigatedRef = useRef(false)

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((index) => (index >= STEP_KEYS.length ? index : index + 1))
    }, STEP_INTERVAL_MS)
    const minTimer = setTimeout(() => setMinElapsed(true), MIN_DURATION_MS)
    const maxTimer = setTimeout(() => setMaxElapsed(true), MAX_DURATION_MS)
    return () => {
      clearInterval(stepTimer)
      clearTimeout(minTimer)
      clearTimeout(maxTimer)
    }
  }, [])

  const aiSettled = isPlanning || insight.isSuccess || insight.isError || maxElapsed
  const stepsDone = stepIndex >= STEP_KEYS.length
  const ready = minElapsed && aiSettled && stepsDone

  useEffect(() => {
    if (!ready || navigatedRef.current) return
    navigatedRef.current = true
    submitStep('loading', {})
    router.replace('/(onboarding)/result' as Href)
  }, [ready, router, submitStep])

  const showFallback = insight.isError
  const headline = t(showFallback ? 'loading.fallback.headline' : 'loading.headline')
  const subtitle = t(showFallback ? 'loading.fallback.subtitle' : 'loading.subtitle')

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <PulseAnimation reducedMotion={reducedMotion} />
        <View style={styles.copy}>
          <Text style={styles.headline}>{headline}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.steps}>
        {STEP_KEYS.map((key, index) => {
          const status: LoadingStepStatus =
            index < stepIndex ? 'done' : index === stepIndex ? 'active' : 'pending'
          return (
            <LoadingStepIndicator
              key={key}
              label={t(`loading.steps.${key}`)}
              status={status}
              reducedMotion={reducedMotion}
            />
          )
        })}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  copy: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  headline: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  steps: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
})
