import { ScrollView, Text, View, ActivityIndicator, TouchableOpacity, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams, type Href } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { colors, typography, spacing } from '@lib/theme/tokens'
import { DoseCard } from '@components/doses/DoseCard'
import { SectionHeader } from '@components/ui/SectionHeader'
import { useDoseSummary } from '@hooks/useDoseSummary'
import { useNotifications } from '@hooks/useNotifications'
import { mapQueryError } from '@lib/supabase/queries/errors'
import { formatMedicationName } from '@lib/utils/formatMedicationName'
import { PermissionDeniedBanner } from '@components/notifications/PermissionDeniedBanner'
import type { Dose, DoseRecord } from '@lib/supabase/queries/doses'

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
  const router = useRouter()
  const { highlight } = useLocalSearchParams<{ highlight?: string }>()
  const { data: dose, isLoading, error, refetch } = useDoseSummary()
  const { permissionStatus } = useNotifications()

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headlineRow}>
            <Pressable
              onPress={() => {
                if (router.canGoBack()) {
                  router.back()
                } else {
                  router.replace('/(tabs)/index' as Href)
                }
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
            >
              <SymbolView name="chevron.left" size={22} tintColor={colors.textPrimary} />
            </Pressable>
            <Text style={styles.headline}>Doses</Text>
            <Pressable
              onPress={() => router.push('/dose/registrar')}
              hitSlop={8}
              accessibilityLabel="Registrar nova dose"
              accessibilityRole="button"
            >
              <SymbolView name="plus" size={22} tintColor={colors.brand} />
            </Pressable>
          </View>
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
      <PermissionDeniedBanner visible={permissionStatus === 'denied'} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headlineRow}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back()
              } else {
                router.replace('/(tabs)/index' as Href)
              }
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <SymbolView name="chevron.left" size={22} tintColor={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headline}>Doses</Text>
          <Pressable
            onPress={() => router.push('/dose/registrar')}
            hitSlop={8}
            accessibilityLabel="Registrar nova dose"
            accessibilityRole="button"
          >
            <SymbolView name="plus" size={22} tintColor={colors.brand} />
          </Pressable>
        </View>

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
          historyCards.map((d) => (
            <DoseCard key={d.id} dose={d} highlighted={highlight === d.id} />
          ))
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
  headlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  headline: {
    ...typography.headline,
    color: colors.textPrimary,
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
