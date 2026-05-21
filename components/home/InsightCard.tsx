import { View, Text, StyleSheet } from 'react-native'
import { InsightDisclaimer } from '@components/ui/InsightDisclaimer'
import { useDailyInsight } from '@hooks/useDailyInsight'
import { useOnboardingInsightFromDB } from '@hooks/useOnboardingInsightFromDB'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

const STATIC_FALLBACK = 'Vamos acompanhar seu tratamento dia a dia.'

interface Props {
  source: 'onboarding' | 'daily'
}

export function InsightCard({ source }: Props) {
  const onboarding = useOnboardingInsightFromDB()
  const daily = useDailyInsight({ enabled: source === 'daily' })

  const isLoading = source === 'onboarding' ? onboarding.isLoading : daily.isLoading

  function renderContent() {
    if (isLoading) {
      return (
        <>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
        </>
      )
    }

    if (source === 'onboarding') {
      const contract = onboarding.data
      if (!contract) {
        return <Text style={styles.insightText}>{STATIC_FALLBACK}</Text>
      }
      return (
        <>
          <InsightDisclaimer text={contract.disclaimer} />
          <Text style={styles.insightText}>{contract.shortInsight}</Text>
          <Text style={styles.nextStep}>{contract.nextStep}</Text>
        </>
      )
    }

    const data = daily.data
    if (data && (data.kind === 'premium' || data.kind === 'fallback') && data.insightText) {
      return (
        <>
          <InsightDisclaimer />
          <Text style={styles.insightText}>{data.insightText}</Text>
        </>
      )
    }

    return <Text style={styles.insightText}>{STATIC_FALLBACK}</Text>
  }

  return (
    <View accessible accessibilityLabel={buildA11yLabel(source, isLoading, onboarding.data, daily.data)}>
      <Text style={styles.sectionTitle}>Insight do dia</Text>
      <View style={styles.card}>
        <View style={styles.cardContent}>{renderContent()}</View>
      </View>
    </View>
  )
}

function buildA11yLabel(
  source: Props['source'],
  isLoading: boolean,
  onboarding: ReturnType<typeof useOnboardingInsightFromDB>['data'],
  daily: ReturnType<typeof useDailyInsight>['data']
): string {
  if (isLoading) return 'Insight do dia carregando'
  if (source === 'onboarding') {
    return onboarding ? `${onboarding.shortInsight} ${onboarding.nextStep}` : STATIC_FALLBACK
  }
  if (daily && (daily.kind === 'premium' || daily.kind === 'fallback') && daily.insightText) {
    return daily.insightText
  }
  return STATIC_FALLBACK
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    borderWidth: 0.5,
    padding: spacing.lg,
  },
  cardContent: {
    gap: spacing.sm,
  },
  insightText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  nextStep: {
    ...typography.label,
    color: colors.textPrimary,
  },
  skeletonLine: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xs,
    height: 14,
  },
  skeletonLineShort: {
    width: '65%',
  },
})
