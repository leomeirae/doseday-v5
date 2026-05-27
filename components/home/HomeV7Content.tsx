import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useContext } from 'react'
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs'
import { useRouter, type Href } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle as SvgCircle, Polyline } from 'react-native-svg'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useConsultationNotes, type ConsultationNote } from '@hooks/useConsultationNotes'
import { useDiarioSummary } from '@hooks/useDiarioSummary'
import { useDoseSummary } from '@hooks/useDoseSummary'
import { useProfile } from '@hooks/useProfile'
import { usePurchaseSummary } from '@hooks/usePurchaseSummary'
import { useSymptomMemory } from '@hooks/useSymptomMemory'
import { useWeightLogs } from '@hooks/useWeightLogs'
import type { DoseRecord, NextDoseData } from '@lib/supabase/queries/doses'
import type { QuickLogRecord } from '@lib/supabase/queries/diario'
import { mapQueryError } from '@lib/supabase/queries/errors'
import type { RecentSymptom } from '@lib/supabase/queries/symptoms'
import type { WeightLog } from '@lib/supabase/queries/weight'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'
import { QUICK_LOG_LABELS } from '@lib/validation/diarioSchemas'

const FALLBACK_TAB_BAR_HEIGHT = 96
const TIMELINE_LIMIT = 4
const TIMELINE_SOURCE_LIMIT = 2

type TimelineItem = {
  id: string
  date: Date
  title: string
}

const SYMPTOM_LABELS: Record<string, string> = {
  constipation: 'Constipação',
  diarrhea: 'Diarreia',
  fatigue: 'Cansaço',
  headache: 'Dor de cabeça',
  heartburn: 'Azia',
  injection_pain: 'Dor na injeção',
  nausea: 'Náusea',
  vomiting: 'Vômito',
}

export function HomeV7Content() {
  const router = useRouter()
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? FALLBACK_TAB_BAR_HEIGHT
  const doseQuery = useDoseSummary()
  const diarioQuery = useDiarioSummary()
  const profileQuery = useProfile()
  const purchaseQuery = usePurchaseSummary()
  const purchaseSummary = purchaseQuery.data
  const weightQuery = useWeightLogs()
  const symptomQuery = useSymptomMemory()
  const { data: consultationNotes } = useConsultationNotes()

  const doseSummary = doseQuery.data
  const diarioSummary = diarioQuery.data
  const profile = profileQuery.data
  const weightLogs = weightQuery.data ?? []

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
  const needsProfileForWeight = weightLogs.length === 0
  const weightIsLoading = weightQuery.isLoading || (needsProfileForWeight && profileQuery.isLoading)
  const weightError = weightQuery.error ?? (needsProfileForWeight ? profileQuery.error : null)
  const timelineIsLoading =
    doseQuery.isLoading || diarioQuery.isLoading || weightQuery.isLoading
  const timelineError = doseQuery.error ?? diarioQuery.error ?? weightQuery.error
  const hasConsultationNotes = consultationNotes.length > 0
  const contentPaddingBottom = tabBarHeight + spacing.xxxl
  const consultationSection = <ConsultationMemorySection items={consultationNotes} />
  const recentMemorySection = (
    <RecentMemoryTimeline
      items={timeline}
      isLoading={timelineIsLoading}
      error={timelineError ? mapQueryError(timelineError) : null}
      onRetry={() => {
        void doseQuery.refetch()
        void diarioQuery.refetch()
        void weightQuery.refetch()
      }}
      onPressAdd={() => router.push('/diario/anotar-memoria' as Href)}
      onPressBody={() => router.push('/memoria' as Href)}
    />
  )
  const observationSection = (
    <ObservationMemoryCard
      symptom={symptomQuery.data ?? null}
      isLoading={symptomQuery.isLoading}
      error={symptomQuery.error ? mapQueryError(symptomQuery.error) : null}
      onRetry={() => void symptomQuery.refetch()}
      onPressAdd={() => router.push('/diario/anotar-sintoma' as Href)}
    />
  )

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: contentPaddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        <HeaderMemory />

        <NextDoseSection
          nextDose={doseSummary?.nextDose ?? null}
          hasDoseHistory={(doseSummary?.history.length ?? 0) > 0}
          onPressBody={() => router.push('/perfil/protocolo')}
          onPressAdd={() => router.push('/dose/registrar')}
          isLoading={doseQuery.isLoading}
          error={doseQuery.error ? mapQueryError(doseQuery.error) : null}
          onRetry={() => void doseQuery.refetch()}
        />

        <Divider />

        <WeightSection
          currentWeight={currentWeight}
          delta={weightDelta}
          logs={weightLogs}
          isLoading={weightIsLoading}
          error={weightError ? mapQueryError(weightError) : null}
          onRetry={() => {
            void weightQuery.refetch()
            if (needsProfileForWeight) void profileQuery.refetch()
          }}
          onPressBody={() => router.push('/peso/historico' as Href)}
          onPressAdd={() => router.push('/peso/registrar')}
        />

        {hasConsultationNotes ? (
          <>
            {consultationSection}
            {recentMemorySection}
            {observationSection}
          </>
        ) : (
          <>
            {recentMemorySection}
            {observationSection}
            {consultationSection}
          </>
        )}

        <Divider />
        <ExpensesSection
          total={purchaseSummary?.total ?? 0}
          isLoading={purchaseQuery.isLoading}
          error={purchaseQuery.error ? mapQueryError(purchaseQuery.error) : null}
          onRetry={() => void purchaseQuery.refetch()}
          onPressAdd={() => router.push('/diario/anotar-custo' as Href)}
          onPressBody={() => router.push('/diario/custos' as Href)}
        />

        <Disclaimer />
      </ScrollView>
    </SafeAreaView>
  )
}

