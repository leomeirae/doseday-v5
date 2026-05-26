import { Text, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import type { Href } from 'expo-router'
import { colors, typography, spacing } from '@lib/theme/tokens'
import { SettingsSection } from '@components/perfil/SettingsSection'
import { SettingsRow } from '@components/perfil/SettingsRow'

export default function PerfilScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>Perfil</Text>
        <Text style={styles.helper}>Conta, tratamento, lembretes e seus dados.</Text>

        <SettingsSection title="Configurações">
          <SettingsRow
            icon="gearshape.fill"
            iconColor={colors.semanticInfo}
            label="Abrir Configurações"
            onPress={() => router.push('/configuracoes' as Href)}
            isLast
            accessibilityLabel="Abrir Configurações"
            accessibilityHint="Abre o hub principal de configurações."
            testID="perfil-row-configuracoes"
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
    marginBottom: spacing.xs,
  },
  helper: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
})
