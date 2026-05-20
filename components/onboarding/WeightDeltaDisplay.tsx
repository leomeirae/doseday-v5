import { StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

type Props = {
  currentWeight?: number | undefined
  goalWeight?: number | undefined
}

function toNumber(value?: number): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function WeightDeltaDisplay({ currentWeight, goalWeight }: Props) {
  const { t, i18n } = useTranslation('onboarding')
  const current = toNumber(currentWeight)
  const goal = toNumber(goalWeight)

  if (current === null || goal === null) return null

  const delta = goal - current
  const amount = Math.abs(delta)
  const amountText = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 1,
  }).format(amount)

  const label =
    amount < 0.1
      ? t('goalWeight.delta.maintain')
      : delta < 0
        ? t('goalWeight.delta.loss', { amount: amountText })
        : t('goalWeight.delta.gain', { amount: amountText })

  return (
    <View style={styles.container} accessibilityRole="text">
      <Text style={styles.value}>{label}</Text>
      <Text style={styles.caption}>
        {new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(current)} kg
        {' -> '}
        {new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(goal)} kg
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    backgroundColor: colors.bgSurface,
    padding: spacing.md,
    gap: spacing.xs,
  },
  value: {
    ...typography.numberMedium,
    color: colors.textPrimary,
  },
  caption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
})
