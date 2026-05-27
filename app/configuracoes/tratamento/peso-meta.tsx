import { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { AuthButton } from '@components/ui/AuthButton'
import { SettingsHeader } from '@components/settings/SettingsHeader'
import { TextField } from '@components/ui/TextField'
import { useProfile } from '@hooks/useProfile'
import { useSession } from '@hooks/useSession'
import { useUpdateGoalWeight } from '@hooks/useUpdateProfile'
import { colors, spacing, typography } from '@lib/theme/tokens'
import { showErrorToast, showSuccessToast } from '@lib/utils/showToast'
import { goalWeightSchema } from '@lib/validation/onboardingSchemas'

export default function ConfiguracoesPesoMetaScreen() {
  const router = useRouter()
  const { session } = useSession()
  const userId = session?.user.id ?? ''
  const { data: profile } = useProfile()
  const updateGoalWeight = useUpdateGoalWeight(userId)
  const [weightText, setWeightText] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)
  const draftWeight = weightText.trim() === '' ? null : Number(weightText.replace(',', '.'))
  const isDirty = profile != null
    && draftWeight !== null
    && Number.isFinite(draftWeight)
    && draftWeight !== profile.goalWeight

  useEffect(() => {
    if (profile?.goalWeight !== null && profile?.goalWeight !== undefined) {
      setWeightText(formatInput(profile.goalWeight))
    }
  }, [profile?.goalWeight])

  function handleSubmit() {
    const parsed = goalWeightSchema.safeParse({
      goal_weight: Number(weightText.replace(',', '.')),
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Confira o peso informado')
      return
    }

    setError(undefined)
    updateGoalWeight.mutate(
      { goalWeight: parsed.data.goal_weight },
      {
        onSuccess: () => {
          showSuccessToast('Peso meta salvo')
          router.back()
        },
        onError: () => {
          showErrorToast('Não consegui salvar o peso meta.')
        },
      }
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <SettingsHeader
        title="Peso meta"
        onBack={() => router.back()}
        backAccessibilityLabel="Voltar para Tratamento"
      />

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
          <TextField
            label="Peso meta (kg)"
            value={weightText}
            onChangeText={(value) => {
              setWeightText(value)
              if (error) setError(undefined)
            }}
            keyboardType="decimal-pad"
            autoCapitalize="none"
            placeholder="ex: 72,0"
            {...(error ? { error } : {})}
            testID="settings-goal-weight-input"
          />
          <Text style={styles.helper}>Use um valor entre 30 e 300 kg.</Text>
        </ScrollView>

        <View style={styles.footer}>
          <AuthButton
            label={updateGoalWeight.isPending ? 'Salvando...' : 'Salvar peso meta'}
            onPress={handleSubmit}
            loading={updateGoalWeight.isPending}
            disabled={updateGoalWeight.isPending || !isDirty}
            testID="settings-goal-weight-submit"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function formatInput(value: number): string {
  return value.toFixed(1).replace('.', ',')
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  helper: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  footer: {
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
})
