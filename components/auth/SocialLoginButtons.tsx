import { useEffect, useState } from 'react'
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Platform } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'
import {
  signInWithGoogle,
  signInWithApple,
  isAppleSignInAvailable,
  type OAuthOutcome,
} from '@lib/auth/oauth'

type Props = {
  onError: (message: string) => void
  disabled?: boolean
}

export function SocialLoginButtons({ onError, disabled = false }: Props) {
  const [appleAvailable, setAppleAvailable] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [loadingApple, setLoadingApple] = useState(false)

  useEffect(() => {
    let cancelled = false
    void isAppleSignInAvailable().then((available) => {
      if (!cancelled) setAppleAvailable(available)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const busy = disabled || loadingGoogle || loadingApple

  function handleOutcome(outcome: OAuthOutcome) {
    if (outcome.status === 'error') onError(outcome.message)
    // 'success' → AuthGuard roteia; 'cancelled' → silêncio (o usuário desistiu)
  }

  async function handleGoogle() {
    if (busy) return
    onError('')
    setLoadingGoogle(true)
    try {
      handleOutcome(await signInWithGoogle())
    } finally {
      setLoadingGoogle(false)
    }
  }

  async function handleApple() {
    if (busy) return
    onError('')
    setLoadingApple(true)
    try {
      handleOutcome(await signInWithApple())
    } finally {
      setLoadingApple(false)
    }
  }

  const showApple = Platform.OS === 'ios' && appleAvailable

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.line} />
      </View>

      <Pressable
        style={[styles.googleButton, busy && styles.disabled]}
        onPress={handleGoogle}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Continuar com Google"
        testID="signin-google"
      >
        {loadingGoogle ? (
          <ActivityIndicator color="#1F1F1F" />
        ) : (
          <>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleLabel}>Continuar com Google</Text>
          </>
        )}
      </Pressable>

      {showApple &&
        (loadingApple ? (
          <View style={[styles.appleButton, styles.appleLoading]}>
            <ActivityIndicator color="#000000" />
          </View>
        ) : (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={radius.md}
            style={styles.appleButton}
            onPress={handleApple}
          />
        ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.bgSurface,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
  },
  googleG: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleLabel: {
    ...typography.label,
    color: '#1F1F1F',
  },
  appleButton: {
    height: 52,
    width: '100%',
  },
  appleLoading: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
})
