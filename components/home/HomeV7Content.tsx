import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter, type Href } from 'expo-router'
import { SymbolView, type SFSymbol } from 'expo-symbols'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle as SvgCircle, Polyline } from 'react-native-svg'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDiarioSummary } from '@hooks/useDiarioSummary'
import { useDoseSummary } from '@hooks/useDoseSummary'
import { useProfile } from '@hooks/useProfile'
import { usePurchaseSummary } from '@hooks/usePurchaseSummary'
import { useWeightLogs } from '@hooks/useWeightLogs'
import type { DoseRecord, NextDoseData } from '@lib/supabase/queries/doses'
import type { QuickLogRecord } from '@lib/supabase/queries/diario'
import type { WeightLog } from '@lib/supabase/queries/weight'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'
import { QUICK_LOG_LABELS } from '@lib/validation/diarioSchemas'

const graphite = {
  bg: '#0B1017',
  action: '#121923',
  line: '#1C2330',
  mintSoft: '#A3E6D2',
} as const

type TimelineItem = {
  id: string
  date: Date
  title: string
}

export function HomeV7Content() {
  const router = useRouter()
  const { data: doseSummary } = useDoseSummary()
  const { data: diarioSummary } = useDiarioSummary()
  const { data: profile } = useProfile()
  const { data: purchaseSummary } = usePurchaseSummary()
  const { data: weightLogs = [] } = useWeightLogs()

  const latestWeight = weightLogs[0] ?? null
  const currentWeight = latestWeight?.weight ?? profile?.currentWeight ?? null
  const initialWeight = profile?.initialWeight ?? weightLogs[weightLogs.length - 1]?.weight ?? null
  const weightDelta =
    currentWeight !== null && initialWeight !== null ? currentWeight - initialWeight : null
  const timeline = buildTimeline(
    doseSummary?.history ?? [],
    weightLogs,
    diarioSummary?.recentQuickLogs ?? []
  )

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HeaderMemory />

        <QuickActions
          onPressDose={() => router.push('/dose/registrar')}
          onPressWeight={() => router.push('/peso/registrar')}
          onPressMemory={() => router.push('/diario/anotar-memoria' as Href)}
        />

        <Divider />

        <NextDoseSection
          nextDose={doseSummary?.nextDose ?? null}
          hasDoseHistory={(doseSummary?.history.length ?? 0) > 0}
          onPress={() => router.push('/perfil/protocolo')}
        />

        <Divider />

        <WeightSection currentWeight={currentWeight} delta={weightDelta} logs={weightLogs} />

        {timeline.length > 0 && (
          <>
            <Divider />
            <RecentMemoryTimeline items={timeline} />
          </>
        )}

        {purchaseSummary && purchaseSummary.count > 0 && (
          <>
            <Divider />
            <ExpensesSection total={purchaseSummary.total} />
          </>
        )}

        <Disclaimer />
      </ScrollView>
    </SafeAreaView>
  )
}

function HeaderMemory() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>
        Seu tratamento está{'\n'}organizado até aqui.
      </Text>
      <Text style={styles.date}>{formatCurrentDate()}</Text>
    </View>
  )
}

function QuickActions({
  onPressDose,
  onPressWeight,
  onPressMemory,
}: {
  onPressDose: () => void
  onPressWeight: () => void
  onPressMemory: () => void
}) {
  return (
    <View style={styles.actions}>
      <QuickAction
        label="Anotar dose"
        symbol="plus"
        primary
        onPress={onPressDose}
      />
      <QuickAction
        label="Anotar peso"
        symbol="scalemass"
        onPress={onPressWeight}
      />
      <QuickAction
        label="Adicionar memória"
        symbol="bookmark"
        onPress={onPressMemory}
      />
    </View>
  )
}

function QuickAction({
  label,
  symbol,
  primary = false,
  onPress,
}: {
  label: string
  symbol: SFSymbol
  primary?: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Abre o registro correspondente."
      style={({ pressed }) => [
        styles.actionButton,
        pressed && styles.actionButtonPressed,
      ]}
    >
      {primary && <View style={styles.primaryActionHairline} />}
      <SymbolView
        name={symbol}
        size={18}
        tintColor={primary ? graphite.mintSoft : colors.textSecondary}
      />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  )
}

