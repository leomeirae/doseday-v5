import { Text, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '@lib/theme/tokens'

interface Props {
  title: string
}

export function SectionHeader({ title }: Props) {
  return (
    <Text style={styles.title}>{title}</Text>
  )
}

const styles = StyleSheet.create({
  title: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
})