function PanelChevron() {
  return (
    <SymbolView
      name="chevron.right"
      size={14}
      tintColor={colors.textTertiary}
    />
  )
}

function HeaderMemory() {
  const router = useRouter()
  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <Text style={styles.title}>Seu tratamento está organizado até aqui.</Text>
        <Pressable
          onPress={() => router.push('/configuracoes')}
          accessibilityRole="button"
          accessibilityLabel="Abrir configurações"
          accessibilityHint="Abre conta, tratamento, lembretes, dados, privacidade e suporte."
          hitSlop={10}
          style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}
        >
          <SymbolView
            name="gearshape"
            size={20}
            tintColor={colors.textSecondary}
          />
        </Pressable>
      </View>
      <Text style={styles.date}>{formatCurrentDate()}</Text>
    </View>
  )
}

// Eyebrow + plus button used by every interactive section. The `+` is its own
// Pressable so the body of the section can have an independent tap handler
// (e.g. navigate to detail) without event-bubbling conflicts.
function SectionHeaderRow({
  label,
  onPressAdd,
  addLabel,
  trailing,
}: {
  label: string
  onPressAdd: () => void
  addLabel: string
  trailing?: React.ReactNode
}) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.eyebrow}>{label}</Text>
      <View style={styles.sectionHeaderTrailing}>
        {trailing}
        <Pressable
          onPress={onPressAdd}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={addLabel}
          accessibilityHint="Abre o registro em um sheet."
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
        >
          <SymbolView name="plus" size={14} tintColor={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  )
}