function NextDoseSection({
  nextDose,
  hasDoseHistory,
  onPress,
}: {
  nextDose: NextDoseData | null
  hasDoseHistory: boolean
  onPress: () => void
}) {
  const value = nextDose ? formatNextDoseValue(nextDose) : 'A definir'
  const helper = nextDose
    ? format(nextDose.scheduledDate, "EEEE, d 'de' MMMM", { locale: ptBR })
    : hasDoseHistory
      ? 'Defina seu intervalo para calcular a próxima dose.'
      : 'Anote sua primeira dose para iniciar a memória do tratamento.'
  const medicationDetail = nextDose
    ? `${nextDose.medicationName}${nextDose.dose !== null ? ` · ${formatNumber(nextDose.dose)}mg` : ''}`
    : null

  return (
    <View style={styles.nextDoseRow}>
      <View style={styles.sectionCopy}>
        <Text style={styles.eyebrow}>Próxima dose</Text>
        <Text style={styles.sectionValue}>{capitalize(value)}</Text>
        <Text style={styles.helper}>{capitalize(helper)}</Text>
        {medicationDetail && <Text style={styles.protocolDetail}>{medicationDetail}</Text>}
      </View>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Definir protocolo"
        accessibilityHint="Abre as configurações do tratamento."
        style={({ pressed }) => [styles.arrowButton, pressed && styles.arrowButtonPressed]}
      >
        <SymbolView name="arrow.right" size={14} tintColor={colors.textSecondary} />
      </Pressable>
    </View>
  )
}

function WeightSection({
  currentWeight,
  delta,
  logs,
}: {
  currentWeight: number | null
  delta: number | null
  logs: WeightLog[]
}) {
  return (
    <View>
      <View style={styles.weightHeader}>
        <Text style={styles.eyebrow}>Peso</Text>
        {delta !== null && <Text style={styles.weightDelta}>{formatDelta(delta)}</Text>}
      </View>
      {currentWeight !== null ? (
        <>
          <View style={styles.weightValueRow}>
            <Text style={styles.weightValue}>{formatNumber(currentWeight)}</Text>
            <Text style={styles.weightUnit}>kg</Text>
          </View>
          <WeightSparkline logs={logs} />
        </>
      ) : (
        <Text style={styles.emptyText}>Nenhum peso registrado ainda.</Text>
      )}
    </View>
  )
}

function WeightSparkline({ logs }: { logs: WeightLog[] }) {
  const sparkline = buildSparklinePoints(logs)
  if (!sparkline) return null

  return (
    <View style={styles.sparkline}>
      <Svg width="100%" height="100%" viewBox="0 0 100 32" preserveAspectRatio="none">
        <Polyline
          points={sparkline.points}
          fill="none"
          stroke={colors.semanticMuted}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
        />
        <SvgCircle cx={sparkline.first.x} cy={sparkline.first.y} r={1.7} fill={colors.semanticMuted} />
        <SvgCircle cx={sparkline.last.x} cy={sparkline.last.y} r={2.2} fill={graphite.mintSoft} />
      </Svg>
    </View>
  )
}

function RecentMemoryTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <View>
      <Text style={[styles.eyebrow, styles.timelineTitle]}>Memória recente</Text>
      <View style={styles.timeline}>
        {items.map((item, index) => (
          <View key={item.id} style={styles.timelineItem}>
            <View style={styles.timelineMarkerColumn}>
              <View style={[styles.timelineDot, index > 0 && styles.timelineDotMuted]} />
              {index < items.length - 1 && <View style={styles.timelineStem} />}
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineDate}>{formatRelativeDay(item.date)}</Text>
              <Text style={styles.timelineText}>{item.title}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

function Divider() {
  return <View style={styles.divider} />
}

function Disclaimer() {
  return (
    <Text style={styles.disclaimer}>
      Nada aqui é orientação médica. É uma memória organizada do seu tratamento.
    </Text>
  )
}

function ExpensesSection({ total }: { total: number }) {
  return (
    <View style={styles.expenses}>
      <Text style={styles.eyebrow}>Custos registrados</Text>
      <Text style={styles.expenseText}>{formatCurrency(total)} registrados no tratamento.</Text>
    </View>
  )
}

function buildTimeline(
  doses: DoseRecord[],
  weightLogs: WeightLog[],
  quickLogs: QuickLogRecord[]
): TimelineItem[] {
  const doseItems = doses.slice(0, 3).map((dose) => ({
    id: `dose-${dose.id}`,
    date: dose.applicationDate,
    title: `Dose de ${formatNumber(dose.dose)}mg administrada.`,
  }))
  const weightItems = weightLogs.slice(0, 3).map((weight) => ({
    id: `weight-${weight.id}`,
    date: weight.date,
    title: `Peso registrado (${formatNumber(weight.weight)} kg).`,
  }))
  const quickLogItems = quickLogs.slice(0, 3).map((log) => ({
    id: `quick-${log.id}`,
    date: log.loggedAt,
    title: formatQuickLogTitle(log),
  }))

  return [...doseItems, ...weightItems, ...quickLogItems]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 4)
}

function formatQuickLogTitle(log: QuickLogRecord): string {
  if (log.logType === 'other') return 'Memória adicionada.'
  return `Registro: ${QUICK_LOG_LABELS[log.logType]}.`
}

function formatCurrentDate(): string {
  return capitalize(format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR }))
}

