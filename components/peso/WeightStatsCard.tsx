import { Text, View, StyleSheet } from 'react-native'
import { SymbolView } from 'expo-symbols'
import { useTranslation } from 'react-i18next'
import { colors, elevation, radius, spacing, typography } from '@lib/theme/tokens'
import type { Profile } from '@lib/supabase/queries/profile'
import type { WeightLog } from '@lib/supabase/queries/weight'

type Props = {
  weightLogs: WeightLog[]
  userProfile: Profile | null | undefined
}

export function WeightStatsCard({ weightLogs, userProfile }: Props) {
  const { t } = useTranslation('weight')
  const currentWeight = weightLogs[0]?.weight ?? userProfile?.initialWeight ?? null
  const initialWeight = userProfile?.initialWeight ?? weightLogs[weightLogs.length - 1]?.weight ?? null
  const goalWeight = userProfile?.goalWeight ?? null
  const lostWeight =
    currentWeight !== null && initialWeight !== null ? initialWeight - currentWeight : null
  const hasExpectedLoss = lostWeight !== null && lostWeight > 0

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={currentWeight !== null ? `${currentWeight.toFixed(1)} kg` : t('card.hintAdd')}
    >
      <Text style={styles.title}>{t('card.title')}</Text>

      {currentWeight === null ? (
        <View style={styles.empty}>
          <SymbolView name="scalemass" size={24} tintColor={colors.semanticInfo} />
          <Text style={styles.emptyText}>{t('card.hintAdd')}</Text>
        </View>
      ) : (
        <>
          <View style={styles.currentBlock}>
            <Text style={styles.currentNumber}>{currentWeight.toFixed(1)} kg</Text>
            <Text style={styles.currentLabel}>{t('card.labelCurrent')}</Text>
          </View>

          <View style={styles.metaRow}>
            <Metric label={t('card.labelInitial')} value={formatWeight(initialWeight)} />
            <Metric label={t('card.labelGoal')} value={formatWeight(goalWeight)} />
            <Metric
              label={t('card.lost')}
              value={lostWeight !== null ? `${lostWeight.toFixed(1)} kg` : '--'}
              positive={hasExpectedLoss}
            />
          </View>
        </>
      )}
    </View>
  )
}

function Metric({
  label,
  value,
  positive = false,
}: {
  label: string
  value: string
  positive?: boolean
}) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, positive && styles.metricValuePositive]}>
        {value}
      </Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  )
}

function formatWeight(value: number | null): string {
  return value !== null ? `${value.toFixed(1)} kg` : '--'
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    marginBottom: spacing.lg,
    ...elevation[1],
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  currentBlock: {
    marginBottom: spacing.lg,
  },
  currentNumber: {
    ...typography.numberLarge,
    color: colors.textPrimary,
  },
  currentLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xxs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metric: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  metricValue: {
    ...typography.label,
    color: colors.textPrimary,
  },
  metricValuePositive: {
    color: colors.semanticPositive,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xxs,
  },
  empty: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