function NextDoseSection({
  nextDose,
  hasDoseHistory,
  onPressBody,
  onPressAdd,
  isLoading,
  error,
  onRetry,
}: {
  nextDose: NextDoseData | null
  hasDoseHistory: boolean
  onPressBody: () => void
  onPressAdd: () => void
  isLoading: boolean
  error: string | null
  onRetry: () => void
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
    <View style={styles.nextDoseBlock}>
      <SectionHeaderRow
        label="Próxima dose"
        onPressAdd={onPressAdd}
        addLabel="Anotar dose"
      />
      {isLoading || error ? (
        <SectionReadState
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          loadingLabel="Carregando próxima dose."
        />
      ) : (
        <Pressable
          onPress={onPressBody}
          accessibilityRole="button"
          accessibilityLabel="Ver histórico de doses"
          accessibilityHint="Abre o histórico completo de doses."
          style={({ pressed }) => [styles.sectionBodyRow, pressed && styles.sectionBodyPressed]}
        >
          <View style={styles.sectionBodyContent}>
            <Text style={styles.sectionValue}>{capitalize(value)}</Text>
            <Text style={styles.helper}>{capitalize(helper)}</Text>
            {medicationDetail && <Text style={styles.protocolDetail}>{medicationDetail}</Text>}
          </View>
          <PanelChevron />
        </Pressable>
      )}
    </View>
  )
}