function formatNextDoseValue(nextDose: NextDoseData): string {
  if (nextDose.isOverdue) {
    return nextDose.overdueBy === 1 ? '1 dia de atraso' : `${nextDose.overdueBy} dias de atraso`
  }
  if (nextDose.daysUntil === 0) return 'Hoje'
  if (nextDose.daysUntil === 1) return 'Amanhã'
  return `Em ${nextDose.daysUntil} dias`
}

function formatRelativeDay(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const days = Math.max(0, Math.round((today.getTime() - target.getTime()) / 86_400_000))

  if (days === 0) return 'Hoje'
  if (days === 1) return 'Ontem'
  return `Há ${days} dias`
}

function formatDelta(delta: number): string {
  const value = formatNumber(delta)
  return `${delta > 0 ? '+' : ''}${value} kg desde o início`
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

type SparklinePoint = {
  x: number
  y: number
}

function buildSparklinePoints(
  logs: WeightLog[]
): { points: string; first: SparklinePoint; last: SparklinePoint } | null {
  const ordered = [...logs]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-8)

  if (ordered.length < 2) return null

  const weights = ordered.map((log) => log.weight)
  const min = Math.min(...weights)
  const max = Math.max(...weights)
  const range = max - min || 1
  const lastIndex = ordered.length - 1

  const points = ordered
    .map((log, index) => {
      const x = lastIndex === 0 ? 4 : 4 + (index / lastIndex) * 92
      const y = 28 - ((log.weight - min) / range) * 24
      return { x, y }
    })

  return {
    points: points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' '),
    first: points[0],
    last: points[points.length - 1],
  }
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(value)
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: graphite.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 240,
    paddingHorizontal: spacing.lg,
    paddingTop: 22,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 0,
    lineHeight: 34,
    marginBottom: spacing.sm,
  },
  date: {
    ...typography.bodyClinical,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: graphite.action,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 88,
    overflow: 'hidden',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  actionButtonPressed: {
    backgroundColor: colors.bgSurface,
    transform: [{ scale: 0.98 }],
  },
  primaryActionHairline: {
    backgroundColor: 'rgba(163,230,210,0.22)',
    height: StyleSheet.hairlineWidth,
    left: spacing.lg,
    position: 'absolute',
    right: spacing.lg,
    top: 0,
  },
  actionLabel: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
    lineHeight: 13,
    textAlign: 'center',
  },
  divider: {
    backgroundColor: graphite.line,
    height: StyleSheet.hairlineWidth,
    marginBottom: 28,
  },
  nextDoseRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  sectionCopy: {
    flex: 1,
    paddingRight: spacing.md,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sectionValue: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  helper: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  protocolDetail: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  arrowButton: {
    alignItems: 'center',
    borderColor: colors.semanticMuted,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  arrowButtonPressed: {
    backgroundColor: colors.bgSurface,
  },
  weightHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  weightDelta: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  weightValueRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  weightValue: {
    color: colors.textPrimary,
    fontSize: 48,
    fontWeight: '300',
    letterSpacing: 0,
    lineHeight: 54,
  },
  weightUnit: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  sparkline: {
    height: 32,
    marginBottom: 24,
    marginTop: spacing.xs,
    width: '60%',
  },
  timelineTitle: {
    marginBottom: spacing.lg,
  },
  timeline: {
    marginBottom: 28,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 64,
  },
  timelineMarkerColumn: {
    alignItems: 'center',
    width: 16,
  },
  timelineDot: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
    height: 10,
    marginTop: 4,
    width: 10,
  },
  timelineDotMuted: {
    backgroundColor: colors.semanticMuted,
  },
  timelineStem: {
    backgroundColor: graphite.line,
    flex: 1,
    marginTop: spacing.xs,
    width: 2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  timelineDate: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  timelineText: {
    ...typography.bodyClinical,
    color: colors.textPrimary,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textTertiary,
    lineHeight: 20,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
  },
  expenses: {
    marginBottom: 28,
  },
  expenseText: {
    ...typography.bodyClinical,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
})
