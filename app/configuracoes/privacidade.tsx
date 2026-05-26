import { StyleSheet } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { openBrowserAsync } from 'expo-web-browser'
import { SettingsGroup } from '@components/settings/SettingsGroup'
import { SettingsHeader } from '@components/settings/SettingsHeader'
import { SettingsRow } from '@components/settings/SettingsRow'
import { SettingsSectionHeader } from '@components/settings/SettingsSectionHeader'
import { colors, spacing } from '@lib/theme/tokens'
import { showErrorToast } from '@lib/utils/showToast'

const TERMS_URL = 'https://dose-day.com/termos'
const PRIVACY_URL = 'https://dose-day.com/privacidade'

export default function ConfiguracoesPrivacidadeScreen() {
  const router = useRouter()

  async function openUrl(url: string) {
    try {
      await openBrowserAsync(url)
    } catch {
      showErrorToast('Não consegui abrir o link.')
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <SettingsHeader
        title="Privacidade"
        onBack={() => router.back()}
        backAccessibilityLabel="Voltar para Configurações"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSectionHeader title="Documentos" />
        <SettingsGroup>
          <SettingsRow
            icon="doc.text"
            label="Termos de Uso"
            onPress={() => openUrl(TERMS_URL)}
            accessibilityHint="Abre os Termos de Uso no navegador."
            testID="settings-privacy-terms"
          />
          <SettingsRow
            icon="lock.doc"
            label="Política de Privacidade"
            divider
            onPress={() => openUrl(PRIVACY_URL)}
            accessibilityHint="Abre a Política de Privacidade no navegador."
            testID="settings-privacy-policy"
          />
        </SettingsGroup>
      </ScrollView>
    </SafeAreaView>
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
})
