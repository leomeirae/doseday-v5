import { useState } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useTranslation } from 'react-i18next'
import { SettingsFooter } from '@components/settings/SettingsFooter'
import { SettingsGroup } from '@components/settings/SettingsGroup'
import { SettingsHeader } from '@components/settings/SettingsHeader'
import { SettingsRow } from '@components/settings/SettingsRow'
import { SettingsSectionHeader } from '@components/settings/SettingsSectionHeader'
import { useSession } from '@hooks/useSession'
import { signOut } from '@lib/supabase/auth'
import { colors, spacing, typography } from '@lib/theme/tokens'

export default function ConfiguracoesContaScreen() {
  const router = useRouter()
  const { t } = useTranslation('settings')
  const { session } = useSession()
  const [loadingSignOut, setLoadingSignOut] = useState(false)
  const email = session?.user.email ?? 'E-mail não disponível'

  async function doSignOut() {
    setLoadingSignOut(true)
    try {
      await signOut()
    } finally {
      setLoadingSignOut(false)
    }
  }

  function handleSignOut() {
    Alert.alert(
      t('account.signOut.title'),
      t('account.signOut.message'),
      [
        { text: t('account.signOut.cancel'), style: 'cancel' },
        { text: t('account.signOut.confirm'), style: 'destructive', onPress: doSignOut },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <SettingsHeader
        title="Conta"
        onBack={() => router.back()}
        backAccessibilityLabel="Voltar para Configurações"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSectionHeader title="Identidade" />
        <SettingsGroup>
          <View
            style={styles.readOnlyRow}
            accessible
            accessibilityLabel={`E-mail da conta: ${email}`}
          >
            <SymbolView name="envelope" size={20} tintColor={colors.textSecondary} />
            <View style={styles.readOnlyCopy}>
              <Text style={styles.readOnlyLabel}>E-mail</Text>
              <Text style={styles.readOnlyValue} numberOfLines={1}>
                {email}
              </Text>
            </View>
          </View>
        </SettingsGroup>

        <SettingsSectionHeader title="Assinatura" />
        <SettingsGroup>
          <SettingsRow
            icon="creditcard"
            label="Sua assinatura"
            value="Em breve"
            chevron={false}
            testID="settings-account-subscription"
          />
        </SettingsGroup>

        <SettingsSectionHeader title="Sessão" />
        <SettingsGroup>
          <SettingsRow
            icon="rectangle.portrait.and.arrow.right"
            label={loadingSignOut ? 'Saindo...' : t('account.signOut.confirm')}
            chevron={false}
            destructive
            onPress={handleSignOut}
            disabled={loadingSignOut}
            accessibilityHint="Encerra sua sessão neste dispositivo."
            testID="settings-account-signout"
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
  readOnlyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  readOnlyCopy: {
    flex: 1,
  },
  readOnlyLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xxs,
  },
  readOnlyValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
})
