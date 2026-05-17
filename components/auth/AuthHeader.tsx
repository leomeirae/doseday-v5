import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

type Props = {
  tagline?: string
}

export function AuthHeader({ tagline = 'Memória inteligente do seu tratamento' }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoLetter}>D</Text>
      </View>
      <Text style={styles.appName}>DoseDay</Text>
      <Text style={styles.tagline}>{tagline}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  logoLetter: {
    ...typography.display,
    color: colors.brand,
    lineHeight: undefined,
  },
  appName: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
