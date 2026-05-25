import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { ExpandableContextSection } from '@components/onboarding/ExpandableContextSection'
import { InsightCard } from '@components/onboarding/InsightCard'
import { InsightGoalCard } from '@components/onboarding/InsightGoalCard'
import { InsightStageCard } from '@components/onboarding/InsightStageCard'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { InsightDisclaimer } from '@components/ui/InsightDisclaimer'
import { useOnboarding } from '@contexts/OnboardingContext'
import {
  buildOnboardingInsightInput,
  shouldRequestInsight,
  useOnboardingInsight,
} from '@hooks/useOnboardingInsight'
import { spacing, typography, colors } from '@lib/theme/tokens'

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
      stepNumber={15}
      totalSteps={15}
      headline={t('result.headline', { name: firstName })}
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
            <InsightStageCard
              stageLabel={insight.data.stageLabel}
              medicationLabel={insight.data.medicationLabel}
            />
            <InsightGoalCard
              cardLabel={t('result.goalCardLabel')}
              goalWeight={state.data.goal_weight}
              goalLabel={insight.data.goalLabel}
              deltaLabel={insight.data.deltaLabel}
            />
            <View style={styles.narrative}>
              <Text style={styles.shortInsight}>{insight.data.shortInsight}</Text>
              <Text style={styles.nextStep}>{insight.data.nextStep}</Text>
            </View>
            <ExpandableContextSection
              label={t('result.contextSectionLabel')}
              bullets={insight.data.contextBullets}
            />
            <InsightDisclaimer
              text={insight.data.disclaimer}
              style={styles.disclaimerFull}
            />
          </>
        ) : (
          <>
            {facts.map((fact, index) => (
              <InsightCard key={index} body={fact} testID={`result-fact-${index}`} />
            ))}
            <InsightDisclaimer
              text={t('result.disclaimer')}
              style={styles.disclaimerFull}
            />
          </>
        )}
      </View>
    </OnboardingShell>
  )
}

const styles = StyleSheet.create({
  disclaimerFull: {
    alignSelf: 'stretch',
  },
  narrative: {
    gap: spacing.sm,
  },
  nextStep: {
    ...typography.bodyClinical,
    color: colors.textSecondary,
  },
  shortInsight: {
    ...typography.body,
    color: colors.textPrimary,
  },
  stack: {
    gap: spacing.sm,
  },
})
