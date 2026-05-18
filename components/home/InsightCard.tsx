import { View, Text, StyleSheet } from 'react-native'
import { InsightDisclaimer } from '@components/ui/InsightDisclaimer'
import { useDailyInsight } from '@hooks/useDailyInsight'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

const FREE_PLACEHOLDER = 'Insight do dia disponível no Premium. Toque pra saber mais.'
const ERROR_FALLBACK = 'Acompanhamento do tratamento'

export function InsightCard() {
  const { data, isLoading, isError } = useDailyInsight()

  function renderContent() {
    if (isLoading) {
      return (
        <>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
        </>
      )
    }

    if (isError || !data) {
      return <Text style={styles.insightText}>{ERROR_FALLBACK}</Text>
    }

    if (data.kind === 'premium') {
      return (
        <>
          <InsightDisclaimer />
          <Text style={styles.insightText}>{data.insightText}</Text>
        </>
      )
    }

    if (data.kind === 'free_placeholder') {
      return (
        <>
          <InsightDisclaimer />
          <Text style={styles.insightText}>{FREE_PLACEHOLDER}</Text>
        </>
      )
    }

    // fallback
    return <Text style={styles.insightText}>{data.insightText}</Text>
  }

  return (
    <View
      accessible
      accessibilityLabel={
        isLoading
          ? 'Insight do dia carregando'
          : isError || !data
          ? ERROR_FALLBACK
          : data.kind === 'free_placeholder'
          ? FREE_PLACEHOLDER
          : 'insightText' in data
          ? data.insightText
          : ERROR_FALLBACK
      }
    >
      <Text style={styles.sectionTitle}>Insight do dia</Text>
      <View style={styles.card}>
        <View style={styles.cardContent}>{renderContent()}</View>
      </View>
    </View>
  )
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
  skeletonLine: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xs,
    height: 14,
  },
  skeletonLineShort: {
    width: '65%',
  },
})
