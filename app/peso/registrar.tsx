import { useEffect, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { AuthButton } from '@components/ui/AuthButton'
import { TextField } from '@components/ui/TextField'
import { useWeightLogs } from '@hooks/useWeightLogs'
import { showErrorToast } from '@lib/utils/showToast'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'
import { weightLogSchema } from '@lib/validation/weightSchemas'
import type { WeightLogInput } from '@lib/supabase/queries/weight'

export default function PesoRegistrarScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id?: string }>()
  const editId = typeof params.id === 'string' ? params.id : undefined
  const isEditMode = !!editId
  const { t } = useTranslation('weight')
  const { t: tCommon } = useTranslation('common')
  const {
    data: weightLogs = [],
    addWeightLog,
    updateWeightLog,
    isAdding,
    isUpdating,
  } = useWeightLogs()

  const editingLog = editId ? weightLogs.find((log) => log.id === editId) : undefined
  const hydratedRef = useRef(false)

  const [weightText, setWeightText] = useState('')
  const [date, setDate] = useState(() => new Date())
  // Coluna `notes` retida no banco: o estado preserva notas existentes ao editar
  // (round-trip), mas o campo não é mais exibido na UI — peso é registro rápido.
  const [notes, setNotes] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (hydratedRef.current) return
    if (!isEditMode) {
      hydratedRef.current = true
      return
    }
    if (!editingLog) return

    setWeightText(editingLog.weight.toFixed(1).replace('.', ','))
    setDate(editingLog.date)
    setNotes(editingLog.notes ?? '')
    hydratedRef.current = true
  }, [editingLog, isEditMode])

  const isPending = isEditMode ? isUpdating : isAdding

  function handleSubmit() {
    const numericWeight = Number(weightText.replace(',', '.'))
    const parsed = weightLogSchema.safeParse({
      weight: Number.isFinite(numericWeight) ? numericWeight : undefined,
      date,
      notes: notes.trim() === '' ? undefined : notes.trim(),
    })

    if (!parsed.success) {
      setErrors(mapValidationErrors(parsed.error.issues, t))
      return
    }

    const input = toWeightLogInput(parsed.data)
    setErrors({})

    if (isEditMode && editId) {
      updateWeightLog(
        { id: editId, input },
        {
          onSuccess: () => router.back(),
          onError: () => showErrorToast(t('addModal.errors.saveFailed')),
        }
      )
      return
    }

    addWeightLog(input, {
      onSuccess: () => router.back(),
      onError: () => showErrorToast(t('addModal.errors.saveFailed')),
    })
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={tCommon('buttons.close')}
        >
          <SymbolView name="xmark" size={18} tintColor={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? t('addModal.titleEdit') : t('addModal.titleAdd')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

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
            label={t('addModal.weightHint')}
            value={weightText}
            onChangeText={(value) => {
              setWeightText(value)
              if (errors.weight) setErrors((current) => ({ ...current, weight: '' }))
            }}
            keyboardType="decimal-pad"
            autoCapitalize="none"
            error={errors.weight}
            testID="weight-input"
          />

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('addModal.dateLabel')}</Text>
            <TouchableOpacity
              onPress={() => setShowPicker((current) => !current)}
              activeOpacity={0.7}
              style={[styles.dateButton, errors.date && styles.dateButtonError]}
              accessibilityRole="button"
              accessibilityLabel={format(date, "d 'de' MMMM yyyy", { locale: ptBR })}
            >
              <Text style={styles.dateButtonText}>
                {format(date, "d 'de' MMMM yyyy", { locale: ptBR })}
              </Text>
              <SymbolView name="chevron.down" size={14} tintColor={colors.textTertiary} />
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="inline"
                maximumDate={new Date()}
                onChange={(_event, selectedDate) => {
                  if (selectedDate) {
                    setDate(selectedDate)
                    if (errors.date) setErrors((current) => ({ ...current, date: '' }))
                  }
                }}
                themeVariant="dark"
                accentColor={colors.brand}
              />
            )}
            {!!errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <AuthButton
            label={isPending ? t('addModal.savingButton') : t('addModal.saveButton')}
            onPress={handleSubmit}
            loading={isPending}
            disabled={isPending}
            accessibilityLabel={t('addModal.saveButton')}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function mapValidationErrors(
  issues: { path: PropertyKey[]; code: string }[],
  t: (key: string) => string
): Record<string, string> {
  const fieldErrors: Record<string, string> = {}

  for (const issue of issues) {
    const field = String(issue.path[0] ?? 'form')
    if (fieldErrors[field]) continue

    if (field === 'weight') {
      fieldErrors[field] = issue.code === 'too_small' || issue.code === 'too_big'
        ? t('addModal.errors.weightRange')
        : t('addModal.errors.invalidWeight')
    } else if (field === 'date') {
      fieldErrors[field] = t('addModal.errors.invalidDate')
    } else {
      fieldErrors[field] = t('addModal.errors.saveFailed')
    }
  }

  return fieldErrors
}

function toWeightLogInput(input: {
  weight: number
  date: Date
  notes?: string | undefined
}): WeightLogInput {
  return {
    weight: input.weight,
    date: input.date,
    ...(input.notes ? { notes: input.notes } : {}),
  }
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
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  headerTitle: {
    ...typography.subtitle,
    flex: 1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  dateButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  dateButtonError: {
    borderWidth: 1,
    borderColor: colors.semanticCritical,
  },
  dateButtonText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  errorText: {
    ...typography.caption,
    color: colors.semanticCritical,
    marginTop: spacing.xxs,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.bgBase,
  },
})
