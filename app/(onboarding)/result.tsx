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
import {
  COUNTED_STEPS_TOTAL,
  getCountedStepNumber,
} from '@lib/validation/onboardingSchemas'
import { radius, spacing, typography, colors } from '@lib/theme/tokens'

export default function ResultScreen() {
  const { t } = useTranslation('onboarding')
  const { state, complete } = useOnboarding()

  const requestInsight = shouldRequestInsight(state.data)
  const insight = useOnboardingInsight(state.data, requestInsight)

  const input = buildOnboardingInsightInput(state.data)

  // Recap "memória pronta" — só dados já coletados, sem payload novo.
  const summaryRows: { label: string; value: string }[] = []
  if (state.data.dose_frequency_days != null) {
    summaryRows.push({
      label: t('result.summary.reminderLabel'),
      value: t('result.summary.reminderValue', { count: state.data.dose_frequency_days }),
    })
  }
  if (state.data.main_concerns && state.data.main_concerns.length > 0) {
    summaryRows.push({
      label: t('result.summary.trackingLabel'),
      value: state.data.main_concerns.map((c) => t(`concerns.options.${c}`)).join(' · '),
    })
  }
  if (state.data.doctor_name) {
    summaryRows.push({
      label: t('result.summary.doctorLabel'),
      value: state.data.doctor_name,
    })
  }

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
    const deltaRaw = state.data.current_weight - state.data.goal_weight
    facts.push(
      t('result.insightFallback.weightGoal', {
        goal: state.data.goal_weight,
        delta: Number.isInteger(deltaRaw) ? String(deltaRaw) : deltaRaw.toFixed(1),
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
      stepNumber={getCountedStepNumber('result')}
      totalSteps={COUNTED_STEPS_TOTAL}
      headline={t('result.headline')}
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
        {summaryRows.length > 0 ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{t('result.summary.title')}</Text>
            {summaryRows.map((row) => (
              <View key={row.label} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{row.label}</Text>
                <Text style={styles.summaryValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        ) : null}
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
  summaryCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: spacing.md,
    gap: spacing.md,
  },
  summaryTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  summaryRow: {
    gap: spacing.xxs,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  summaryValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
})
