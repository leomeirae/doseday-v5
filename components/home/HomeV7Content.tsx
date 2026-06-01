import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useContext, type ComponentProps } from 'react'
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs'
import { useRouter, type Href } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import Svg, { Circle as SvgCircle, Polyline } from 'react-native-svg'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useConsultationNotes } from '@hooks/useConsultationNotes'
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
import { SOURCE_COLORS, getQuickLogSource, type MemorySource } from '@lib/memory/source'
import { colors, elevation, spacing } from '@lib/theme/tokens'
import { QUICK_LOG_LABELS } from '@lib/validation/diarioSchemas'

const FALLBACK_TAB_BAR_HEIGHT = 96
const TIMELINE_LIMIT = 4
const TIMELINE_SOURCE_LIMIT = 2

// Graphite Panel Strong (DESIGN.md — Graphite Clinical Home Layer). Inline,
// só no card do hero, para o hero dominar por nível de superfície sem editar tokens.
const HERO_GRAPHITE = '#172637'
const HAIRLINE = 'rgba(255,255,255,0.06)'
// Borda mint discreta — só o atalho Peso (Vital Mint Rarity; mint = linha de peso no DESIGN.md).
const MINT_BORDER = 'rgba(0,212,170,0.45)'

type TimelineItem = {
  id: string
  date: Date
  title: string
  source: MemorySource
}

type QuickAction = {
  label: string
  icon: ComponentProps<typeof SymbolView>['name']
  route: string
  accessibilityHint: string
  accent?: boolean
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Sintoma',
    icon: 'cross.case',
    route: '/diario/anotar-sintoma',
    accessibilityHint: 'Abre o registro de um novo sintoma.',
  },
  {
    label: 'Nota',
    icon: 'square.and.pencil',
    route: '/diario/anotar-memoria',
    accessibilityHint: 'Abre o registro de uma nova nota sobre o tratamento.',
  },
  {
    label: 'Peso',
    icon: 'scalemass',
    route: '/peso/registrar',
    accessibilityHint: 'Abre o registro de um novo peso.',
    accent: true,
  },
  {
    label: 'Dose',
    icon: 'syringe',
    route: '/dose/registrar',
    accessibilityHint: 'Abre o registro de uma nova dose.',
  },
]

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
  const contentPaddingBottom = tabBarHeight + spacing.xxxl

  return (
    <SafeAreaView className="flex-1 bg-bg-base" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: 22, paddingBottom: contentPaddingBottom }}
        showsVerticalScrollIndicator={false}
      >
        <HeaderMemory />

        <NextDoseHero
          nextDose={doseSummary?.nextDose ?? null}
          hasDoseHistory={(doseSummary?.history.length ?? 0) > 0}
          isLoading={doseQuery.isLoading}
          error={doseQuery.error ? mapQueryError(doseQuery.error) : null}
          onRetry={() => void doseQuery.refetch()}
          onPressDoses={() => router.push('/(tabs)/doses' as Href)}
          onPressRegister={() => router.push('/dose/registrar' as Href)}
          medicationName={profile?.currentMedication ?? null}
          currentDose={profile?.currentDose ?? null}
        />

        <WeightCard
          currentWeight={currentWeight}
          delta={weightDelta}
          logs={weightLogs}
          updatedAt={latestWeight?.date ?? null}
          isLoading={weightIsLoading}
          error={weightError ? mapQueryError(weightError) : null}
          onRetry={() => {
            void weightQuery.refetch()
            if (needsProfileForWeight) void profileQuery.refetch()
          }}
          onPressBody={() => router.push('/peso/historico' as Href)}
          goalWeight={profile?.goalWeight ?? null}
        />

        <QuickActions />

        <ConsultationCard
          count={consultationNotes.length}
          onPress={() => router.push('/diario/anotar-memoria' as Href)}
        />

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

        <View className="flex-row gap-sm mb-md">
          <SymptomMiniCard
            symptom={symptomQuery.data ?? null}
            isLoading={symptomQuery.isLoading}
            error={symptomQuery.error ? mapQueryError(symptomQuery.error) : null}
          />
          <ExpenseMiniCard
            total={purchaseSummary?.total ?? 0}
            isLoading={purchaseQuery.isLoading}
            error={purchaseQuery.error ? mapQueryError(purchaseQuery.error) : null}
            onRetry={() => void purchaseQuery.refetch()}
            onPress={() => router.push('/diario/custos' as Href)}
          />
        </View>

        <Disclaimer />
      </ScrollView>
    </SafeAreaView>
  )
}

