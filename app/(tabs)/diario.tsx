import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { CheckinCard } from '@components/diario/CheckinCard'
import { DiarioTimelineItem } from '@components/diario/DiarioTimelineItem'
import { QuickLogChips } from '@components/diario/QuickLogChips'
import { SectionHeader } from '@components/ui/SectionHeader'
import { useDiarioSummary } from '@hooks/useDiarioSummary'
import { useDoseSummary } from '@hooks/useDoseSummary'
import { useProfile } from '@hooks/useProfile'
import { useRegisterQuickLog } from '@hooks/useRegisterQuickLog'
import { buildTreatmentContext } from '@lib/supabase/queries/diario'
import { mapQueryError } from '@lib/supabase/queries/errors'
import { colors, typography, spacing } from '@lib/theme/tokens'
import { showErrorToast, showSuccessToast } from '@lib/utils/showToast'
import type {
  CheckinRecord,
  QuickLogRecord,
} from '@lib/supabase/queries/diario'
import type { QuickLogType } from '@lib/validation/diarioSchemas'

type TimelineEntry =
  | { kind: 'quick_log'; item: QuickLogRecord; sortKey: number }
  | { kind: 'checkin'; item: CheckinRecord; sortKey: number }

export default function DiarioScreen() {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useDiarioSummary()
  const { data: profile } = useProfile()
  const { data: doseSummary } = useDoseSummary()
  const { mutate: mutateQuickLog, isPending: isQuickLogPending } =
    useRegisterQuickLog()

  const lastDoseDate = doseSummary?.history[0]?.applicationDate ?? null
  const ctx = buildTreatmentContext(profile ?? null, lastDoseDate)

  function handleQuickLog(logType: QuickLogType) {
    mutateQuickLog(
      { logType, intensity: 2, loggedAt: new Date() },
      {
        onSuccess: () => showSuccessToast('Registrado'),
        onError: (err) => showErrorToast(mapQueryError(err)),
      }
    )
  }

  const timeline: TimelineEntry[] = [
    ...(data?.recentQuickLogs ?? []).map((item) => ({
      kind: 'quick_log' as const,
      item,
      sortKey: item.loggedAt.getTime(),
    })),
    ...(data?.recentCheckins ?? []).map((item) => ({
      kind: 'checkin' as const,
      item,
      sortKey: new Date(`${item.date}T00:00:00`).getTime(),
    })),
  ].sort((a, b) => b.sortKey - a.sortKey)

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Diário</Text>

        <SectionHeader title="Registro rápido" />
        <QuickLogChips onQuickLog={handleQuickLog} disabled={isQuickLogPending} />

        <SectionHeader title="Check-in do dia" />
        <CheckinCard
          todayCheckin={data?.todayCheckin ?? null}
          treatmentWeek={ctx.treatmentWeek}
          onPressCTA={() => router.push('/diario/checkin')}
        />

        <SectionHeader title="Histórico" />

        {isLoading && (
          <ActivityIndicator
            size="small"
            color={colors.textTertiary}
            style={styles.loader}
            accessibilityLabel="Carregando histórico"
          />
        )}

        {isError && !isLoading && (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>Não consegui carregar o histórico.</Text>
            <Pressable
              onPress={() => refetch()}
              accessibilityRole="button"
              accessibilityLabel="Tentar novamente"
            >
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        )}

        {!isLoading && !isError && timeline.length === 0 && (
          <Text style={styles.emptyText}>
            Seu diário vai aparecer aqui. Comece registrando como você está hoje.
          </Text>
        )}

        {!isLoading &&
          !isError &&
          timeline.map((entry) =>
            entry.kind === 'quick_log' ? (
              <DiarioTimelineItem
                key={entry.item.id}
                kind="quick_log"
                item={entry.item}
              />
            ) : (
              <DiarioTimelineItem
                key={entry.item.id}
                kind="checkin"
                item={entry.item}
              />
            )
          )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  flex: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
    paddingTop: spacing.md,
  },
  loader: {
    marginVertical: spacing.md,
  },
  errorState: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  retryText: {
    ...typography.label,
    color: colors.textPrimary,
    textDecorationLine: 'underline',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
})
