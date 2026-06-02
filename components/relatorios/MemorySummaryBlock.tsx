import { Text, View, StyleSheet } from 'react-native'
import { SymbolView } from 'expo-symbols'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'
import type { MemorySummaryContract } from '../../types/api'

type Props = {
  data: MemorySummaryContract | undefined
  isLoading: boolean
  error: string | null
}

export function MemorySummaryBlock({ data, isLoading, error }: Props) {
  if (isLoading) {
    return (
      <View
        style={styles.container}
        accessible
        accessibilityLabel="Carregando memória do tratamento"
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <SymbolView name="sparkles" size={18} tintColor={colors.brand} />
          </View>
          <Text style={styles.title}>Memória do período</Text>
        </View>
        <View style={styles.skeleton} />
        <View style={[styles.skeleton, styles.skeletonShort]} />
      </View>
    )
  }

  if (error || !data) {
    return null
  }

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel="Resumo da memória do tratamento"
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <SymbolView name="sparkles" size={18} tintColor={colors.brand} />
        </View>
        <Text style={styles.title}>Memória do período</Text>
      </View>

      <Text style={styles.summary}>{data.periodSummary}</Text>

      {data.keyFacts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Principais registros</Text>
          {data.keyFacts.map((fact, i) => (
            <View key={i} style={styles.factRow}>
              <View style={styles.factDot} />
              <Text style={styles.factText}>{fact}</Text>
            </View>
          ))}
        </View>
      )}

      {data.consultPoints.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Para levar na consulta</Text>
          {data.consultPoints.map((point, i) => (
            <View key={i} style={styles.consultRow}>
              <SymbolView name="checkmark.circle" size={14} tintColor={colors.brand} />
              <Text style={styles.consultText}>{point}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.disclaimer}>{data.disclaimer}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 0.5,
    borderColor: 'rgba(0,212,170,0.2)',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,212,170,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  summary: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  factDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand,
    marginTop: 7,
  },
  factText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  consultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  consultText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  skeleton: {
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  skeletonShort: {
    width: '60%',
  },
})