function PanelChevron() {
  return <SymbolView name="chevron.right" size={14} tintColor={colors.textTertiary} />
}

function HeaderMemory() {
  const router = useRouter()
  return (
    <View className="mb-lg">
      <View className="flex-row justify-between items-start gap-md">
        <Text className="flex-1 text-text-primary text-[28px] font-semibold leading-[34px]">
          {/* 📐 text-[28px] leading-[34px] = headline */}
          Hoje no seu tratamento
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
      <Text className="text-text-secondary text-[13px] leading-[18px] mt-xxs">
        {/* 📐 text-[13px] leading-[18px] = caption */}
        {formatCurrentDate()}
      </Text>
    </View>
  )
}

// Eyebrow row used by the full-width section cards.
function SectionHeaderRow({
  label,
  trailing,
}: {
  label: string
  trailing?: React.ReactNode
}) {
  return (
    <View className="flex-row items-center justify-between mb-sm">
      <Text className="text-text-secondary text-[13px] font-bold leading-[18px] uppercase tracking-[1.4px]">
        {/* 📐 text-[13px] leading-[18px] tracking-[1.4px] = caption bold uppercase */}
        {label}
      </Text>
      {trailing && <View className="flex-row items-center gap-sm">{trailing}</View>}
    </View>
  )
}

// HERO — card de maior destaque. Graphite inline + leve elevação (card clínico flutuante).
function NextDoseHero({
  nextDose,
  hasDoseHistory,
  isLoading,
  error,
  onRetry,
  onPressDoses,
  onPressRegister,
  medicationName,
  currentDose,
}: {
  nextDose: NextDoseData | null
  hasDoseHistory: boolean
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPressDoses: () => void
  onPressRegister: () => void
  medicationName?: string | null
  currentDose?: number | null
}) {
  return (
    <View
      className="rounded-[14px] p-lg mb-md"
      style={{ backgroundColor: HERO_GRAPHITE, shadowColor: '#000', ...elevation[1] }}
    >
      {/* style prop: backgroundColor graphite inline (sem token); elevation[1] = card clínico flutuante */}
      <SectionHeaderRow label="Próxima dose" />
      {isLoading || error ? (
        <SectionReadState
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          loadingLabel="Carregando próxima dose."
        />
      ) : nextDose ? (
        <NextDoseBody nextDose={nextDose} onPressDoses={onPressDoses} onPressRegister={onPressRegister} />
      ) : (
        <View>
          <Text className="text-text-secondary text-[16px] leading-[22px] mt-xs mb-md">
            {hasDoseHistory
              ? 'Defina seu intervalo para calcular a próxima dose.'
              : medicationName
                ? currentDose != null
                  ? `Prepare-se para aplicar sua primeira dose de ${medicationName} ${currentDose}mg.`
                  : `Prepare-se para aplicar sua primeira dose de ${medicationName}.`
                : 'Anote sua primeira dose para iniciar a memória do tratamento.'}
          </Text>
          {hasDoseHistory ? (
            <HeroCta label="Ver doses" onPress={onPressDoses} accessibilityLabel="Ver histórico de doses" />
          ) : (
            <HeroCta label="Anotar dose" onPress={onPressRegister} accessibilityLabel="Anotar primeira dose" />
          )}
        </View>
      )}
    </View>
  )
}

