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
import { useEntitlements } from '@contexts/SubscriptionContext'
import { useSession } from '@hooks/useSession'
import { signOut } from '@lib/supabase/auth'
import { setDevEntitlementOverride } from '@lib/subscription/devEntitlementStorage'
import { colors, spacing, typography } from '@lib/theme/tokens'

export default function ConfiguracoesContaScreen() {
  const router = useRouter()
  const { t } = useTranslation('settings')
  const { session } = useSession()
  const { isPremium, refresh } = useEntitlements()
  const [loadingSignOut, setLoadingSignOut] = useState(false)
  const email = session?.user.email ?? 'E-mail não disponível'

  // Dev-only: liga/desliga o mock de premium pra validar gating sem compra real.
  // Em release, resolveEntitlement ignora o override (guard testado em
  // lib/subscription/__tests__/entitlement.test.ts) e esta linha nem renderiza.
  async function toggleDevPremium() {
    await setDevEntitlementOverride(!isPremium)
    await refresh()
  }

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
            value={isPremium ? 'Premium' : 'Gratuito'}
            onPress={() => router.push('/paywall')}
            accessibilityHint="Abre os detalhes da assinatura Premium."
            testID="settings-account-subscription"
          />
          {__DEV__ ? (
            <SettingsRow
              icon="hammer"
              label="[DEV] Simular Premium"
              value={isPremium ? 'Ligado' : 'Desligado'}
              chevron={false}
              divider
              onPress={() => void toggleDevPremium()}
              accessibilityHint="Alterna o mock de assinatura Premium em desenvolvimento."
              testID="settings-dev-premium-toggle"
            />
          ) : null}
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
