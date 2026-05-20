import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'

type Props = {
  headline?: string | undefined
  body: string
  disclaimer?: string | undefined
  testID?: string | undefined
}

export function InsightCard({ headline, body, disclaimer, testID }: Props) {
  return (
    <View style={styles.card} testID={testID}>
      {headline ? <Text style={styles.headline}>{headline}</Text> : null}
      <Text style={styles.body}>{body}</Text>
      {disclaimer ? <Text style={styles.disclaimer}>{disclaimer}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: spacing.md,
    gap: spacing.xs,
  },
  headline: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  body: {
    ...typography.bodyClinical,
    color: colors.textSecondary,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
})
