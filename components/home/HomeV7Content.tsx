import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useContext } from 'react'
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs'
import { useRouter, type Href } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
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
import { cn } from '@lib/rnr/utils'
import { colors, spacing } from '@lib/theme/tokens'
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
      onPressBody={() => router.push('/memoria' as Href)}
    />
  )
  const observationSection = (
    <ObservationMemoryCard
      symptom={symptomQuery.data ?? null}
      isLoading={symptomQuery.isLoading}
      error={symptomQuery.error ? mapQueryError(symptomQuery.error) : null}
      onRetry={() => void symptomQuery.refetch()}
      onPressBody={() => router.push('/memoria' as Href)}
    />
  )

  return (
    <SafeAreaView className="flex-1 bg-bg-base" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: 22, paddingBottom: contentPaddingBottom }}
        showsVerticalScrollIndicator={false}
      >
        <HeaderMemory />

        <NextDoseSection
          nextDose={doseSummary?.nextDose ?? null}
          hasDoseHistory={(doseSummary?.history.length ?? 0) > 0}
          onPressBody={() => router.push('/(tabs)/doses' as Href)}
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
    <View className="mb-[28px]">
      {/* 📐 mb-[28px] — valor original literal 28 */}
      <View className="flex-row justify-between items-start gap-md">
        {/* 🏷️ gap-md */}
        <Text className="flex-1 text-text-primary text-[28px] font-light leading-[34px] mb-sm">
          {/* 📐 text-[28px] leading-[34px] = displayUltralight; 🏷️ text-text-primary, mb-sm */}
          Seu tratamento está organizado até aqui.
        </Text>
        <Pressable
          onPress={() => router.push('/configuracoes')}
          accessibilityRole="button"
          accessibilityLabel="Abrir configurações"
          accessibilityHint="Abre conta, tratamento, lembretes, dados, privacidade e suporte."
          hitSlop={10}
          className="w-[44px] h-[44px] items-center justify-center -mt-[4px] active:opacity-70"
        >
          <SymbolView name="gearshape" size={20} tintColor={colors.textSecondary} />
        </Pressable>
      </View>
      <Text className="text-text-secondary text-[15px] leading-[24px]">
        {/* 📐 text-[15px] leading-[24px] = bodyClinical */}
        {formatCurrentDate()}
      </Text>
    </View>
  )
}

// Eyebrow row used by every interactive section.
function SectionHeaderRow({
  label,
  trailing,
}: {
  label: string
  trailing?: React.ReactNode
}) {
  return (
    <View className="flex-row items-center justify-between mb-sm">
      {/* 🏷️ mb-sm */}
      <Text className="text-text-secondary text-[13px] font-bold leading-[18px] uppercase tracking-[1.4px]">
        {/* 📐 text-[13px] leading-[18px] tracking-[1.4px] = caption bold uppercase */}
        {label}
      </Text>
      {trailing && <View className="flex-row items-center gap-sm">{trailing}</View>}
    </View>
  )
}

