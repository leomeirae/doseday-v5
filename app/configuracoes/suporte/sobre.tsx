import { StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { SettingsFooter } from '@components/settings/SettingsFooter'
import { SettingsGroup } from '@components/settings/SettingsGroup'
import { SettingsHeader } from '@components/settings/SettingsHeader'
import { SettingsSectionHeader } from '@components/settings/SettingsSectionHeader'
import { colors, spacing, typography } from '@lib/theme/tokens'

export default function ConfiguracoesSobreScreen() {
  const router = useRouter()
  const appName = Constants.expoConfig?.name ?? 'DoseDay'
  const version = Constants.expoConfig?.version ?? '5.0.0'
  const buildNumber = Constants.expoConfig?.ios?.buildNumber ?? '1'
  const bundleId = Constants.expoConfig?.ios?.bundleIdentifier ?? 'com.doseday.premium'

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <SettingsHeader
        title="Sobre"
        onBack={() => router.back()}
        backAccessibilityLabel="Voltar para Suporte"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSectionHeader title="App" />
        <SettingsGroup>
          <ReadOnlyRow label="Nome" value={appName} />
          <ReadOnlyRow label="Versão" value={version} divider />
          <ReadOnlyRow label="Build" value={buildNumber} divider />
          <ReadOnlyRow label="Bundle ID" value={bundleId} divider />
        </SettingsGroup>

        <SettingsSectionHeader title="Aviso" />
        <SettingsGroup>
          <View style={styles.noticeRow}>
            <SymbolView name="cross.case" size={20} tintColor={colors.textSecondary} />
            <Text style={styles.noticeText}>
              DoseDay organiza registros pessoais do tratamento e não substitui orientação
              médica.
            </Text>
          </View>
        </SettingsGroup>

        <SettingsFooter />
      </ScrollView>
    </SafeAreaView>
  )
}

function ReadOnlyRow({
  label,
  value,
  divider = false,
}: {
  label: string
  value: string
  divider?: boolean
}) {
  return (
    <View style={[styles.readOnlyRow, divider && styles.divider]}>
      <Text style={styles.readOnlyLabel}>{label}</Text>
      <Text style={styles.readOnlyValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  readOnlyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  divider: {
    borderTopColor: 'rgba(255,255,255,0.06)',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  readOnlyLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  readOnlyValue: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  noticeRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  noticeText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
})
