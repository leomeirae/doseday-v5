import { useState, useRef } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, type Href } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { AuthButton } from '@components/ui/AuthButton'
import { useDiarioSummary } from '@hooks/useDiarioSummary'
import { useDoseSummary } from '@hooks/useDoseSummary'
import { usePurchases } from '@hooks/usePurchases'
import { useSymptoms } from '@hooks/useSymptoms'
import { useWeightLogs } from '@hooks/useWeightLogs'
import { useProfile } from '@hooks/useProfile'
import { useRegisterSymptom } from '@hooks/useRegisterSymptom'
import { useFrequentSymptoms } from '@hooks/useFrequentSymptoms'
import { mapQueryError } from '@lib/supabase/queries/errors'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'
import { QUICK_LOG_LABELS, symptomNoteSchema } from '@lib/validation/diarioSchemas'
import { showErrorToast, showSuccessToast } from '@lib/utils/showToast'

type MemoryEvent = {
  id: string
  date: Date
  title: string
  source: 'dose' | 'peso' | 'nota' | 'sintoma' | 'custo' | 'registro'
}

const SOURCE_COLORS: Record<MemoryEvent['source'], string> = {
  dose: colors.clinicalDose,
  peso: colors.mintSoft,
  nota: '#B8AECF',
  sintoma: colors.semanticWarning,
  custo: '#D7B56D',
  registro: colors.semanticMuted,
}

const SOURCE_LABELS: Record<MemoryEvent['source'], string> = {
  dose: 'Dose',
  peso: 'Peso',
  nota: 'Nota',
  sintoma: 'Sintoma',
  custo: 'Custo',
  registro: 'Registro',
}

const symptomQuickLogTypes = new Set([
  'nausea',
  'headache',
  'fatigue',
  'diarrhea',
  'constipation',
  'heartburn',
  'injection_pain',
])

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

const DEFAULT_SYMPTOMS = ['nausea', 'constipation', 'diarrhea', 'fatigue']

function labelFor(type: string): string {
  return SYMPTOM_LABELS[type] ?? type
}

