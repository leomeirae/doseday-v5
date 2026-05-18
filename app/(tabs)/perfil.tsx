import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'
import { AuthButton } from '@components/auth/AuthButton'
import { signOut } from '@lib/supabase/auth'
import { useSession } from '@hooks/useSession'

export default function PerfilScreen() {
  const { session } = useSession()
  const [loadingSignOut, setLoadingSignOut] = useState(false)

  async function handleSignOut() {
    setLoadingSignOut(true)
    try {
      await signOut()
      // Guard global in _layout.tsx detects session: null and redirects automatically
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

        <View
          style={styles.card}
          accessibilityLabel={`Conta: ${session?.user.email ?? ''}`}
        >
          <Text style={styles.cardLabel}>Conta</Text>
          <Text style={styles.cardEmail} testID="perfil-email" numberOfLines={1}>
            {session?.user.email ?? ''}
          </Text>
        </View>

        <View style={styles.spacer} />

        <AuthButton
          variant="secondary"
          label="Sair"
          onPress={handleSignOut}
          loading={loadingSignOut}
          accessibilityLabel="Sair da conta"
          testID="perfil-signout-button"
        />
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
    paddingBottom: spacing.xl,
  },
  headline: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  cardEmail: {
    ...typography.body,
    color: colors.textPrimary,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.xxl,
  },
})
