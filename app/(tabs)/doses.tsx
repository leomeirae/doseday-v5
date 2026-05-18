import { ScrollView, Text, View, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, typography, spacing } from '@lib/theme/tokens'
import { DoseCard } from '@components/doses/DoseCard'
import { SectionHeader } from '@components/doses/SectionHeader'
import { useDoseSummary } from '@hooks/useDoseSummary'
import { mapQueryError } from '@lib/supabase/queries/errors'
import { formatMedicationName } from '@lib/utils/formatMedicationName'
import type { DoseRecord } from '@lib/supabase/queries/doses'
import type { Dose } from '@lib/mocks/doses'

function toDoseCard(record: DoseRecord): Dose {
  return {
    id: record.id,
    date: record.applicationDate,
    medication: formatMedicationName(record.medicationName),
    dosage: record.dose != null ? `${record.dose}mg` : '--',
    time: '--',
    status: record.status,
  }
}

export default function DosesScreen() {
  const { data: dose, isLoading, error, refetch } = useDoseSummary()

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.headline}>Doses</Text>
          <SectionHeader title="Próximas" />
          <View style={styles.inlineLoader}><ActivityIndicator size="small" color={colors.brand} /></View>
          <SectionHeader title="Histórico" />
          <View style={styles.inlineLoader}><ActivityIndicator size="small" color={colors.brand} /></View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{mapQueryError(error)}</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton} accessibilityRole="button">
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const nextDoseCard: Dose | null = dose?.nextDose
    ? {
        id: 'next-calculated',
        date: dose.nextDose.scheduledDate,
        medication: formatMedicationName(dose.nextDose.medicationName),
        dosage: dose.nextDose.dose != null ? `${dose.nextDose.dose}mg` : '--',
        time: '--',
        status: 'scheduled',
      }
    : null

  const historyCards = dose?.history.map(toDoseCard) ?? []

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>Doses</Text>

        <SectionHeader title="Próximas" />
        {nextDoseCard ? (
          <DoseCard dose={nextDoseCard} isNext />
        ) : (
          <Text style={styles.emptyText}>
            Sua próxima dose vai aparecer aqui depois do primeiro registro
          </Text>
        )}

        <SectionHeader title="Histórico" />
        {historyCards.length > 0 ? (
          historyCards.map((d) => <DoseCard key={d.id} dose={d} />)
        ) : (
          <Text style={styles.emptyText}>Sem doses registradas ainda</Text>
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  headline: {
    ...typography.headline,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  retryButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  inlineLoader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  retryText: {
    ...typography.label,
    color: colors.brand,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
})
