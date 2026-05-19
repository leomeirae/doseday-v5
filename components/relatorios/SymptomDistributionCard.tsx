import { Text, View, StyleSheet } from 'react-native'
import { PieChart } from 'react-native-gifted-charts'
import { colors, elevation, radius, spacing, typography } from '@lib/theme/tokens'
import type { SymptomCount } from '@lib/supabase/queries/reports'
import { QUICK_LOG_LABELS, type QuickLogType } from '@lib/validation/diarioSchemas'
import { ChartEmptyState } from './ChartEmptyState'

type Props = {
  data: SymptomCount[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

const MAX_SEGMENTS = 5

export function SymptomDistributionCard({ data, isLoading, error, onRetry }: Props) {
  const visibleData = data.slice(0, MAX_SEGMENTS)
  const total = visibleData.reduce((sum, symptom) => sum + symptom.count, 0)

  const chartData = visibleData.map((symptom, index) => ({
    value: symptom.count,
    color: withAlpha(colors.semanticInfo, 1 - index * 0.14),
    text: String(symptom.count),
  }))

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`${total} registros de sintomas nos últimos 30 dias`}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Sintomas</Text>
          <Text style={styles.period}>Últimos 30 dias</Text>
        </View>
      </View>

      {isLoading && <View style={styles.skeleton} />}

      {!isLoading && error && (
        <ChartEmptyState
          icon="exclamationmark.triangle"
          title="Não consegui carregar os sintomas"
          description={error}
          actionLabel="Tentar novamente"
          onRetry={onRetry}
        />
      )}

      {!isLoading && !error && total === 0 && (
        <ChartEmptyState
          icon="waveform.path.ecg"
          title="Sintomas ainda não apareceram"
          description="Quando você anotar sintomas no Diário, eles entram nesta distribuição."
        />
      )}

      {!isLoading && !error && total > 0 && (
        <View style={styles.chartRow}>
          <View style={styles.chartWrap}>
            <PieChart
              donut
              data={chartData}
              radius={72}
              innerRadius={48}
              innerCircleColor={colors.bgSurface}
              centerLabelComponent={() => (
                <View style={styles.centerLabel}>
                  <Text style={styles.centerNumber}>{total}</Text>
                  <Text style={styles.centerText}>registros</Text>
                </View>
              )}
              isAnimated
              animationDuration={800}
            />
          </View>
          <View style={styles.legend}>
            {visibleData.map((symptom, index) => (
              <View key={symptom.type} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: withAlpha(colors.semanticInfo, 1 - index * 0.14) }]} />
                <Text style={styles.legendLabel} numberOfLines={1}>
                  {labelForSymptom(symptom.type)}
                </Text>
                <Text style={styles.legendCount}>{symptom.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

function labelForSymptom(type: string): string {
  return QUICK_LOG_LABELS[type as QuickLogType] ?? type
}

function withAlpha(hexColor: string, alpha: number): string {
  const normalized = hexColor.replace('#', '')
  const red = parseInt(normalized.slice(0, 2), 16)
  const green = parseInt(normalized.slice(2, 4), 16)
  const blue = parseInt(normalized.slice(4, 6), 16)
  return `rgba(${red},${green},${blue},${alpha})`
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    marginBottom: spacing.md,
    ...elevation[1],
  },
  headerRow: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  period: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xxs,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  chartWrap: {
    width: 152,
    height: 152,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerNumber: {
    ...typography.numberMedium,
    color: colors.textPrimary,
  },
  centerText: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: -spacing.xxs,
  },
  legend: {
    flex: 1,
    gap: spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 24,
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  legendLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  legendCount: {
    ...typography.label,
    color: colors.textPrimary,
  },
  skeleton: {
    height: 178,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
  },
})
