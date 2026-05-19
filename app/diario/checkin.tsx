import { useState, useRef, useEffect } from 'react'
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
import { CheckinInsightView } from '@components/diario/CheckinInsightView'
import { EmotionalStatePicker } from '@components/diario/EmotionalStatePicker'
import { SymptomsMultiSelect } from '@components/diario/SymptomsMultiSelect'
import { TriggersMultiSelect } from '@components/diario/TriggersMultiSelect'
import { useDoseSummary } from '@hooks/useDoseSummary'
import { useProfile } from '@hooks/useProfile'
import { useRegisterCheckin } from '@hooks/useRegisterCheckin'
import { useSession } from '@hooks/useSession'
import { supabase } from '@lib/supabase/client'
import { buildTreatmentContext } from '@lib/supabase/queries/diario'
import { callGenerateCheckinInsight, emotionalStateToMood } from '@lib/supabase/queries/insights'
import type { CheckinInsightOutput } from '@lib/supabase/queries/insights'
import { mapQueryError } from '@lib/supabase/queries/errors'
import { colors, typography, spacing } from '@lib/theme/tokens'
import { showErrorToast, showSuccessToast } from '@lib/utils/showToast'
import { checkinSchema } from '@lib/validation/diarioSchemas'
import type { EmotionalState, SymptomType, Trigger } from '@lib/validation/diarioSchemas'

const INSIGHT_TIMEOUT_MS = 20000

export default function CheckinScreen() {
  const router = useRouter()
  const { session } = useSession()
  const { data: profile } = useProfile()
  const { data: doseSummary } = useDoseSummary()
  const { mutate, isPending } = useRegisterCheckin()
  const userId = session?.user?.id

  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null)
  const [symptoms, setSymptoms] = useState<SymptomType[]>([])
  const [triggers, setTriggers] = useState<Trigger[]>([])
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [phase, setPhase] = useState<'form' | 'loading' | 'insight'>('form')
  const [insight, setInsight] = useState<CheckinInsightOutput | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  async function tryGenerateFirstCheckinInsight(state: EmotionalState) {
    if (!userId) return

    const { count } = await supabase
      .from('daily_checkins')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (count !== 1) {
      showSuccessToast('Check-in registrado')
      router.back()
      return
    }

    setPhase('loading')

    timeoutRef.current = setTimeout(() => {
      showSuccessToast('Check-in registrado')
      router.back()
    }, INSIGHT_TIMEOUT_MS)

    try {
      const result = await callGenerateCheckinInsight({
        medication: profile?.currentMedication ?? null,
        dose_mg: profile?.currentDose ?? null,
        treatment_week: profile?.treatmentStartDate
          ? Math.floor(
              (Date.now() - new Date(profile.treatmentStartDate).getTime()) /
                (7 * 24 * 60 * 60 * 1000)
            ) + 1
          : null,
        current_weight: profile?.currentWeight ?? null,
        initial_weight: profile?.initialWeight ?? null,
        goal_weight: profile?.goalWeight ?? null,
        mood: emotionalStateToMood(state),
        days_since_last_dose: doseSummary?.history[0]?.applicationDate
          ? Math.floor(
              (Date.now() - new Date(doseSummary.history[0].applicationDate).getTime()) /
                (24 * 60 * 60 * 1000)
            )
          : null,
      })

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setInsight(result)
      setPhase('insight')
    } catch {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      showSuccessToast('Check-in registrado')
      router.back()
    }
  }

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
    const capturedState = parsed.data.emotionalState

    mutate(
      { input: parsed.data, ctx },
      {
        onSuccess: () => {
          void tryGenerateFirstCheckinInsight(capturedState)
        },
        onError: (err) => {
          showErrorToast(mapQueryError(err))
        },
      }
    )
  }

  if (phase === 'loading' || phase === 'insight') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <CheckinInsightView
          insight={insight}
          isLoading={phase === 'loading'}
          onClose={() => router.back()}
        />
      </SafeAreaView>
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