function NextDoseSection({
  nextDose,
  hasDoseHistory,
  onPressBody,
  isLoading,
  error,
  onRetry,
}: {
  nextDose: NextDoseData | null
  hasDoseHistory: boolean
  onPressBody: () => void
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
    <View className="mb-[28px]">
      <SectionHeaderRow label="Próxima dose" />
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
          className="flex-row items-center justify-between gap-md pb-xs active:opacity-70"
        >
          <View className="flex-1">
            <Text className="text-text-primary text-[18px] font-semibold leading-[24px] mt-xs">
              {/* 📐 text-[18px] leading-[24px] = subtitle; 🏷️ mt-xs */}
              {capitalize(value)}
            </Text>
            <Text className="text-text-secondary text-[13px] leading-[18px] mt-xxs">
              {capitalize(helper)}
            </Text>
            {medicationDetail && (
              <Text className="text-text-tertiary text-[13px] font-semibold leading-[18px] mt-xs">
                {medicationDetail}
              </Text>
            )}
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
}: {
  currentWeight: number | null
  delta: number | null
  logs: WeightLog[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPressBody: () => void
}) {
  const trailing =
    delta !== null && !isLoading && !error ? (
      <Text className="text-text-tertiary text-[13px] font-semibold leading-[18px]">
        {formatDelta(delta)}
      </Text>
    ) : null

  return (
    <View>
      <SectionHeaderRow label="Peso" trailing={trailing} />
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
          className="flex-row items-center justify-between gap-md pb-xs active:opacity-70"
        >
          <View className="flex-1">
            <View className="flex-row items-baseline gap-xs mb-xs">
              <Text className="text-text-primary text-[48px] font-light leading-[54px]">
                {/* 📐 text-[48px] leading-[54px] = numberPersonal */}
                {formatNumber(currentWeight)}
              </Text>
              <Text className="text-text-secondary text-[18px] font-semibold leading-[24px]">
                {/* 📐 text-[18px] leading-[24px] = subtitle */}
                kg
              </Text>
            </View>
            <WeightSparkline logs={logs} />
          </View>
          <PanelChevron />
        </Pressable>
      ) : (
        <Pressable
          onPress={onPressBody}
          accessibilityRole="button"
          accessibilityLabel="Ver histórico de peso"
          accessibilityHint="Abre o histórico completo de peso."
          className="flex-row items-center justify-between gap-md pb-xs active:opacity-70"
        >
          <View className="flex-1">
            <Text className="text-text-secondary text-[16px] leading-[22px] mb-lg">
              Nenhum peso registrado ainda.
            </Text>
          </View>
          <PanelChevron />
        </Pressable>
      )}
    </View>
  )
}

