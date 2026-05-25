import { Pressable, StyleSheet, Text, View } from 'react-native'
import Constants from 'expo-constants'
import { openBrowserAsync } from 'expo-web-browser'
import { colors, spacing, typography } from '@lib/theme/tokens'

// TODO ADR 0007: URLs placeholder ate Leo confirmar canonical em PR futuro
const TERMS_URL = 'https://dose-day.com/termos'
const PRIVACY_URL = 'https://dose-day.com/privacidade'

export function SettingsFooter() {
  const version = Constants.expoConfig?.version ?? '?.?.?'
  const build = Constants.expoConfig?.ios?.buildNumber ?? '?'

  return (
    <View style={styles.footer}>
      <Pressable
        onPress={() => openBrowserAsync(TERMS_URL)}
        accessibilityRole="button"
        accessibilityLabel="Termos de Uso"
        hitSlop={8}
      >
        <Text style={styles.link}>Termos de Uso</Text>
      </Pressable>
      <Text style={styles.separator}> · </Text>
      <Text style={styles.version}>{`Versão ${version} (build ${build})`}</Text>
      <Text style={styles.separator}> · </Text>
      <Pressable
        onPress={() => openBrowserAsync(PRIVACY_URL)}
        accessibilityRole="button"
        accessibilityLabel="Política de Privacidade"
        hitSlop={8}
      >
        <Text style={styles.link}>Política de Privacidade</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  link: {
    ...typography.caption,
    color: colors.semanticMuted,
  },
  version: {
    ...typography.caption,
    color: colors.semanticMuted,
  },
  separator: {
    ...typography.caption,
    color: colors.textTertiary,
  },
})
