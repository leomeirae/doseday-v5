import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing } from '@lib/theme/tokens'

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DoseDay</Text>
      <Text style={styles.subtitle}>V5 — Inicializando</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
  },
})
