import { Linking, Share, StyleSheet } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, type Href } from 'expo-router'
import * as StoreReview from 'expo-store-review'
import { openBrowserAsync } from 'expo-web-browser'
import { SettingsFooter } from '@components/settings/SettingsFooter'
import { SettingsGroup } from '@components/settings/SettingsGroup'
import { SettingsHeader } from '@components/settings/SettingsHeader'
import { SettingsRow } from '@components/settings/SettingsRow'
import { SettingsSectionHeader } from '@components/settings/SettingsSectionHeader'
import { colors, spacing } from '@lib/theme/tokens'
import { showErrorToast } from '@lib/utils/showToast'

const FAQ_URL = 'https://dose-day.com/faq'
const SUPPORT_EMAIL_URL = 'mailto:suporte@doseday.com.br?subject=Suporte%20DoseDay'
const SHARE_MESSAGE = 'Conheça o DoseDay: https://dose-day.com'

export default function ConfiguracoesSuporteScreen() {
  const router = useRouter()

  async function openFaq() {
    try {
      await openBrowserAsync(FAQ_URL)
    } catch {
      showErrorToast('Não consegui abrir o FAQ.')
    }
  }

  async function openSupportEmail() {
    try {
      const canOpenEmail = await Linking.canOpenURL(SUPPORT_EMAIL_URL)
      if (!canOpenEmail) {
        showErrorToast('Nenhum app de e-mail disponível.')
        return
      }
      await Linking.openURL(SUPPORT_EMAIL_URL)
    } catch {
      showErrorToast('Não consegui abrir o e-mail.')
    }
  }

  async function requestReview() {
    try {
      const hasReviewAction = await StoreReview.hasAction()
      if (!hasReviewAction) {
        showErrorToast('Avaliação indisponível neste dispositivo.')
        return
      }
      await StoreReview.requestReview()
    } catch {
      showErrorToast('Não consegui abrir a avaliação.')
    }
  }

  async function shareApp() {
    try {
      await Share.share({ message: SHARE_MESSAGE })
    } catch {
      showErrorToast('Não consegui abrir o compartilhamento.')
    }
  }

  function open(route: Href) {
    router.push(route)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <SettingsHeader
        title="Suporte"
        onBack={() => router.back()}
        backAccessibilityLabel="Voltar para Configurações"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSectionHeader title="Ajuda" />
        <SettingsGroup>
          <SettingsRow
            icon="questionmark.circle"
            label="FAQ"
            onPress={openFaq}
            accessibilityHint="Abre perguntas frequentes no navegador."
            testID="settings-support-faq"
          />
          <SettingsRow
            icon="envelope"
            label="Falar com suporte"
            divider
            onPress={openSupportEmail}
            accessibilityHint="Abre um e-mail para o suporte."
            testID="settings-support-email"
          />
        </SettingsGroup>

        <SettingsSectionHeader title="DoseDay" />
        <SettingsGroup>
          <SettingsRow
            icon="star"
            label="Avaliar o app"
            onPress={requestReview}
            accessibilityHint="Abre a avaliação nativa da loja quando disponível."
            testID="settings-support-review"
          />
          <SettingsRow
            icon="square.and.arrow.up"
            label="Compartilhar"
            divider
            onPress={shareApp}
            accessibilityHint="Abre a folha de compartilhamento."
            testID="settings-support-share"
          />
          <SettingsRow
            icon="info.circle"
            label="Sobre"
            divider
            onPress={() => open('/configuracoes/suporte/sobre' as Href)}
            accessibilityHint="Mostra versão, build e informações do app."
            testID="settings-support-about"
          />
        </SettingsGroup>

        <SettingsFooter />
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
