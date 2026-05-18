import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Pressable,
  Platform,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { AuthButton } from '@components/ui/AuthButton'
import { TextField } from '@components/ui/TextField'
import { EmotionalStatePicker } from '@components/diario/EmotionalStatePicker'
import { SymptomsMultiSelect } from '@components/diario/SymptomsMultiSelect'
import { TriggersMultiSelect } from '@components/diario/TriggersMultiSelect'
import { useDoseSummary } from '@hooks/useDoseSummary'
import { useProfile } from '@hooks/useProfile'
import { useRegisterCheckin } from '@hooks/useRegisterCheckin'
import { buildTreatmentContext } from '@lib/supabase/queries/diario'
import { mapQueryError } from '@lib/supabase/queries/errors'
import { colors, typography, spacing } from '@lib/theme/tokens'
import { showErrorToast, showSuccessToast } from '@lib/utils/showToast'
import { checkinSchema } from '@lib/validation/diarioSchemas'
import type {
  EmotionalState,
  SymptomType,
  Trigger,
} from '@lib/validation/diarioSchemas'

export default function CheckinScreen() {
  const router = useRouter()
  const { data: profile } = useProfile()
  const { data: doseSummary } = useDoseSummary()
  const { mutate, isPending } = useRegisterCheckin()

  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null)
  const [symptoms, setSymptoms] = useState<SymptomType[]>([])
  const [triggers, setTriggers] = useState<Trigger[]>([])
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit() {
    if (!emotionalState) {
      setErrors({ emotionalState: 'Selecione como você está se sentindo.' })
      return
    }

    const parsed = checkinSchema.safeParse({
      emotionalState,
      symptoms,
      symptomTriggers: triggers,
      notes: notes.trim() === '' ? undefined : notes.trim(),
    })

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form')
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    const lastDoseDate = doseSummary?.history[0]?.applicationDate ?? null
    const ctx = buildTreatmentContext(profile ?? null, lastDoseDate)

    mutate(
      { input: parsed.data, ctx },
      {
        onSuccess: () => {
          showSuccessToast('Check-in registrado')
          router.back()
        },
        onError: (err) => {
          showErrorToast(mapQueryError(err))
        },
      }
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={13}
          accessibilityLabel="Fechar"
          accessibilityRole="button"
        >
          <SymbolView name="xmark" size={18} tintColor={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Como foi seu dia?</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Como você está?</Text>
            <EmotionalStatePicker value={emotionalState} onChange={setEmotionalState} />
            {!!errors.emotionalState && (
              <Text style={styles.errorText}>{errors.emotionalState}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Sintomas (opcional)</Text>
            <SymptomsMultiSelect selected={symptoms} onChange={setSymptoms} />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Gatilhos (opcional)</Text>
            <TriggersMultiSelect selected={triggers} onChange={setTriggers} />
          </View>

          <TextField
            label="Observações"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            maxLength={1000}
            placeholder="Opcional"
            error={errors.notes}
            testID="checkin-notes-input"
          />
        </ScrollView>

        <View style={styles.footer}>
          <AuthButton
            label="Salvar check-in"
            onPress={handleSubmit}
            loading={isPending}
            disabled={isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 18,
  },
  scrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.caption,
    color: colors.semanticCritical,
    marginTop: spacing.xxs,
  },
  footer: {
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
})
