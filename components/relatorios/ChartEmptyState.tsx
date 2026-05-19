import { Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import { SymbolView } from 'expo-symbols'
import type { ComponentProps } from 'react'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

type Props = {
  icon: ComponentProps<typeof SymbolView>['name']
  title: string
  description: string
  actionLabel?: string
  onRetry?: () => void
}

export function ChartEmptyState({ icon, title, description, actionLabel, onRetry }: Props) {
  return (
    <View style={styles.container} accessible accessibilityLabel={`${title}. ${description}`}>
      <View style={styles.iconWrap}>
        <SymbolView name={icon} size={22} tintColor={colors.semanticInfo} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 156,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: 'rgba(91,168,217,0.12)',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 240,
  },
  button: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  buttonText: {
    ...typography.label,
    color: colors.semanticInfo,
  },
})
