import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { ExpandableContextSection } from '@components/onboarding/ExpandableContextSection'
import { InsightCard } from '@components/onboarding/InsightCard'
import { InsightGoalCard } from '@components/onboarding/InsightGoalCard'
import { InsightStageCard } from '@components/onboarding/InsightStageCard'
import { OnboardingShell } from '@components/onboarding/OnboardingShell'
import { PremiumTeaserCard } from '@components/onboarding/PremiumTeaserCard'
import { InsightDisclaimer } from '@components/ui/InsightDisclaimer'
import { useOnboarding } from '@contexts/OnboardingContext'
import {
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

  const status = state.data.treatment_status ?? 'ongoing'
  const requestInsight = shouldRequestInsight(state.data)
  const insight = useOnboardingInsight(state.data, requestInsight)

  // Recap "memória pronta" — só dados já coletados, sem payload novo.
  const summaryRows: { label: string; value: string }[] = []
  if (state.data.current_medication) {
    const medName = state.data.current_medication
    const medDose = state.data.current_dose != null ? ` · ${state.data.current_dose}mg` : ''
    summaryRows.push({
      label: 'Medicamento',
      value: `${medName}${medDose}`,
    })
  }
  if (state.data.dose_frequency_days != null) {
    summaryRows.push({
      label: t('result.summary.reminderLabel'),
      value: state.data.dose_frequency_days === 1
        ? 'A cada 1 dia'
        : `A cada ${state.data.dose_frequency_days} dias`,
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
  const med = state.data.current_medication
  const dose = state.data.current_dose
  const currentWeight = state.data.current_weight
  const goalWeight = state.data.goal_weight

  // Fact 1: Contexto de tratamento específico do branch
  if (status === 'planning') {
    facts.push(
      `Seu tratamento com ${med} está configurado para começar. Vamos te ajudar a registrar a primeira aplicação e lembrar o dia correto.`
    )
  } else if (status === 'starting' && med && dose) {
    facts.push(
      `Você está iniciando o ${med} ${dose}mg esta semana. Fique atento aos efeitos comuns dos primeiros dias.`
    )
  } else if (status === 'ongoing' && med && dose) {
    facts.push(
      `Sua rotina do ${med} ${dose}mg está organizada. Registre suas doses para manter o histórico exato.`
    )
  } else if (status === 'restart' && med && dose) {
    facts.push(
      `Sua retomada do ${med} ${dose}mg está configurada. Vamos reorganizar seu histórico a partir desta fase.`
    )
  }

  // Fact 2: Meta de peso (com delta em relação ao peso atual)
  if (currentWeight != null && goalWeight != null && currentWeight > goalWeight) {
    const delta = currentWeight - goalWeight
    const deltaStr = Number.isInteger(delta) ? String(delta) : delta.toFixed(1)
    facts.push(
      `Faltam ${deltaStr}kg para sua meta de peso (${goalWeight}kg). Acompanharemos cada conquista com você.`
    )
  }

  // Fact 3: Foco/Preocupações (se houver)
  if (state.data.main_concerns && state.data.main_concerns.length > 0) {
    const concernsStr = state.data.main_concerns.map((c) => t(`concerns.options.${c}`).toLowerCase()).join(', ')
    facts.push(
      `Priorizaremos dicas e monitoramento personalizado para: ${concernsStr}.`
    )
  } else {
    facts.push(t('result.insightFallback.support'))
  }

  async function handleComplete() {
    try {
      await complete()
    } catch {
      // complete() já exibe toast de erro; permanece na tela para nova tentativa.
    }
  }

  const headline = t(`result.headline_${status}`, { defaultValue: t('result.headline') })
  const subtitle = t(`result.subtitle_${status}`, { defaultValue: t('result.subtitle') })

  return (
    <OnboardingShell
      step="result"
      stepNumber={getCountedStepNumber('result')}
      totalSteps={COUNTED_STEPS_TOTAL}
      headline={headline}
      subtitle={subtitle}
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
            <PremiumTeaserCard testID="result-premium-teaser" />
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
            <PremiumTeaserCard testID="result-premium-teaser" />
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
