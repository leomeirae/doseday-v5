import { StyleSheet, Text, type TextProps } from 'react-native'
import { colors, spacing, typography } from '@lib/theme/tokens'

type SettingsSectionHeaderProps = TextProps & {
  title: string
}

export function SettingsSectionHeader({ title, style, ...rest }: SettingsSectionHeaderProps) {
  return (
    <Text style={[styles.header, style]} accessibilityRole="header" {...rest}>
      {title.toUpperCase()}
    </Text>
  )
}

const styles = StyleSheet.create({
  header: {
    ...typography.caption,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
})
