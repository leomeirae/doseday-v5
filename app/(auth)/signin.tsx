import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors, typography, spacing } from '@lib/theme/tokens'
import { AuthHeader } from '@components/auth/AuthHeader'
import { TextField } from '@components/ui/TextField'
import { AuthButton } from '@components/auth/AuthButton'
import { AuthLink } from '@components/auth/AuthLink'
import { signIn } from '@lib/supabase/auth'
import { signInSchema } from '@lib/validation/authSchemas'

function mapSignInError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Email ou senha incorretos'
  if (message.includes('Email not confirmed')) return 'Confirme seu email antes de entrar'
  if (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('Network request failed')
  )
    return 'Sem conexão com a internet. Tente novamente.'
  return 'Não foi possível entrar. Tente novamente.'
}

export default function SignInScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignIn() {
    setEmailError('')
    setPasswordError('')
    setGeneralError('')

    const result = signInSchema.safeParse({ email, password })

    if (!result.success) {
      const issues = result.error.flatten().fieldErrors
      if (issues.email?.[0]) setEmailError(issues.email[0])
      if (issues.password?.[0]) setPasswordError(issues.password[0])
      return
    }

    setLoading(true)
    try {
      const { session, error } = await signIn(email, password)
      if (error) {
        setGeneralError(mapSignInError(error.message))
        return
      }
      if (session) {
        router.replace('/(tabs)')
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : ''
      setGeneralError(mapSignInError(message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader />

          <View style={styles.form}>
            <TextField
              label="Email"
              value={email}
              onChangeText={(v) => { setEmail(v); if (emailError) setEmailError('') }}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
              returnKeyType="next"
              blurOnSubmit={false}
              error={emailError}
              placeholder="seu@email.com"
              accessibilityLabel="Campo de email"
              testID="signin-email"
            />
            <TextField
              label="Senha"
              value={password}
              onChangeText={(v) => { setPassword(v); if (passwordError) setPasswordError('') }}
              secureTextEntry
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleSignIn}
              error={passwordError}
              accessibilityLabel="Campo de senha"
              testID="signin-password"
            />
          </View>

          <View style={styles.actions}>
            <AuthButton
              label="Entrar"
              onPress={handleSignIn}
              loading={loading}
              disabled={!email || !password}
              accessibilityLabel="Entrar na conta"
              testID="signin-button"
            />

            {!!generalError && (
              <Text style={styles.generalError}>{generalError}</Text>
            )}

            <AuthLink
              label="Esqueci minha senha"
              onPress={() => router.push('/(auth)/recover')}
              accessibilityLabel="Recuperar senha"
            />

            <AuthLink
              label="Não tem conta? Cadastre-se"
              onPress={() => router.replace('/(auth)/signup')}
              dim
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  form: {
    gap: spacing.lg,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  generalError: {
    ...typography.caption,
    color: colors.semanticCritical,
    textAlign: 'center',
  },
})