// Conteúdo do hero quando há próxima dose. Estado define cor do countdown e o CTA.
// Vital Mint Rarity: no máximo UMA massa mint por estado — ou o countdown ("Hoje") ou o CTA (atrasado), nunca os dois.
function NextDoseBody({
  nextDose,
  onPressDoses,
  onPressRegister,
}: {
  nextDose: NextDoseData
  onPressDoses: () => void
  onPressRegister: () => void
}) {
  const state = nextDose.isOverdue ? 'overdue' : nextDose.daysUntil === 0 ? 'today' : 'future'
  const countdownColor =
    state === 'today'
      ? colors.brand
      : state === 'overdue'
        ? colors.semanticWarning
        : colors.textPrimary
  const cta =
    state === 'overdue'
      ? { label: 'Registrar dose atrasada', onPress: onPressRegister, variant: 'primary' as const }
      : state === 'today'
        ? { label: 'Registrar dose', onPress: onPressRegister, variant: 'outline' as const }
        : { label: 'Ver doses', onPress: onPressDoses, variant: 'outline' as const }

  return (
    <View>
      <Text className="text-text-primary text-[28px] font-bold leading-[34px] mt-xs">
        {/* 📐 text-[28px] leading-[34px] bold = nome do medicamento (hero) */}
        {nextDose.medicationName}
      </Text>
      {nextDose.dose !== null && (
        <Text className="text-[18px] font-bold leading-[24px] mt-xxs" style={{ color: colors.semanticInfo }}>
          {/* style prop: dose em azul clínico (info) */}
          {formatNumber(nextDose.dose)} mg
        </Text>
      )}
      <Text className="text-text-secondary text-[13px] leading-[18px] mt-sm">
        {capitalize(format(nextDose.scheduledDate, "EEEE, d 'de' MMMM", { locale: ptBR }))}
      </Text>
      <Text className="text-[40px] font-bold leading-[44px] mt-xs" style={{ color: countdownColor }}>
        {/* style prop: cor do countdown por estado — futuro=branco, hoje=mint, atrasado=âmbar (nunca mint) */}
        {capitalize(formatNextDoseValue(nextDose))}
      </Text>
      <HeroCta label={cta.label} onPress={cta.onPress} variant={cta.variant} accessibilityLabel={cta.label} />
    </View>
  )
}

