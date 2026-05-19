import { Text, View, StyleSheet, useWindowDimensions } from 'react-native'
import { BarChart } from 'react-native-gifted-charts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { colors, elevation, radius, spacing, typography } from '@lib/theme/tokens'
import type { DoseWeek } from '@lib/supabase/queries/reports'
import { ChartEmptyState } from './ChartEmptyState'

type Props = {
  data: DoseWeek[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

export function DoseAdherenceCard({ data, isLoading, error, onRetry }: Props) {
  const { width } = useWindowDimensions()
  const chartWidth = Math.min(width - spacing.lg * 4, 328)
  const total = data.reduce((sum, week) => sum + week.applied, 0)
  const maxValue = Math.max(3, ...data.map((week) => week.applied))

  const chartData = data.map((week, index) => ({
    value: week.applied,
    label: index % 2 === 0
      ? format(week.weekStart, 'dd/MM', { locale: ptBR })
      : '',
    frontColor: colors.semanticInfo,
  }))

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`${total} doses aplicadas nas últimas 8 semanas`}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Doses aplicadas</Text>
          <Text style={styles.period}>Últimas 8 semanas</Text>
        </View>
        <View style={styles.metricPill}>
          <Text style={styles.metricNumber}>{total}</Text>
          <Text style={styles.metricLabel}>doses</Text>
        </View>
      </View>

      {isLoading && <View style={styles.skeleton} />}

      {!isLoading && error && (
        <ChartEmptyState
          icon="exclamationmark.triangle"
          title="Não consegui carregar as doses"
          description={error}
          actionLabel="Tentar novamente"
          onRetry={onRetry}
        />
      )}

      {!isLoading && !error && total === 0 && (
        <ChartEmptyState
          icon="cross.case"
          title="Suas doses vão aparecer aqui"
          description="Depois do primeiro registro, o histórico semanal fica visível."
        />
      )}

      {!isLoading && !error && total > 0 && (
        <BarChart
          data={chartData}
          width={chartWidth}
          height={176}
          barWidth={22}
          spacing={16}
          roundedTop
          roundedBottom
          hideRules
          yAxisColor={colors.textTertiary}
          xAxisColor={colors.textTertiary}
          yAxisTextStyle={styles.axisText}
          xAxisLabelTextStyle={styles.axisText}
          noOfSections={3}
          maxValue={maxValue}
          showValuesAsTopLabel
          intactTopLabel
          topLabelContainerStyle={styles.barTopLabelContainer}
          topLabelTextStyle={styles.barTopLabel}
          isAnimated
          animationDuration={800}
        />
      )}
    </View>
  )
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
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
  metricPill: {
    alignItems: 'flex-end',
  },
  metricNumber: {
    ...typography.numberMedium,
    color: colors.textPrimary,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  axisText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  barTopLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  barTopLabelContainer: {
    minHeight: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeleton: {
    height: 214,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
  },
})