function WeightSection({
  currentWeight,
  delta,
  logs,
  isLoading,
  error,
  onRetry,
  onPressBody,
  onPressAdd,
}: {
  currentWeight: number | null
  delta: number | null
  logs: WeightLog[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPressBody: () => void
  onPressAdd: () => void
}) {
  const trailing =
    delta !== null && !isLoading && !error ? (
      <Text style={styles.weightDelta}>{formatDelta(delta)}</Text>
    ) : null

  return (
    <View>
      <SectionHeaderRow
        label="Peso"
        onPressAdd={onPressAdd}
        addLabel="Anotar peso"
        trailing={trailing}
      />
      {isLoading || error ? (
        <SectionReadState
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          loadingLabel="Carregando peso registrado."
        />
      ) : currentWeight !== null ? (
        <Pressable
          onPress={onPressBody}
          accessibilityRole="button"
          accessibilityLabel="Ver histórico de peso"
          accessibilityHint="Abre o histórico completo de peso."
          style={({ pressed }) => [styles.sectionBodyRow, pressed && styles.sectionBodyPressed]}
        >
          <View style={styles.sectionBodyContent}>
            <View style={styles.weightValueRow}>
              <Text style={styles.weightValue}>{formatNumber(currentWeight)}</Text>
              <Text style={styles.weightUnit}>kg</Text>
            </View>
            <WeightSparkline logs={logs} />
          </View>
          <PanelChevron />
        </Pressable>
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
      <Svg width="100%" height="100%" viewBox="0 0 100 48" preserveAspectRatio="none">
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
        <SvgCircle cx={sparkline.last.x} cy={sparkline.last.y} r={2.2} fill={colors.mintSoft} />
      </Svg>
    </View>
  )
}

function RecentMemoryTimeline({
  items,
  isLoading,
  error,
  onRetry,
  onPressAdd,
  onPressBody,
}: {
  items: TimelineItem[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPressAdd: () => void
  onPressBody: () => void
}) {
  const isEmpty = !isLoading && !error && items.length === 0

  return (
    <>
      <Divider />
      <View>
        <SectionHeaderRow
          label="Memória recente"
          onPressAdd={onPressAdd}
          addLabel="Anotar nota"
        />
        {isLoading || error ? (
          <SectionReadState
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            loadingLabel="Carregando memória recente."
          />
        ) : (
          <Pressable
            onPress={onPressBody}
            accessibilityRole="button"
            accessibilityLabel="Ver diário completo"
            accessibilityHint="Abre o histórico completo do diário."
            style={({ pressed }) => [styles.sectionBodyRow, pressed && styles.sectionBodyPressed]}
          >
            <View style={styles.sectionBodyContent}>
              {isEmpty ? (
                <Text style={styles.emptyText}>Sua memória recente vai aparecer aqui.</Text>
              ) : (
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
              )}
            </View>
            <PanelChevron />
          </Pressable>
        )}
      </View>
    </>
  )
}

function ObservationMemoryCard({
  symptom,
  isLoading,
  error,
  onRetry,
  onPressAdd,
}: {
  symptom: RecentSymptom | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPressAdd: () => void
}) {
  return (
    <>
      <Divider />
      <View style={styles.observation}>
        <SectionHeaderRow
          label="Sintomas"
          onPressAdd={onPressAdd}
          addLabel="Anotar sintoma"
        />
        {isLoading || error ? (
          <SectionReadState
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            loadingLabel="Carregando sintomas."
          />
        ) : symptom ? (
          <View style={styles.observationCard}>
            <SymbolView name="circle" size={16} tintColor={colors.semanticMuted} />
            <Text style={styles.observationText}>{formatSymptomMemory(symptom)}</Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>Nenhum sintoma registrado ainda.</Text>
        )}
      </View>
    </>
  )
}

function ConsultationMemorySection({ items }: { items: ConsultationNote[] }) {
  if (items.length === 0) return null

  return (
    <>
      <Divider />
      <View style={styles.consultation}>
        <View style={styles.consultationHeader}>
          <Text style={styles.eyebrow}>Para a consulta</Text>
          <View style={styles.consultationBadge}>
            <Text style={styles.consultationBadgeText}>
              {items.length} {items.length === 1 ? 'item' : 'itens'}
            </Text>
          </View>
        </View>
        <View style={styles.consultationList}>
          {items.map((item) => (
            <View key={item.id} style={styles.consultationItem}>
              <SymbolView
                name={item.completed ? 'checkmark.circle' : 'circle'}
                size={18}
                tintColor={colors.semanticMuted}
              />
              <Text
                style={[
                  styles.consultationText,
                  item.completed && styles.consultationTextCompleted,
                ]}
              >
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </>
  )
}

function SectionReadState({
  isLoading,
  error,
  onRetry,
  loadingLabel,
}: {
  isLoading: boolean
  error: string | null
  onRetry: () => void
  loadingLabel: string
}) {
  if (isLoading) {
    return (
      <View style={styles.readStateLoading}>
        <ActivityIndicator color={colors.textSecondary} size="small" />
        <Text style={styles.readStateText}>{loadingLabel}</Text>
      </View>
    )
  }

  if (!error) return null

  return (
    <View style={styles.readStateError}>
      <Text style={styles.readStateText}>{error}</Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Tentar novamente"
        accessibilityHint="Tenta carregar esta seção novamente."
        style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
      >
        <Text style={styles.retryText}>Tentar novamente</Text>
      </Pressable>
    </View>
  )
}

function Divider() {
  return <View style={styles.divider} />
}

function Disclaimer() {
  return (
    <Text style={styles.disclaimer}>
      Este conteúdo organiza seus registros e não substitui uma conversa com um profissional de
      saúde.
    </Text>
  )
}

function ExpensesSection({
  total,
  isLoading,
  error,
  onRetry,
  onPressAdd,
  onPressBody,
}: {
  total: number
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPressAdd: () => void
  onPressBody: () => void
}) {
  return (
    <View style={styles.expenses}>
      <SectionHeaderRow
        label="Custos registrados"
        onPressAdd={onPressAdd}
        addLabel="Anotar custo"
      />
      {isLoading || error ? (
        <SectionReadState
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          loadingLabel="Carregando custos registrados."
        />
      ) : (
        <Pressable
          onPress={onPressBody}
          accessibilityRole="button"
          accessibilityLabel="Ver custos do tratamento"
          accessibilityHint="Abre a lista completa de custos."
          style={({ pressed }) => [styles.sectionBodyRow, pressed && styles.sectionBodyPressed]}
        >
          <View style={styles.sectionBodyContent}>
            <Text style={styles.expenseText}>
              {total === 0
                ? 'Nenhum custo registrado ainda.'
                : `${formatCurrency(total)} registrados no tratamento.`}
            </Text>
          </View>
          <PanelChevron />
        </Pressable>
      )}
    </View>
  )
}

function buildTimeline(
  doses: DoseRecord[],
  weightLogs: WeightLog[],
  quickLogs: QuickLogRecord[]
): TimelineItem[] {
  const doseItems = doses.slice(0, TIMELINE_SOURCE_LIMIT).map((dose) => ({
    id: `dose-${dose.id}`,
    date: dose.applicationDate,
    title: `Dose de ${formatNumber(dose.dose)}mg administrada.`,
  }))
  const weightItems = weightLogs.slice(0, TIMELINE_SOURCE_LIMIT).map((weight) => ({
    id: `weight-${weight.id}`,
    date: weight.date,
    title: `Peso registrado (${formatNumber(weight.weight)} kg).`,
  }))
  const quickLogItems = quickLogs.slice(0, TIMELINE_SOURCE_LIMIT).map((log) => ({
    id: `quick-${log.id}`,
    date: log.loggedAt,
    title: formatQuickLogTitle(log),
  }))

  return [...doseItems, ...weightItems, ...quickLogItems]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, TIMELINE_LIMIT)
}

function formatQuickLogTitle(log: QuickLogRecord): string {
  if (log.logType === 'other') return log.notes?.trim() || 'Nota adicionada.'
  return `Registro: ${QUICK_LOG_LABELS[log.logType]}.`
}

function formatSymptomMemory(symptom: RecentSymptom): string {
  const recordedAt = format(symptom.date, "d 'de' MMMM", { locale: ptBR })
  const label = SYMPTOM_LABELS[symptom.type]
  return label
    ? `${label} registrada em ${recordedAt}.`
    : `${formatUnknownSymptomType(symptom.type)} registrada em ${recordedAt}.`
}

function formatUnknownSymptomType(type: string): string {
  const normalized = type
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return normalized ? capitalize(normalized) : 'Uma observação'
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
  if (days > 6) return format(date, "d 'de' MMM", { locale: ptBR })
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
      const y = 42 - ((log.weight - min) / range) * 36
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
    backgroundColor: colors.bgBase,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: 22,
  },
  header: {
    marginBottom: 28,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  settingsButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
    marginTop: -4,
  },
  settingsButtonPressed: {
    opacity: 0.7,
  },
  title: {
    ...typography.displayUltralight,
    color: colors.textPrimary,
    flex: 1,
    letterSpacing: 0,
    marginBottom: spacing.sm,
  },
  date: {
    ...typography.bodyClinical,
    color: colors.textSecondary,
  },
  divider: {
    backgroundColor: colors.bgSurface,
    height: StyleSheet.hairlineWidth,
    marginBottom: 28,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionHeaderTrailing: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addButton: {
    alignItems: 'center',
    borderColor: colors.semanticMuted,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  addButtonPressed: {
    backgroundColor: colors.bgSurface,
    transform: [{ scale: 0.96 }],
  },
  sectionBody: {
    paddingBottom: spacing.xs,
  },
  sectionBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  sectionBodyContent: {
    flex: 1,
  },
  sectionBodyPressed: {
    opacity: 0.7,
  },
  nextDoseBlock: {
    marginBottom: 28,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 1.4,
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
    ...typography.numberPersonal,
    color: colors.textPrimary,
    letterSpacing: 0,
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
    height: 64,
    marginBottom: 24,
    marginTop: spacing.xs,
    width: '100%',
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
    backgroundColor: colors.bgSurface,
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
  observation: {
    marginBottom: 28,
  },
  observationCard: {
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  observationText: {
    ...typography.bodyClinical,
    color: colors.textPrimary,
    flex: 1,
  },
  consultation: {
    marginBottom: 28,
  },
  consultationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  consultationBadge: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  consultationBadgeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  consultationList: {
    gap: spacing.sm,
  },
  consultationItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  consultationText: {
    ...typography.bodyClinical,
    color: colors.textPrimary,
    flex: 1,
  },
  consultationTextCompleted: {
    color: colors.textTertiary,
    textDecorationColor: colors.semanticMuted,
    textDecorationLine: 'line-through',
  },
  readStateLoading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  readStateError: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  readStateText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  retryButton: {
    alignItems: 'center',
    borderColor: colors.semanticMuted,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  retryButtonPressed: {
    backgroundColor: colors.bgSurface,
  },
  retryText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
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
