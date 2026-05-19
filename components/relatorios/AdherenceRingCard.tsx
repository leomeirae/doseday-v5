import { Text, View, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { colors, elevation, radius, spacing, typography } from '@lib/theme/tokens'
import type { AdherenceStats } from '@lib/supabase/queries/reports'
import { ChartEmptyState } from './ChartEmptyState'

type Props = {
  stats: AdherenceStats | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

const RING_SIZE = 136
const STROKE_WIDTH = 10
const RING_RADIUS = (RING_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export function AdherenceRingCard({ stats, isLoading, error, onRetry }: Props) {
  const percentage = stats?.percentage ?? 0
  const progressColor = percentage >= 80 ? colors.brand : percentage >= 50 ? colors.semanticInfo : colors.semanticWarning
  const dashOffset = CIRCUMFERENCE * (1 - percentage / 100)

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={stats ? `Aderência de ${percentage} por cento` : 'Aderência ao tratamento'}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Aderencia</Text>
          <Text style={styles.period}>Desde o início</Text>
        </View>
      </View>

      {isLoading && <View style={styles.skeleton} />}

      {!isLoading && error && (
        <ChartEmptyState
          icon="exclamationmark.triangle"
          title="Não consegui calcular a aderência"
          description={error}
          actionLabel="Tentar novamente"
          onRetry={onRetry}
        />
      )}

      {!isLoading && !error && (!stats || !stats.startDate) && (
        <ChartEmptyState
          icon="calendar.badge.exclamationmark"
          title="Defina o início do tratamento"
          description="A aderência usa a data de início do tratamento no perfil."
        />
      )}

      {!isLoading && !error && stats?.startDate && (
        <View style={styles.contentRow}>
          <View style={styles.ringWrap}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={colors.bgElevated}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={progressColor}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                strokeDashoffset={dashOffset}
                rotation="-90"
                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              />
            </Svg>
            <View style={styles.ringLabel}>
              <Text style={styles.percentage}>{percentage}%</Text>
              <Text style={styles.ringText}>aderência</Text>
            </View>
          </View>
          <View style={styles.summary}>
            <Text style={styles.summaryNumber}>
              {stats.totalApplied}
            </Text>
            <Text style={styles.summaryLabel}>
              doses registradas
            </Text>
            <Text style={styles.expectedLabel}>
              {stats.totalExpected} esperadas no período
            </Text>
            <Text style={styles.summaryNote}>{statusCopy(percentage)}</Text>
          </View>
        </View>
      )}
    </View>
  )
}

function statusCopy(percentage: number): string {
  if (percentage >= 80) return 'Ritmo consistente para levar à consulta.'
  if (percentage >= 50) return 'Há registros suficientes para acompanhar o período.'
  return 'Ainda há pouco histórico registrado neste tratamento.'
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
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabel: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentage: {
    ...typography.numberMedium,
    color: colors.textPrimary,
  },
  ringText: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: -spacing.xxs,
  },
  summary: {
    flex: 1,
  },
  summaryNumber: {
    ...typography.numberMedium,
    color: colors.textPrimary,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  expectedLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xxs,
  },
  summaryNote: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  skeleton: {
    height: 168,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
  },
})
