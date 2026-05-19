import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'
import { AuthButton } from '@components/ui/AuthButton'
import { signOut } from '@lib/supabase/auth'
import { useSession } from '@hooks/useSession'

export default function PerfilScreen() {
  const { session } = useSession()
  const router = useRouter()
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

        {/* Notificações row */}
        <Pressable
          style={({ pressed }) => [styles.notifRow, pressed && styles.notifRowPressed]}
          onPress={() => router.push('/perfil/notificacoes')}
          accessibilityRole="button"
          accessibilityLabel="Configurações de Notificações"
        >
          <View style={styles.notifRowLeft}>
            <SymbolView name="bell.fill" size={18} tintColor={colors.semanticInfo} />
            <Text style={styles.notifRowLabel}>Notificações</Text>
          </View>
          <SymbolView name="chevron.right" size={14} tintColor={colors.textTertiary} />
        </Pressable>

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
  notifRow: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  notifRowPressed: {
    opacity: 0.75,
  },
  notifRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  notifRowLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
})
