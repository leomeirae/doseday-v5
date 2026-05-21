import { View, Text, Pressable, StyleSheet } from 'react-native'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

interface Props {
  onPressRegister: () => void
}

export function EmptyDoseStateCard({ onPressRegister }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.headline}>Comece sua jornada</Text>
      <Text style={styles.body}>
        Registre sua primeira dose pra começar a memória do tratamento.
      </Text>
      <Pressable
        onPress={onPressRegister}
        accessibilityRole="button"
        accessibilityLabel="Registrar dose"
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <Text style={styles.ctaLabel}>Registrar dose</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  headline: {
    ...typography.title,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
  cta: {
    backgroundColor: colors.brand,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  ctaPressed: {
    transform: [{ scale: 0.98 }],
  },
  ctaLabel: {
    ...typography.label,
    color: colors.textInverse,
  },
})
