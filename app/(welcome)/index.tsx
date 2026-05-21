import { useState } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import * as Haptics from 'expo-haptics'
import { WelcomeActionDock } from '@components/welcome/WelcomeActionDock'
import { colors, spacing, typography } from '@lib/theme/tokens'
import { markWelcomeSeen } from '@lib/utils/welcomeStorage'

export default function WelcomeScreen() {
  const { t } = useTranslation('welcome')
  const router = useRouter()
  const [navigating, setNavigating] = useState(false)

  async function goToAuthRoute(route: Href) {
    if (navigating) return

    setNavigating(true)
    if (Platform.OS === 'ios') void Haptics.selectionAsync()

    try {
      await markWelcomeSeen()
      router.replace(route)
    } finally {
      setNavigating(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View
          accessible
          accessibilityLabel={t('accessibility.intro')}
          style={styles.copy}
        >
          <Text style={styles.headline}>{t('headline')}</Text>
          <Text style={styles.subtitle}>{t('subtitle')}</Text>
        </View>

        <WelcomeActionDock
          createAccountLabel={t('actions.createAccount')}
          signInLabel={t('actions.signIn')}
          createAccountHint={t('accessibility.createAccountHint')}
          signInHint={t('accessibility.signInHint')}
          disabled={navigating}
          onCreateAccount={() => void goToAuthRoute('/(auth)/signup' as Href)}
          onSignIn={() => void goToAuthRoute('/(auth)/signin' as Href)}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xxxl,
  },
  copy: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headline: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: 'center',
    maxWidth: 320,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 312,
  },
})
