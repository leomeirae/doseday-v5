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
import { AuthLink } from '@components/ui/AuthLink'
import { recoverPassword } from '@lib/supabase/auth'
import { recoverSchema } from '@lib/validation/authSchemas'

function mapRecoverError(message: string): string {
  if (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('Network request failed')
  )
    return 'Sem conexão com a internet. Tente novamente.'
  return 'Não foi possível enviar o email. Tente novamente.'
}

function isNetworkError(message: string): boolean {
  return (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('Network request failed')
  )
}

export default function RecoverScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleRecover() {
    setEmailError('')
    setGeneralError('')

    const result = recoverSchema.safeParse({ email })

    if (!result.success) {
      const issues = result.error.flatten().fieldErrors
      if (issues.email?.[0]) setEmailError(issues.email[0])
      return
    }

    setLoading(true)
    try {
      const { error } = await recoverPassword(email)
      // Only show error for network failures — email existence is never leaked (security)
      if (error && isNetworkError(error.message)) {
        setGeneralError(mapRecoverError(error.message))
        return
      }
      setSent(true)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : ''
      setGeneralError(mapRecoverError(message))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader tagline="Recuperar acesso" />
          <View style={styles.sentContainer}>
            <Text
              style={styles.sentTitle}
              accessibilityRole="header"
              accessibilityLabel="Email enviado"
            >
              Email enviado
            </Text>
            <Text style={styles.sentBody}>
              Enviamos um link para <Text style={styles.sentEmail}>{email}</Text>. O link pode levar até 5 minutos. Verifique também a pasta de spam.
            </Text>
          </View>
          <View style={styles.actions}>
            <AuthButton
              variant="secondary"
              label="Voltar para o login"
              onPress={() => router.replace('/(auth)/signin')}
              accessibilityLabel="Voltar para o login"
              testID="recover-back-sent-button"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    )
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
          <AuthHeader tagline="Recuperar acesso" />

          <View style={styles.form}>
            <TextField
              label="Email"
              value={email}
              onChangeText={(v) => { setEmail(v); if (emailError) setEmailError('') }}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
              returnKeyType="go"
              onSubmitEditing={handleRecover}
              error={emailError}
              placeholder="seu@email.com"
              maxLength={254}
              accessibilityLabel="Campo de email para recuperação de senha"
              testID="recover-email"
            />
          </View>

          <View style={styles.actions}>
            <AuthButton
              label="Enviar link"
              onPress={handleRecover}
              loading={loading}
              disabled={!email}
              accessibilityLabel="Enviar link de recuperação de senha"
              testID="recover-button"
            />

            {!!generalError && (
              <Text
                style={styles.generalError}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                {generalError}
              </Text>
            )}

            <AuthLink
              label="Voltar para o login"
              onPress={() => router.replace('/(auth)/signin')}
              accessibilityLabel="Voltar para o login"
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
    flexGrow: 1,
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
  sentContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sentTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sentBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sentEmail: {
    color: colors.textPrimary,
  },
  generalError: {
    ...typography.caption,
    color: colors.semanticCritical,
    textAlign: 'center',
  },
})
