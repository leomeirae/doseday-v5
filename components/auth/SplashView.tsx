import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'

export function SplashView() {
  return (
    <View style={styles.container}>
      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoLetter}>D</Text>
      </View>
      <ActivityIndicator
        size="small"
        color={colors.textSecondary}
        style={styles.indicator}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgBase,
  },
  logoPlaceholder: {
    width: spacing.xxxl,
    height: spacing.xxxl,
    borderRadius: radius.xl,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    ...typography.display,
    color: colors.brand,
    lineHeight: undefined,
  },
  indicator: {
    marginTop: spacing.xl,
  },
})
