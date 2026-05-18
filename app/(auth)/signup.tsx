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
import { AuthButton } from '@components/ui/AuthButton'
import { AuthLink } from '@components/auth/AuthLink'
import { signUp } from '@lib/supabase/auth'
import { signUpSchema } from '@lib/validation/authSchemas'

function mapSignUpError(message: string): string {
  if (message.includes('User already registered'))
    return 'Esse email já tem uma conta. Tente entrar.'
  if (message.includes('Password should be at least 6 characters'))
    return 'Senha deve ter pelo menos 6 caracteres'
  if (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('Network request failed')
  )
    return 'Sem conexão com a internet. Tente novamente.'
  return 'Não foi possível criar a conta. Tente novamente.'
}

export default function SignUpScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignUp() {
    setNameError('')
    setEmailError('')
    setPasswordError('')
    setGeneralError('')

    const result = signUpSchema.safeParse({ name, email, password })

    if (!result.success) {
      const issues = result.error.flatten().fieldErrors
      if (issues.name?.[0]) setNameError(issues.name[0])
      if (issues.email?.[0]) setEmailError(issues.email[0])
      if (issues.password?.[0]) setPasswordError(issues.password[0])
      return
    }

    setLoading(true)
    try {
      const { session, error } = await signUp(email, password, { full_name: name })
      if (error) {
        setGeneralError(mapSignUpError(error.message))
        return
      }
      if (session) {
        router.replace('/(tabs)')
      } else {
        // Email confirmation required
        setGeneralError('Verifique seu email para ativar a conta.')
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : ''
      setGeneralError(mapSignUpError(message))
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
          <AuthHeader tagline="Comece sua memória do tratamento" />

          <View style={styles.form}>
            <TextField
              label="Nome"
              value={name}
              onChangeText={(v) => { setName(v); if (nameError) setNameError('') }}
              autoCapitalize="words"
              textContentType="name"
              returnKeyType="next"
              blurOnSubmit={false}
              error={nameError}
              placeholder="Seu nome"
              accessibilityLabel="Campo de nome"
              testID="signup-name"
            />
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
              testID="signup-email"
            />
            <TextField
              label="Senha"
              value={password}
              onChangeText={(v) => { setPassword(v); if (passwordError) setPasswordError('') }}
              secureTextEntry
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={handleSignUp}
              error={passwordError}
              placeholder="Mínimo 8 caracteres"
              accessibilityLabel="Campo de senha"
              testID="signup-password"
            />
          </View>

          <View style={styles.actions}>
            <AuthButton
              label="Criar conta"
              onPress={handleSignUp}
              loading={loading}
              disabled={!name || !email || !password}
              accessibilityLabel="Criar conta"
              testID="signup-button"
            />

            {!!generalError && (
              <Text style={styles.generalError}>{generalError}</Text>
            )}

            <AuthLink
              label="Já tem conta? Entrar"
              onPress={() => router.replace('/(auth)/signin')}
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
