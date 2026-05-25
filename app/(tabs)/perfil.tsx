import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import type { Href } from 'expo-router'
import { colors, typography, spacing } from '@lib/theme/tokens'
import { signOut } from '@lib/supabase/auth'
import { SettingsSection } from '@components/perfil/SettingsSection'
import { SettingsRow } from '@components/perfil/SettingsRow'
import { useProfile } from '@hooks/useProfile'

export default function PerfilScreen() {
  const router = useRouter()
  const { t } = useTranslation('settings')
  const { data: profile } = useProfile()
  const [loadingSignOut, setLoadingSignOut] = useState(false)

  async function doSignOut() {
    setLoadingSignOut(true)
    try {
      await signOut()
      // Auth guard in _layout.tsx detects session: null and redirects automatically
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
        { text: t('account.signOut.confirm'), onPress: doSignOut },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>Perfil</Text>

        <SettingsSection title={t('sections.healthProfile')}>
          <SettingsRow
            icon="calendar"
            iconColor={colors.semanticInfo}
            label="Protocolo de dose"
            value={
              profile?.doseFrequencyDays
                ? `${profile.doseFrequencyDays} dias`
                : 'A definir'
            }
            onPress={() => router.push('/perfil/protocolo' as Href)}
            isLast
            accessibilityLabel="Editar protocolo de dose"
            accessibilityHint="Define o intervalo entre aplicações."
            testID="perfil-row-protocolo"
          />
        </SettingsSection>

        {/* PREFERÊNCIAS */}
        <SettingsSection title={t('sections.preferences')}>
          <SettingsRow
            icon="bell.fill"
            iconColor={colors.semanticInfo}
            label={t('preferences.notifications')}
            onPress={() => router.push('/perfil/notificacoes')}
            isLast
            accessibilityLabel="Configurações de Notificações"
            testID="perfil-row-notificacoes"
          />
        </SettingsSection>

        {/* SOBRE — placeholder, rows ativas em prompts futuros */}
        <SettingsSection title={t('sections.about')}>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Em breve</Text>
          </View>
        </SettingsSection>

        {/* CONTA */}
        <SettingsSection title={t('sections.account')}>
          <SettingsRow
            icon="person.circle.fill"
            iconColor={colors.textSecondary}
            label={t('account.accountSettings')}
            onPress={() => router.push('/perfil/account' as Href)}
            accessibilityLabel="Configurações da conta"
            testID="perfil-row-conta"
          />
          <SettingsRow
            icon="rectangle.portrait.and.arrow.right"
            iconColor={colors.semanticCritical}
            label={loadingSignOut ? 'Saindo...' : t('account.signOut.confirm')}
            onPress={handleSignOut}
            showChevron={false}
            disabled={loadingSignOut}
            isLast
            accessibilityLabel="Sair da conta"
            testID="perfil-signout-button"
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  headline: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  placeholder: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  placeholderText: {
    ...typography.body,
    color: colors.textTertiary,
  },
})
