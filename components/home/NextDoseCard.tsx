import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'
import { formatMedicationName } from '@lib/utils/formatMedicationName'
import type { NextDoseData } from '@lib/supabase/queries/doses'

interface Props {
  nextDose: NextDoseData | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

function formatScheduledDate(date: Date): string {
  const raw = format(date, "EEEE, d 'de' MMMM", { locale: ptBR })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

function getDaysLabel(daysUntil: number): string {
  if (daysUntil === 0) return 'Sua dose é hoje!'
  if (daysUntil === 1) return 'dia até sua próxima dose'
  return 'dias até sua próxima dose'
}

export function NextDoseCard({ nextDose, isLoading, error, onRetry }: Props) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Próxima dose</Text>
      <View style={styles.card}>
        {isLoading && (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="small" color={colors.brand} />
          </View>
        )}

        {!isLoading && error && (
          <View style={styles.stateContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={onRetry} style={styles.retryButton} accessibilityRole="button">
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !error && !nextDose && (
          <View style={styles.stateContainer}>
            <Text style={styles.emptyTitle}>Nenhuma dose registrada</Text>
            <Text style={styles.emptySubtitle}>
              Sua próxima dose vai aparecer aqui depois do primeiro registro
            </Text>
          </View>
        )}

        {!isLoading && !error && nextDose && (
          <>
            {(nextDose.isOverdue || nextDose.daysUntil > 0) && (
              <Text
                style={[
                  styles.daysNumber,
                  nextDose.isOverdue ? styles.daysNumberOverdue : styles.daysNumberNormal,
                ]}
              >
                {nextDose.isOverdue ? nextDose.overdueBy : nextDose.daysUntil}
              </Text>
            )}
            <Text style={[styles.daysLabel, nextDose.daysUntil === 0 && !nextDose.isOverdue && styles.daysLabelToday]}>
              {nextDose.isOverdue
                ? nextDose.overdueBy === 1 ? 'dia de atraso' : 'dias de atraso'
                : getDaysLabel(nextDose.daysUntil)}
            </Text>
            <View style={styles.separator} />
            <View style={styles.detailsRow}>
              <Text style={styles.medicationLabel} numberOfLines={1}>
                {formatMedicationName(nextDose.medicationName)}{nextDose.dose != null ? ` · ${nextDose.dose}mg` : ''}
              </Text>
              <Text style={styles.scheduledDate}>
                {formatScheduledDate(nextDose.scheduledDate)}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  stateContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  daysNumber: {
    ...typography.numberLarge,
  },
  daysNumberNormal: {
    color: colors.brand,
  },
  daysNumberOverdue: {
    color: colors.semanticWarning,
  },
  daysLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  separator: {
    height: 1,
    backgroundColor: colors.bgSurface,
    marginVertical: spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  medicationLabel: {
    ...typography.label,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  scheduledDate: {
    ...typography.caption,
    color: colors.textTertiary,
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
  daysLabelToday: {
    ...typography.subtitle,
    color: colors.brand,
    marginTop: 0,
  },
  retryText: {
    ...typography.label,
    color: colors.brand,
  },
  emptyTitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
})
