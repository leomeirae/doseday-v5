import { Pressable, Text, View, StyleSheet, useWindowDimensions } from 'react-native'
import { LineChart } from 'react-native-gifted-charts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter, type Href } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { colors, elevation, radius, spacing, typography } from '@lib/theme/tokens'
import type { WeightPoint } from '@lib/supabase/queries/reports'
import { ChartEmptyState } from './ChartEmptyState'

type Props = {
  data: WeightPoint[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

// gifted-charts y-axis label column width (35) + axis thickness (1).
const Y_AXIS_RESERVE = 36

export function WeightChartCard({ data, isLoading, error, onRetry }: Props) {
  const router = useRouter()
  const { width } = useWindowDimensions()
  // gifted-charts draws the y-axis labels (~36px) and endSpacing OUTSIDE the `width`
  // prop, so the rendered chart is wider than chartWidth. Reserve that here so the
  // chart stays inside the card content box (width - spacing.lg * 4).
  const chartWidth = Math.min(
    width - spacing.lg * 4 - Y_AXIS_RESERVE - spacing.lg - spacing.xs,
    280
  )

  const first = data[0]
  const latest = data[data.length - 1]
  const delta = first && latest ? latest.weight - first.weight : 0
  const hasExpectedLoss = data.length > 1 && delta < 0

  const chartData = data.map((point, index) => ({
    value: point.weight,
    label: shouldShowWeightLabel(index, data.length)
      ? format(point.date, 'd/MM', { locale: ptBR })
      : '',
  }))

  const dataMin = data.length > 1 ? Math.min(...data.map((p) => p.weight)) : 0
  const yMin = data.length > 1 ? Math.max(0, Math.floor(dataMin / 5) * 5 - 10) : 0

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && !error && styles.cardPressed]}
      onPress={() => router.push('/peso/historico' as Href)}
      disabled={!!error}
      accessible
      accessibilityRole="button"
      accessibilityLabel={latest ? `Peso atual ${latest.weight.toFixed(1)} quilos` : 'Peso ao longo do tempo'}
      accessibilityHint="Toque para ver histórico completo"
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Peso</Text>
          <Text style={styles.period}>Últimos 90 dias</Text>
        </View>
        <SymbolView name="chevron.right" size={16} tintColor={colors.textTertiary} />
      </View>

      {isLoading && <View style={styles.skeleton} />}

      {!isLoading && error && (
        <ChartEmptyState
          icon="exclamationmark.triangle"
          title="Não consegui carregar o peso"
          description={error}
          actionLabel="Tentar novamente"
          onRetry={onRetry}
        />
      )}

      {!isLoading && !error && data.length === 0 && (
        <ChartEmptyState
          icon="scalemass"
          title="Registre seu peso"
          description="A evolução aparece aqui assim que houver um registro."
        />
      )}

      {!isLoading && !error && latest && (
        <>
          <View style={styles.metricBlock}>
            <Text style={styles.number}>{latest.weight.toFixed(1)} kg</Text>
            <Text style={[styles.delta, hasExpectedLoss && styles.deltaPositive]}>
              {formatDelta(delta, data.length)}
            </Text>
          </View>

          {data.length === 1 ? (
            <View style={styles.singlePoint}>
              <View style={styles.singlePointDot} />
              <Text style={styles.singlePointText}>
                Primeiro registro em {format(latest.date, "d 'de' MMM", { locale: ptBR })}
              </Text>
            </View>
          ) : (
            <LineChart
              data={chartData}
              width={chartWidth}
              height={172}
              color={colors.semanticInfo}
              areaChart
              curved
              thickness={2}
              startFillColor={colors.semanticInfo}
              endFillColor={colors.bgSurface}
              startOpacity={0.28}
              endOpacity={0.04}
              hideRules
              hideDataPoints
              yAxisColor={colors.textTertiary}
              xAxisColor={colors.textTertiary}
              yAxisTextStyle={styles.axisText}
              xAxisLabelTextStyle={styles.axisText}
              noOfSections={4}
              spacing={Math.max(26, (chartWidth - spacing.lg * 2) / Math.max(chartData.length - 1, 1))}
              yAxisOffset={yMin}
              initialSpacing={spacing.lg}
              endSpacing={spacing.lg}
              isAnimated
              animationDuration={800}
            />
          )}
        </>
      )}
    </Pressable>
  )
}

function formatDelta(delta: number, count: number): string {
  if (count <= 1) return 'primeiro ponto da série'
  if (delta === 0) return 'estável desde o primeiro registro'
  const prefix = delta > 0 ? '+' : ''
  return `${prefix}${delta.toFixed(1)} kg desde o primeiro registro`
}

function shouldShowWeightLabel(index: number, total: number): boolean {
  return index === 0 || index === Math.floor(total / 2) || index === total - 1
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
  cardPressed: {
    opacity: 0.86,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  metricBlock: {
    marginBottom: spacing.md,
  },
  number: {
    ...typography.numberLarge,
    color: colors.textPrimary,
  },
  delta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  deltaPositive: {
    color: colors.semanticPositive,
  },
  axisText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  skeleton: {
    height: 230,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
  },
  singlePoint: {
    minHeight: 148,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  singlePointDot: {
    width: 14,
    height: 14,
    borderRadius: radius.full,
    backgroundColor: colors.semanticInfo,
    marginBottom: spacing.sm,
  },
  singlePointText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
