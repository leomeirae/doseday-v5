import { useState } from 'react'
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'
import { AuthButton } from '@components/ui/AuthButton'
import { SectionHeader } from '@components/ui/SectionHeader'
import { AccountCard } from '@components/perfil/AccountCard'
import { SectionLink } from '@components/perfil/SectionLink'
import { signOut } from '@lib/supabase/auth'
import { useSession } from '@hooks/useSession'
import { useProfile } from '@hooks/useProfile'

const PRIVACY_URL = 'https://doseday.com.br/privacidade'
const TERMS_URL = 'https://doseday.com.br/termos'
const SUPPORT_URL = 'mailto:suporte@doseday.com.br?subject=Suporte%20DoseDay'
const APP_VERSION = '5.0.0 (build 1)'

function fallbackName(email: string): string {
  const [name] = email.split('@')
  if (!name) return 'Sua conta'
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export default function PerfilScreen() {
  const router = useRouter()
  const { session } = useSession()
  const { data: profile } = useProfile()
  const [loadingSignOut, setLoadingSignOut] = useState(false)

  const email = session?.user.email ?? ''
  const fullName = profile?.fullName?.trim() || fallbackName(email)
  const userId = session?.user.id ?? ''

  async function handleSignOut() {
    setLoadingSignOut(true)
    try {
      await signOut()
    } finally {
      setLoadingSignOut(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>Perfil</Text>

        <SectionHeader title="Conta" />
        <AccountCard
          fullName={fullName}
          email={email}
          createdAt={session?.user.created_at}
          userId={userId}
        />

        <SectionHeader title="Privacidade & Dados" />
        <View style={styles.sectionGroup}>
          <SectionLink
            label="Política de privacidade"
            icon="doc.text"
            onPress={() => Linking.openURL(PRIVACY_URL)}
            hint="Abre a política de privacidade do DoseDay"
            testID="perfil-privacy-link"
          />
          <SectionLink
            label="Termos de uso"
            icon="doc.plaintext"
            onPress={() => Linking.openURL(TERMS_URL)}
            hint="Abre os termos de uso do DoseDay"
            testID="perfil-terms-link"
          />
        </View>

        <View style={styles.destructiveBlock}>
          <SectionLink
            label="Excluir minha conta"
            icon="trash"
            role="button"
            destructive
            onPress={() => router.push('/perfil/excluir')}
            hint="Ação destrutiva. Abre a confirmação para excluir sua conta"
            testID="perfil-delete-account-link"
          />
        </View>

        <SectionHeader title="Suporte" />
        <View style={styles.sectionGroup}>
          <SectionLink
            label="Falar com suporte"
            icon="envelope"
            onPress={() => Linking.openURL(SUPPORT_URL)}
            hint="Abre seu app de email para falar com o suporte"
            testID="perfil-support-link"
          />
          <View style={styles.versionRow} accessibilityLabel={`Versão ${APP_VERSION}`}>
            <Text style={styles.versionLabel}>Versão</Text>
            <Text style={styles.versionValue}>{APP_VERSION}</Text>
          </View>
        </View>

        <View style={styles.signOutBlock}>
          <AuthButton
            variant="secondary"
            label="Sair"
            onPress={handleSignOut}
            loading={loadingSignOut}
            accessibilityLabel="Sair da conta"
            testID="perfil-signout-button"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  headline: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  sectionGroup: {
    gap: spacing.xs,
  },
  destructiveBlock: {
    marginTop: spacing.md,
  },
  versionRow: {
    minHeight: 52,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  versionLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  versionValue: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  signOutBlock: {
    marginTop: spacing.xl,
  },
})
