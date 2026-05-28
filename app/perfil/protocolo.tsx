import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, type Href } from 'expo-router'
import { SettingsHeader } from '@components/settings/SettingsHeader'
import { AuthButton } from '@components/ui/AuthButton'
import { useProfile } from '@hooks/useProfile'
import { useSession } from '@hooks/useSession'
import { useUpdateDoseProtocol } from '@hooks/useUpdateProfile'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'
import { showSuccessToast } from '@lib/utils/showToast'

const SUGGESTED_INTERVALS = [1, 7, 10, 14] as const

export default function DoseProtocolScreen() {
  const router = useRouter()
  const { session } = useSession()
  const { data: profile } = useProfile()
  const updateDoseProtocol = useUpdateDoseProtocol(session?.user?.id ?? '')
  const [daysText, setDaysText] = useState('')

  useEffect(() => {
    if (profile?.doseFrequencyDays == null) return
    setDaysText(String(profile.doseFrequencyDays))
  }, [profile?.doseFrequencyDays])

  const parsedDays = useMemo(() => {
    const normalized = daysText.trim().replace(',', '.')
    if (normalized === '') return null
    const value = Number(normalized)
    return Number.isInteger(value) ? value : null
  }, [daysText])

  const isValid = parsedDays !== null && parsedDays >= 1 && parsedDays <= 90
  const savedDays = profile?.doseFrequencyDays ?? null
  const isDirty = isValid && parsedDays !== savedDays
  const isBlocked = updateDoseProtocol.isPending || !session?.user?.id

  function goBack() {
    if (router.canGoBack()) {
      router.back()
      return
    }

    router.replace('/(tabs)/perfil' as Href)
  }

  function handleSave() {
    if (!session?.user?.id) return

    if (!isValid || parsedDays === null) {
      Alert.alert('', 'Informe um intervalo entre 1 e 90 dias.')
      return
    }

    updateDoseProtocol.mutate(
      { doseFrequencyDays: parsedDays },
      {
        onSuccess: () => {
          showSuccessToast('Protocolo salvo')
          goBack()
        },
        onError: () => Alert.alert('', 'Não consegui salvar seu protocolo.'),
      }
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <SettingsHeader
        title="Protocolo"
        onBack={goBack}
        backAccessibilityLabel="Voltar"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Intervalo entre aplicações</Text>
          <Text style={styles.description}>
            Defina o intervalo combinado com quem te acompanha ou o intervalo que você está
            seguindo. O DoseDay usa esse dado para calcular a próxima dose.
          </Text>

          <View style={styles.chips}>
            {SUGGESTED_INTERVALS.map((days) => {
              const selected = parsedDays === days
              return (
                <Pressable
                  key={days}
                  onPress={() => setDaysText(String(days))}
                  accessibilityRole="button"
                  accessibilityLabel={`Usar intervalo de ${days} ${days === 1 ? 'dia' : 'dias'}`}
                  style={[
                    styles.chip,
                    selected && styles.chipSelected,
                  ]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {days === 1 ? '1 dia' : `${days} dias`}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <Text style={styles.fieldLabel}>Outro intervalo</Text>
          <View style={styles.inputCard}>
            <TextInput
              value={daysText}
              onChangeText={(value) => setDaysText(value.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="Ex: 12"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
              maxLength={2}
              accessibilityLabel="Intervalo entre aplicações em dias"
            />
            <Text style={styles.inputSuffix}>dias</Text>
          </View>

          {daysText.trim() !== '' && !isValid && (
            <Text style={styles.errorText}>Use um número inteiro entre 1 e 90.</Text>
          )}

          <View style={styles.note}>
            <Text style={styles.noteText}>
              Se o protocolo mudar, edite aqui. O histórico anterior continua preservado.
            </Text>
          </View>

          <AuthButton
            label={updateDoseProtocol.isPending ? 'Salvando...' : 'Salvar protocolo'}
            onPress={handleSave}
            disabled={isBlocked || !isDirty}
          />
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
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodyClinical,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  chip: {
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: radius.full,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.textInverse,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
    textTransform: 'uppercase',
  },
  inputCard: {
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    borderWidth: 0.5,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  input: {
    ...typography.headline,
    color: colors.textPrimary,
    flex: 1,
    minHeight: 64,
    paddingVertical: 0,
  },
  inputSuffix: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.caption,
    color: colors.semanticCritical,
    marginBottom: spacing.md,
  },
  note: {
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md,
    borderWidth: 0.5,
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  noteText: {
    ...typography.caption,
    color: colors.textTertiary,
    lineHeight: 20,
  },
})
