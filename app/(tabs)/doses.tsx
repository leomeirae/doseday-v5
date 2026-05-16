import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '@lib/theme/tokens'

export default function DosesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Doses</Text>
      <Text style={styles.subtitle}>em construção</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgBase,
    padding: spacing.lg,
  },
  title: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
})