// CTA do hero. outline = neutro (sem mint); primary = preenchido mint (usado só quando o countdown NÃO é mint).
function HeroCta({
  label,
  onPress,
  accessibilityLabel,
  variant = 'outline',
}: {
  label: string
  onPress: () => void
  accessibilityLabel: string
  variant?: 'outline' | 'primary'
}) {
  const isPrimary = variant === 'primary'
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Abre a área de doses do tratamento."
      className="items-center justify-center rounded-[14px] mt-md py-[14px] active:opacity-70"
      style={isPrimary ? { backgroundColor: colors.brand } : { borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' }}
    >
      {/* style prop: primary = fundo mint (texto escuro); outline = borda neutra sem token */}
      <Text
        className="text-[16px] font-semibold leading-[20px]"
        style={{ color: isPrimary ? colors.textInverse : colors.textPrimary }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

function WeightCard({
  currentWeight,
  delta,
  logs,
  updatedAt,
  isLoading,
  error,
  onRetry,
  onPressBody,
  goalWeight,
}: {
  currentWeight: number | null
  delta: number | null
  logs: WeightLog[]
  updatedAt: Date | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPressBody: () => void
  goalWeight: number | null
}) {
  return (
    <View className="bg-bg-surface rounded-[14px] p-lg mb-md">
      <SectionHeaderRow label="Peso" />
      {isLoading || error ? (
        <SectionReadState
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          loadingLabel="Carregando peso registrado."
        />
      ) : (
        <Pressable
          onPress={onPressBody}
          accessibilityRole="button"
          accessibilityLabel="Ver histórico de peso"
          accessibilityHint="Abre o histórico completo de peso."
          className="flex-row items-start justify-between gap-md active:opacity-70"
        >
          <View className="flex-1">
            {currentWeight !== null ? (
              <>
                <View className="flex-row items-baseline gap-xs">
                  <Text className="text-text-primary text-[48px] font-light leading-[54px]">
                    {/* 📐 text-[48px] leading-[54px] light = numberPersonal */}
                    {formatNumber(currentWeight)}
                  </Text>
                  <Text className="text-text-secondary text-[18px] font-semibold leading-[24px]">kg</Text>
                </View>
                <Text className="text-text-secondary text-[13px] leading-[18px] mt-xxs">peso atual</Text>
                {goalWeight !== null && (
                  <Text className="text-text-tertiary text-[13px] leading-[18px] mt-xxs">
                    Meta: {formatNumber(goalWeight)} kg
                  </Text>
                )}
                {delta !== null && (
                  <View className="flex-row items-center self-start gap-xs bg-bg-elevated rounded-[10px] px-sm py-xxs mt-sm">
                    <Text
                      className="text-[15px] font-bold leading-[20px]"
                      style={{ color: delta < 0 ? colors.brand : colors.textSecondary }}
                    >
                      {/* style prop: cor por SINAL — perda (−) = mint (progresso); ganho/zero = neutro (sem mint) */}
                      {formatDeltaValue(delta)}
                    </Text>
                    <Text className="text-text-tertiary text-[13px] leading-[18px]">desde o início</Text>
                  </View>
                )}
                <WeightSparkline logs={logs} />
                {updatedAt && (
                  <Text className="text-text-tertiary text-[13px] leading-[18px]">
                    {`atualizado ${formatRelativeDay(updatedAt).toLowerCase()}`}
                  </Text>
                )}
              </>
            ) : (
              <Text className="text-text-secondary text-[16px] leading-[22px]">Nenhum peso registrado ainda.</Text>
            )}
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
    <View className="h-[64px] w-full mb-sm mt-sm">
      {/* 📐 h-[64px]; 🏷️ mb-sm, mt-sm */}
      <Svg width="100%" height="100%" viewBox="0 0 100 48" preserveAspectRatio="none">
        <Polyline
          points={sparkline.points}
          fill="none"
          stroke={colors.semanticInfo}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.4}
          vectorEffect="non-scaling-stroke"
        />
        <SvgCircle cx={sparkline.last.x} cy={sparkline.last.y} r={2.4} fill={colors.mintSoft} />
      </Svg>
    </View>
  )
}

function QuickActions() {
  const router = useRouter()
  return (
    <View className="flex-row gap-sm mb-md">
      {QUICK_ACTIONS.map((action) => (
        <Pressable
          key={action.label}
          onPress={() => router.push(action.route as Href)}
          accessibilityRole="button"
          accessibilityLabel={`Registrar ${action.label.toLowerCase()}`}
          accessibilityHint={action.accessibilityHint}
          className="flex-1 items-center gap-xs rounded-[14px] py-md bg-bg-elevated active:opacity-70"
          style={{ borderWidth: action.accent ? 1 : 0.5, borderColor: action.accent ? MINT_BORDER : HAIRLINE }}
        >
          {/* style prop: borda (sem token). accent = Peso, único atalho com toque mint (ícone/borda), fundo escuro */}
          <SymbolView name={action.icon} size={22} tintColor={action.accent ? colors.brand : colors.textSecondary} />
          <Text className="text-text-primary text-[13px] font-medium leading-[18px]">{action.label}</Text>
        </Pressable>
      ))}
    </View>
  )
}

function ConsultationCard({ count, onPress }: { count: number; onPress: () => void }) {
  return (
    <View className="bg-bg-surface rounded-[14px] p-lg mb-md">
      <SectionHeaderRow label="Próxima consulta" />
      <Text className="text-text-primary text-[18px] font-semibold leading-[24px] mt-xs">
        {/* 📐 text-[18px] leading-[24px] = subtitle */}
        {count === 0
          ? 'Nenhuma dúvida anotada ainda.'
          : `${count} ${count === 1 ? 'dúvida' : 'dúvidas'} para levar.`}
      </Text>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Anotar dúvida para a consulta"
        accessibilityHint="Abre o registro de uma nota para levar à consulta."
        className="self-start justify-center min-h-[44px] mt-xs active:opacity-70"
      >
        <Text className="text-[15px] font-semibold leading-[20px]" style={{ color: colors.semanticInfo }}>
          {/* style prop: CTA terciária em azul clínico (info) */}
          Anotar dúvida
        </Text>
      </Pressable>
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
    <View className="bg-bg-surface rounded-[14px] p-lg mb-md">
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
          accessibilityLabel="Ver memória completa"
          accessibilityHint="Abre o histórico completo da memória do tratamento."
          className="active:opacity-70"
        >
          {isEmpty ? (
            <Text className="text-text-secondary text-[16px] leading-[22px]">
              Sua memória recente vai aparecer aqui.
            </Text>
          ) : (
            <View className="mt-xs">
              {items.map((item, index) => (
                <View key={item.id} className="flex-row gap-sm min-h-[56px]">
                  <View className="items-center w-[16px]">
                    <View
                      className="rounded-full h-[10px] w-[10px] mt-[4px]"
                      style={{ backgroundColor: SOURCE_COLORS[item.source] }}
                    />
                    {/* style prop: cor por tipo do evento (SOURCE_COLORS); nem toda cor tem token Tailwind */}
                    {index < items.length - 1 && <View className="bg-bg-elevated flex-1 mt-xs w-[2px]" />}
                  </View>
                  <View className="flex-1 pb-md">
                    <Text className="text-text-secondary text-[13px] font-semibold leading-[18px] mb-xxs">
                      {formatRelativeDay(item.date)}
                    </Text>
                    <Text className="text-text-primary text-[15px] leading-[24px]">{item.title}</Text>
                  </View>
                </View>
              ))}
              <View className="flex-row justify-end">
                <PanelChevron />
              </View>
            </View>
          )}
        </Pressable>
      )}
    </View>
  )
}

// Resumo display-only do último sintoma. SEM navegação/chevron: não há tela de sintomas
// e a Memória recente já é a porta para /memoria (evita duas portas para o mesmo destino).
function SymptomMiniCard({
  symptom,
  isLoading,
  error,
}: {
  symptom: RecentSymptom | null
  isLoading: boolean
  error: string | null
}) {
  return (
    <View className="flex-1 bg-bg-surface rounded-[14px] p-md">
      <Text className="text-text-secondary text-[11px] font-bold leading-[14px] uppercase tracking-[1.2px] mb-sm">
        Sintomas
      </Text>
      {isLoading ? (
        <ActivityIndicator color={colors.textSecondary} size="small" />
      ) : error ? (
        <Text className="text-text-secondary text-[13px] leading-[18px]">Não foi possível carregar.</Text>
      ) : symptom ? (
        <>
          <Text className="text-text-primary text-[20px] font-bold leading-[24px]">
            {SYMPTOM_LABELS[symptom.type] ?? formatUnknownSymptomType(symptom.type)}
          </Text>
          <Text className="text-text-tertiary text-[13px] leading-[18px] mt-xxs">
            {formatRelativeDay(symptom.date).toLowerCase()}
          </Text>
        </>
      ) : (
        <Text className="text-text-secondary text-[13px] leading-[18px]">Nenhum sintoma ainda.</Text>
      )}
    </View>
  )
}

function ExpenseMiniCard({
  total,
  isLoading,
  error,
  onRetry,
  onPress,
}: {
  total: number
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPress: () => void
}) {
  return (
    <View className="flex-1 bg-bg-surface rounded-[14px] p-md">
      <Text className="text-text-secondary text-[11px] font-bold leading-[14px] uppercase tracking-[1.2px] mb-sm">
        Custos
      </Text>
      {isLoading ? (
        <ActivityIndicator color={colors.textSecondary} size="small" />
      ) : error ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Tentar novamente"
          accessibilityHint="Recarrega os custos."
          className="min-h-[44px] justify-center active:opacity-70"
        >
          <Text className="text-text-secondary text-[13px] leading-[18px]">
            Não foi possível carregar. Toque para tentar.
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel="Ver custos do tratamento"
          accessibilityHint="Abre a lista completa de custos."
          className="active:opacity-70"
        >
          <Text className="text-text-primary text-[22px] font-bold leading-[28px]">{formatCurrency(total)}</Text>
          <Text className="text-text-tertiary text-[13px] leading-[18px] mt-xxs">
            {total === 0 ? 'nenhum custo ainda' : 'registrados'}
          </Text>
          <View className="flex-row justify-end mt-sm">
            <PanelChevron />
          </View>
        </Pressable>
      )}
    </View>
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

function Disclaimer() {
  return (
    <Text className="text-text-tertiary text-[13px] leading-[20px] px-md text-center">
      Este conteúdo organiza seus registros e não substitui uma conversa com um profissional de
      saúde.
    </Text>
  )
}

function buildTimeline(
  doses: DoseRecord[],
  weightLogs: WeightLog[],
  quickLogs: QuickLogRecord[]
): TimelineItem[] {
  const doseItems = doses.slice(0, TIMELINE_SOURCE_LIMIT).map((dose): TimelineItem => ({
    id: `dose-${dose.id}`,
    date: dose.applicationDate,
    title: `Dose de ${formatNumber(dose.dose)}mg administrada.`,
    source: 'dose',
  }))
  const weightItems = weightLogs.slice(0, TIMELINE_SOURCE_LIMIT).map((weight): TimelineItem => ({
    id: `weight-${weight.id}`,
    date: weight.date,
    title: `Peso registrado (${formatNumber(weight.weight)} kg).`,
    source: 'peso',
  }))
  const quickLogItems = quickLogs.slice(0, TIMELINE_SOURCE_LIMIT).map((log): TimelineItem => ({
    id: `quick-${log.id}`,
    date: log.loggedAt,
    title: formatQuickLogTitle(log),
    source: getQuickLogSource(log.logType),
  }))

  return [...doseItems, ...weightItems, ...quickLogItems]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, TIMELINE_LIMIT)
}

function formatQuickLogTitle(log: QuickLogRecord): string {
  if (log.logType === 'other') return log.notes?.trim() || 'Nota adicionada.'
  return `Registro: ${QUICK_LOG_LABELS[log.logType]}.`
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

function formatDeltaValue(delta: number): string {
  return `${delta > 0 ? '+' : ''}${formatNumber(delta)} kg`
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
