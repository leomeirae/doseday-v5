import { Pressable, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '@lib/theme/tokens'

type Props = {
  label: string
  onPress: () => void
  accessibilityLabel?: string
}

export function AuthLink({ label, onPress, accessibilityLabel }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? label}
      style={styles.container}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
})
