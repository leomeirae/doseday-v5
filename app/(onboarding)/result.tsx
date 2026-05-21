import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { InsightCard } from '@components/onboarding/InsightCard'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { useOnboarding } from '@contexts/OnboardingContext'
import {
  buildOnboardingInsightInput,
  shouldRequestInsight,
  useOnboardingInsight,
} from '@hooks/useOnboardingInsight'
import { colors, spacing, typography } from '@lib/theme/tokens'

export default function ResultScreen() {
  const { t } = useTranslation('onboarding')
  const { state, complete } = useOnboarding()

  const requestInsight = shouldRequestInsight(state.data)
  const insight = useOnboardingInsight(state.data, requestInsight)

  const firstName = state.data.full_name?.trim().split(' ')[0] ?? ''
  const input = buildOnboardingInsightInput(state.data)

  const facts: string[] = []
  if (
    requestInsight &&
    input.treatment_week &&
    state.data.current_medication &&
    state.data.current_dose
  ) {
    facts.push(
      t('result.insightFallback.treatmentStage', {
        week: input.treatment_week,
        medication: state.data.current_medication,
        dose: state.data.current_dose,
      })
    )
  }
  if (
    state.data.current_weight != null &&
    state.data.goal_weight != null &&
    state.data.current_weight > state.data.goal_weight
  ) {
    facts.push(
      t('result.insightFallback.weightGoal', {
        goal: state.data.goal_weight,
        delta: (state.data.current_weight - state.data.goal_weight).toFixed(1),
      })
    )
  }
  facts.push(t('result.insightFallback.support'))

  async function handleComplete() {
    try {
      await complete()
    } catch {
      // complete() já exibe toast de erro; permanece na tela para nova tentativa.
    }
  }

  return (
    <OnboardingShell
      step="result"
      stepNumber={14}
      totalSteps={14}
      headline={t('result.headline', { name: firstName })}
      subtitle={t('result.subtitle')}
      showBack={false}
      primaryCTA={{
        label: t('result.cta'),
        onPress: handleComplete,
        disabled: !state.isHydrated,
        loading: state.isSubmitting,
      }}
    >
      <View style={styles.stack}>
        {insight.data ? (
          <>
            <InsightCard
              headline={insight.data.stageLabel}
              body={insight.data.shortInsight}
              disclaimer={insight.data.disclaimer}
              testID="result-ai-insight"
            />
            <InsightCard
              headline={insight.data.medicationLabel}
              body={`${insight.data.goalLabel}\n${insight.data.deltaLabel}`}
              testID="result-ai-labels"
            />
            <InsightCard
              headline={t('result.nextStepTitle')}
              body={insight.data.nextStep}
              testID="result-ai-next-step"
            />
            {insight.data.contextBullets.map((bullet, index) => (
              <InsightCard
                key={index}
                body={bullet}
                testID={`result-ai-context-${index}`}
              />
            ))}
          </>
        ) : null}

        {insight.data
          ? null
          : facts.map((fact, index) => (
              <InsightCard key={index} body={fact} testID={`result-fact-${index}`} />
            ))}

        <Text style={styles.disclaimer}>{t('result.disclaimer')}</Text>
      </View>
    </OnboardingShell>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.sm,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
})
