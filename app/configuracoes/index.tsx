import { StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, type Href } from 'expo-router'
import { SettingsFooter } from '@components/settings/SettingsFooter'
import { SettingsGroup } from '@components/settings/SettingsGroup'
import { SettingsHeader } from '@components/settings/SettingsHeader'
import { SettingsRow } from '@components/settings/SettingsRow'
import { colors, spacing, typography } from '@lib/theme/tokens'

export default function ConfiguracoesScreen() {
  const router = useRouter()

  function open(route: Href) {
    router.push(route)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <SettingsHeader
        title="Configurações"
        onBack={() => router.back()}
        backAccessibilityLabel="Voltar para Perfil"
        testID="settings-back-profile"
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.subtitle}>
            Ajustes da conta, do tratamento e dos seus dados.
          </Text>
        </View>

        <View style={styles.groups}>
          <SettingsGroup>
            <SettingsRow
              icon="person.circle.fill"
              label="Conta"
              onPress={() => open('/configuracoes/conta' as Href)}
              accessibilityHint="Abre dados de identidade e conta."
              testID="settings-row-conta"
            />
          </SettingsGroup>

          <SettingsGroup>
            <SettingsRow
              icon="cross.case"
              label="Tratamento"
              onPress={() => open('/configuracoes/tratamento' as Href)}
              accessibilityHint="Abre os ajustes do tratamento."
              testID="settings-row-tratamento"
            />
            <SettingsRow
              icon="calendar"
              label="Protocolo de dose"
              divider
              onPress={() => open('/perfil/protocolo' as Href)}
              accessibilityHint="Define o intervalo entre aplicações."
              testID="settings-row-protocolo"
            />
          </SettingsGroup>

          <SettingsGroup>
            <SettingsRow
              icon="bell.fill"
              label="Lembretes"
              onPress={() => open('/configuracoes/lembretes' as Href)}
              accessibilityHint="Abre notificações e horários de lembrete."
              testID="settings-row-lembretes"
            />
          </SettingsGroup>

          <SettingsGroup>
            <SettingsRow
              icon="doc.text"
              label="Dados"
              onPress={() => open('/configuracoes/dados' as Href)}
              accessibilityHint="Abre exportação, consentimentos e exclusão de conta."
              testID="settings-row-dados"
            />
          </SettingsGroup>

          <SettingsGroup>
            <SettingsRow
              icon="lock.shield"
              label="Privacidade"
              onPress={() => open('/configuracoes/privacidade' as Href)}
              accessibilityHint="Abre termos, política e compartilhamento de dados."
              testID="settings-row-privacidade"
            />
          </SettingsGroup>

          <SettingsGroup>
            <SettingsRow
              icon="questionmark.circle"
              label="Suporte"
              onPress={() => open('/configuracoes/suporte' as Href)}
              accessibilityHint="Abre ajuda, FAQ e informações do app."
              testID="settings-row-suporte"
            />
          </SettingsGroup>
        </View>

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
    paddingTop: spacing.md,
  },
  intro: {
    marginBottom: spacing.xl,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  groups: {
    gap: spacing.lg,
  },
})