function WeightSparkline({ logs }: { logs: WeightLog[] }) {
  const sparkline = buildSparklinePoints(logs)
  if (!sparkline) return null

  return (
    <View className="h-[64px] w-full mb-lg mt-xs">
      {/* 📐 h-[64px]; 🏷️ mb-lg, mt-xs */}
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
  onPressBody,
}: {
  items: TimelineItem[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPressBody: () => void
}) {
  const isEmpty = !isLoading && !error && items.length === 0

  return (
    <>
      <Divider />
      <View>
        <SectionHeaderRow label="Memória recente" />
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
            className="flex-row items-center justify-between gap-md pb-xs active:opacity-70"
          >
            <View className="flex-1">
              {isEmpty ? (
                <Text className="text-text-secondary text-[16px] leading-[22px] mb-lg">
                  Sua memória recente vai aparecer aqui.
                </Text>
              ) : (
                <View className="mb-[28px]">
                  {items.map((item, index) => (
                    <View key={item.id} className="flex-row gap-sm min-h-[64px]">
                      <View className="items-center w-[16px]">
                        <View
                          className="rounded-full h-[10px] w-[10px] mt-[4px]"
                          style={{ backgroundColor: index > 0 ? colors.semanticMuted : colors.textPrimary }}
                        />
                        {/* style prop: semanticMuted (#5C6878) não tem token Tailwind */}
                        {index < items.length - 1 && (
                          <View className="bg-bg-surface flex-1 mt-xs w-[2px]" />
                        )}
                      </View>
                      <View className="flex-1 pb-lg">
                        <Text className="text-text-secondary text-[13px] font-semibold leading-[18px] mb-xxs">
                          {formatRelativeDay(item.date)}
                        </Text>
                        <Text className="text-text-primary text-[15px] leading-[24px]">
                          {item.title}
                        </Text>
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
  onPressBody,
}: {
  symptom: RecentSymptom | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPressBody: () => void
}) {
  return (
    <>
      <Divider />
      <View className="mb-[28px]">
        <SectionHeaderRow label="Sintomas" />
        {isLoading || error ? (
          <SectionReadState
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            loadingLabel="Carregando sintomas."
          />
        ) : (
          <Pressable
            onPress={onPressBody}
            accessibilityRole="button"
            accessibilityLabel="Ver diário de sintomas"
            accessibilityHint="Abre o diário para ver sintomas."
            className="flex-row items-center justify-between gap-md pb-xs active:opacity-70"
          >
            <View className="flex-1">
              {symptom ? (
                <View
                  className="flex-row items-center bg-bg-elevated rounded-[14px] gap-sm mt-md p-md"
                  style={{ borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.04)' }}
                >
                  {/* 📐 rounded-[14px] = radius.md; style prop: hairline border */}
                  <SymbolView name="circle" size={16} tintColor={colors.semanticMuted} />
                  <Text className="flex-1 text-text-primary text-[15px] leading-[24px]">
                    {formatSymptomMemory(symptom)}
                  </Text>
                </View>
              ) : (
                <Text className="text-text-secondary text-[16px] leading-[22px] mb-lg">
                  Nenhum sintoma registrado ainda.
                </Text>
              )}
            </View>
            <PanelChevron />
          </Pressable>
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
      <View className="mb-[28px]">
        <View className="flex-row items-center justify-between mb-lg">
          <Text className="text-text-secondary text-[13px] font-bold leading-[18px] uppercase tracking-[1.4px]">
            Para a consulta
          </Text>
          <View
            className="bg-bg-elevated rounded-full px-sm py-xxs"
          >
            <Text className="text-text-secondary text-[13px] font-semibold leading-[18px]">
              {items.length} {items.length === 1 ? 'item' : 'itens'}
            </Text>
          </View>
        </View>
        <View className="gap-sm">
          {items.map((item) => (
            <View key={item.id} className="flex-row items-center gap-sm">
              <SymbolView
                name={item.completed ? 'checkmark.circle' : 'circle'}
                size={18}
                tintColor={colors.semanticMuted}
              />
              <Text
                className={cn(
                  'flex-1 text-text-primary text-[15px] leading-[24px]',
                  item.completed && 'text-text-tertiary line-through'
                )}
                style={item.completed ? { textDecorationColor: colors.semanticMuted } : undefined}
              >
                {/* cn() para classe condicional; style prop para textDecorationColor (sem suporte TW) */}
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
      <View className="flex-row items-center gap-sm mt-md">
        <ActivityIndicator color={colors.textSecondary} size="small" />
        <Text className="text-text-secondary text-[13px] leading-[18px]">{loadingLabel}</Text>
      </View>
    )
  }

  if (!error) return null

  return (
    <View className="items-start gap-sm mt-md">
      <Text className="text-text-secondary text-[13px] leading-[18px]">{error}</Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Tentar novamente"
        accessibilityHint="Tenta carregar esta seção novamente."
        className="items-center justify-center rounded-full min-h-[44px] px-md active:bg-bg-surface"
        style={{ borderWidth: 0.5, borderColor: colors.semanticMuted }}
      >
        {/* style prop: borderColor semanticMuted não tem token TW */}
        <Text className="text-text-primary text-[13px] font-semibold leading-[18px]">Tentar novamente</Text>
      </Pressable>
    </View>
  )
}

function Divider() {
  return <View className="h-px bg-bg-surface mb-[28px]" />
  /* 🏷️ bg-bg-surface; 📐 mb-[28px] */
}

function Disclaimer() {
  return (
    <Text className="text-text-tertiary text-[13px] leading-[20px] px-md text-center">
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
  onPressBody,
}: {
  total: number
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPressBody: () => void
}) {
  return (
    <View className="mb-[28px]">
      <SectionHeaderRow label="Custos registrados" />
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
          className="flex-row items-center justify-between gap-md pb-xs active:opacity-70"
        >
          <View className="flex-1">
            <Text className="text-text-secondary text-[15px] leading-[24px] mt-sm">
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