export default function TreatmentMemoryScreen() {
  const router = useRouter()
  const doseQuery = useDoseSummary()
  const weightQuery = useWeightLogs()
  const diarioQuery = useDiarioSummary()
  const symptomQuery = useSymptoms()
  const purchasesQuery = usePurchases()
  const profileQuery = useProfile()
  const { mutate: registerSymptom, isPending: isRegisteringSymptom } = useRegisterSymptom()
  const frequentSymptoms = useFrequentSymptoms()

  const [symptomText, setSymptomText] = useState('')
  const inputRef = useRef<TextInput | null>(null)

  function goBack() {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/(tabs)' as Href)
    }
  }

  const profile = profileQuery.data
  const hasProtocol =
    profile?.currentMedication != null &&
    profile?.currentDose != null &&
    profile?.doseFrequencyDays != null

  const isLoading =
    doseQuery.isLoading ||
    weightQuery.isLoading ||
    diarioQuery.isLoading ||
    symptomQuery.isLoading ||
    purchasesQuery.isLoading ||
    profileQuery.isLoading
  const error =
    doseQuery.error ||
    weightQuery.error ||
    diarioQuery.error ||
    symptomQuery.error ||
    purchasesQuery.error ||
    profileQuery.error
  const events = buildEvents({
    doseHistory: doseQuery.data?.history ?? [],
    weightLogs: weightQuery.data ?? [],
    quickLogs: diarioQuery.data?.recentQuickLogs ?? [],
    symptoms: symptomQuery.data ?? [],
    purchases: purchasesQuery.data ?? [],
  })

  const trimmedSymptom = symptomText.trim()
  const canSubmitSymptom = trimmedSymptom.length > 0 && !isRegisteringSymptom
  const frequent = frequentSymptoms.data ?? []
  const chipsToRender = frequent.length > 0 ? frequent.map((f) => f.type) : DEFAULT_SYMPTOMS

  function insertChip(type: string) {
    const label = labelFor(type)
    const needsSpace = symptomText.length > 0 && !symptomText.endsWith(' ') && !symptomText.endsWith('\n')
    const next = `${symptomText}${needsSpace ? ' ' : ''}${label.toLowerCase()} `
    setSymptomText(next)
    inputRef.current?.focus()
  }

  function handleSaveSymptom() {
    const parsed = symptomNoteSchema.safeParse({ rawText: trimmedSymptom })
    if (!parsed.success) return

    registerSymptom(parsed.data, {
      onSuccess: () => {
        setSymptomText('')
        inputRef.current?.clear()
        showSuccessToast('Sintoma anotado')
        void symptomQuery.refetch()
        void diarioQuery.refetch()
      },
      onError: (err) => {
        showErrorToast(mapQueryError(err))
      },
    })
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          hitSlop={13}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={styles.backButton}
        >
          <SymbolView name="chevron.left" size={18} tintColor={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Memória do tratamento</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 2. Subtitle */}
        <Text style={styles.subtitle}>
          Registre o que aconteceu hoje e veja seu histórico abaixo.
        </Text>

        {/* 3. Seção Protocolo Atual */}
        <Text style={styles.sectionEyebrow}>Protocolo</Text>
        {profileQuery.isLoading ? (
          <View style={styles.protocolLoading}>
            <ActivityIndicator size="small" color={colors.textSecondary} />
          </View>
        ) : hasProtocol && profile ? (
          <View style={styles.protocolCard}>
            <View style={styles.protocolInfo}>
              <Text style={styles.protocolMedication}>
                {profile.currentMedication} · {formatNumber(profile.currentDose ?? 0)} mg
              </Text>
              <Text style={styles.protocolInterval}>
                A cada {profile.doseFrequencyDays} {profile.doseFrequencyDays === 1 ? 'dia' : 'dias'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/perfil/protocolo' as Href)}
              style={styles.protocolLink}
            >
              <Text style={styles.protocolLinkText}>Editar protocolo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.protocolCard}>
            <Text style={styles.protocolEmptyText}>
              Configure seu protocolo para receber lembretes.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/perfil/protocolo' as Href)}
              style={styles.protocolLink}
            >
              <Text style={styles.protocolLinkText}>Configurar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 4. Seção Registrar Sintoma Inline */}
        <Text style={styles.sectionEyebrow}>Registrar Sintoma</Text>
        <View style={styles.symptomContainer}>
          <TextInput
            ref={inputRef}
            value={symptomText}
            onChangeText={setSymptomText}
            multiline
            numberOfLines={4}
            maxLength={500}
            placeholder="ex: náusea leve depois do almoço · azia ao deitar"
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.brand}
            autoCapitalize="sentences"
            autoCorrect
            textAlignVertical="top"
            accessibilityLabel="Descrição do sintoma"
            style={styles.symptomInput}
          />
          <View style={styles.chipRow}>
            {chipsToRender.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => insertChip(type)}
                style={styles.chip}
              >
                <Text style={styles.chipLabel}>{labelFor(type)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <AuthButton
            label="Salvar sintoma"
            onPress={handleSaveSymptom}
            loading={isRegisteringSymptom}
            disabled={!canSubmitSymptom}
          />
        </View>

        {/* 5. Seção Ações Rápidas */}
        <Text style={styles.sectionEyebrow}>Outros Registros</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            onPress={() => router.push('/diario/anotar-memoria' as Href)}
            style={styles.quickActionBtn}
          >
            <SymbolView name="note.text" size={18} tintColor={colors.brand} style={{ width: 18, height: 18 }} />
            <Text style={styles.quickActionText}>Nota</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/diario/anotar-custo' as Href)}
            style={styles.quickActionBtn}
          >
            <SymbolView name="dollarsign.circle" size={18} tintColor={colors.brand} style={{ width: 18, height: 18 }} />
            <Text style={styles.quickActionText}>Custo</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.quickActionsRow, { marginTop: spacing.md }]}>
          <TouchableOpacity
            onPress={() => router.push('/dose/registrar' as Href)}
            style={styles.quickActionBtn}
          >
            <SymbolView name="cross.case" size={18} tintColor={colors.brand} style={{ width: 18, height: 18 }} />
            <Text style={styles.quickActionText}>Dose</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/peso/registrar' as Href)}
            style={styles.quickActionBtn}
          >
            <SymbolView name="scalemass" size={18} tintColor={colors.brand} style={{ width: 18, height: 18 }} />
            <Text style={styles.quickActionText}>Peso</Text>
          </TouchableOpacity>
        </View>

        {/* 6. Seção Histórico */}
        <Text style={styles.sectionEyebrow}>Histórico</Text>

        {isLoading && (
          <View style={styles.state}>
            <ActivityIndicator size="small" color={colors.textSecondary} />
            <Text style={styles.stateText}>Carregando memória.</Text>
          </View>
        )}

        {error && (
          <Text style={styles.stateText}>{mapQueryError(error)}</Text>
        )}

        {!isLoading && !error && events.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nada registrado ainda.</Text>
            <Text style={styles.emptyText}>
              Sua memória aparece conforme você registra doses, peso, sintomas, notas e custos.
            </Text>
          </View>
        )}

        {!isLoading && !error && events.length > 0 && (
          <View style={styles.timeline}>
            {events.map((event, index) => (
              <View key={event.id} style={styles.timelineItem}>
                <View style={styles.markerColumn}>
                  <View style={[styles.dot, { backgroundColor: SOURCE_COLORS[event.source] }]} />
                  {index < events.length - 1 && <View style={styles.stem} />}
                </View>
                <View style={styles.eventContent}>
                  <View style={styles.eventMetaRow}>
                    <Text
                      style={[
                        styles.eventSource,
                        { color: SOURCE_COLORS[event.source] },
                      ]}
                    >
                      {SOURCE_LABELS[event.source]}
                    </Text>
                    <Text style={styles.eventDate}>· {formatRelativeDay(event.date)}</Text>
                  </View>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function buildEvents({
  doseHistory,
  weightLogs,
  quickLogs,
  symptoms,
  purchases,
}: {
  doseHistory: { id: string; applicationDate: Date; dose: number }[]
  weightLogs: { id: string; date: Date; weight: number }[]
  quickLogs: { id: string; loggedAt: Date; logType: keyof typeof QUICK_LOG_LABELS; notes: string | null }[]
  symptoms: { id: string; type: string; date: Date; notes: string | null }[]
  purchases: { id: string; purchaseDate: Date; price: number }[]
}): MemoryEvent[] {
  const doseItems = doseHistory.map((dose) => ({
    id: `dose-${dose.id}`,
    date: dose.applicationDate,
    source: 'dose' as const,
    title: `Dose de ${formatNumber(dose.dose)}mg administrada.`,
  }))
  const weightItems = weightLogs.map((weight) => ({
    id: `weight-${weight.id}`,
    date: weight.date,
    source: 'peso' as const,
    title: `Peso registrado (${formatNumber(weight.weight)} kg).`,
  }))
  const quickItems = quickLogs.map((log) => ({
    id: `quick-${log.id}`,
    date: log.loggedAt,
    source: getQuickLogSource(log.logType),
    title: log.logType === 'other'
      ? log.notes?.trim() || 'Nota adicionada.'
      : `Registro: ${QUICK_LOG_LABELS[log.logType]}.`,
  }))
  const symptomItems = symptoms.map((symptom) => ({
    id: `symptom-${symptom.id}`,
    date: symptom.date,
    source: 'sintoma' as const,
    title: symptom.notes?.trim() || 'Sintoma registrado.',
  }))
  const purchaseItems = purchases.map((purchase) => ({
    id: `purchase-${purchase.id}`,
    date: purchase.purchaseDate,
    source: 'custo' as const,
    title: `Custo registrado (${formatCurrency(purchase.price)}).`,
  }))

  return [
    ...doseItems,
    ...weightItems,
    ...quickItems,
    ...symptomItems,
    ...purchaseItems,
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 50)
}

function getQuickLogSource(logType: keyof typeof QUICK_LOG_LABELS): MemoryEvent['source'] {
  if (logType === 'other') return 'nota'
  if (symptomQuickLogTypes.has(logType)) return 'sintoma'
  return 'registro'
}

function formatRelativeDay(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const days = Math.max(0, Math.round((today.getTime() - target.getTime()) / 86_400_000))

  if (days === 0) return 'Hoje'
  if (days === 1) return 'Ontem'
  if (days < 7) return `Há ${days} dias`
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(date)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(value)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  subtitle: {
    ...typography.bodyClinical,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sectionEyebrow: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  protocolLoading: {
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  protocolCard: {
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  protocolInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  protocolMedication: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  protocolInterval: {
    ...typography.bodyClinical,
    color: colors.textSecondary,
  },
  protocolEmptyText: {
    ...typography.bodyClinical,
    color: colors.textSecondary,
    flex: 1,
  },
  protocolLink: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.sm,
  },
  protocolLinkText: {
    ...typography.caption,
    color: colors.brand,
    fontWeight: '600',
  },
  symptomContainer: {
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.md,
  },
  symptomInput: {
    ...typography.body,
    backgroundColor: colors.bgSurface,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.textPrimary,
    minHeight: 90,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.full,
    borderWidth: 0.5,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 34,
  },
  chipPressed: {
    transform: [{ scale: 0.96 }],
  },
  chipLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  quickActionText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
  state: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stateText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  emptyTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  emptyText: {
    ...typography.bodyClinical,
    color: colors.textSecondary,
  },
  timeline: {
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 72,
  },
  markerColumn: {
    alignItems: 'center',
    width: 18,
  },
  dot: {
    borderRadius: radius.full,
    height: 10,
    marginTop: 4,
    width: 10,
  },
  stem: {
    backgroundColor: colors.bgSurface,
    flex: 1,
    marginTop: spacing.xs,
    width: 2,
  },
  eventContent: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  eventMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  eventSource: {
    ...typography.caption,
    fontWeight: '700',
  },
  eventDate: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  eventTitle: {
    ...typography.bodyClinical,
    color: colors.textPrimary,
  },
})
