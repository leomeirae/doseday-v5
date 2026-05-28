import { useRef, useState } from 'react'
import {
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
import { useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { AuthButton } from '@components/ui/AuthButton'
import { useFrequentSymptoms } from '@hooks/useFrequentSymptoms'
import { useRegisterSymptom } from '@hooks/useRegisterSymptom'
import { mapQueryError } from '@lib/supabase/queries/errors'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'
import { showErrorToast, showSuccessToast } from '@lib/utils/showToast'
import { symptomNoteSchema } from '@lib/validation/diarioSchemas'

const NOTES_MAX_LENGTH = 500

const SYMPTOM_LABELS: Record<string, string> = {
  constipation: 'Constipação',
  diarrhea: 'Diarreia',
  fatigue: 'Cansaço',
  headache: 'Dor de cabeça',
  heartburn: 'Azia',
  injection_pain: 'Dor na injeção',
  nausea: 'Náusea',
  vomiting: 'Vômito',
}

function labelFor(type: string): string {
  return SYMPTOM_LABELS[type] ?? type
}

export default function AnotarSintomaScreen() {
  const router = useRouter()
  const { mutate, isPending } = useRegisterSymptom()
  const frequentSymptoms = useFrequentSymptoms()
  const inputRef = useRef<TextInput | null>(null)
  const [text, setText] = useState('')

  const trimmed = text.trim()
  const canSubmit = trimmed.length > 0 && !isPending
  const frequent = frequentSymptoms.data ?? []

  function dismiss() {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/')
    }
  }

  function insertChip(type: string) {
    const label = labelFor(type)
    const needsSpace = text.length > 0 && !text.endsWith(' ') && !text.endsWith('\n')
    const next = `${text}${needsSpace ? ' ' : ''}${label.toLowerCase()} `
    setText(next)
    inputRef.current?.focus()
  }

  function handleSubmit() {
    const parsed = symptomNoteSchema.safeParse({ rawText: trimmed })
    if (!parsed.success) return

    mutate(parsed.data, {
      onSuccess: () => {
        showSuccessToast('Sintoma anotado')
        dismiss()
      },
      onError: (err) => {
        showErrorToast(mapQueryError(err))
      },
    })
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={dismiss}
          hitSlop={13}
          accessibilityLabel="Fechar"
          accessibilityRole="button"
        >
          <SymbolView name="xmark" size={18} tintColor={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Anotar sintoma</Text>
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
        >
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={6}
            maxLength={NOTES_MAX_LENGTH}
            placeholder="ex: náusea leve depois do almoço · azia ao deitar"
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.brand}
            autoCapitalize="sentences"
            autoCorrect
            textAlignVertical="top"
            accessibilityLabel="Descrição do sintoma"
            testID="anotar-sintoma-input"
            style={styles.textarea}
          />

          {frequent.length > 0 ? (
            <View style={styles.frequent}>
              <Text style={styles.frequentLabel}>Frequentes</Text>
              <View style={styles.chipRow}>
                {frequent.map((item) => (
                  <Pressable
                    key={item.type}
                    onPress={() => insertChip(item.type)}
                    accessibilityRole="button"
                    accessibilityLabel={`Inserir ${labelFor(item.type)}`}
                    style={styles.chip}
                    testID={`anotar-sintoma-chip-${item.type}`}
                  >
                    <Text style={styles.chipLabel}>{labelFor(item.type)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <AuthButton
            label="Anotar"
            onPress={handleSubmit}
            loading={isPending}
            disabled={!canSubmit}
            testID="anotar-sintoma-submit"
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
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  textarea: {
    ...typography.body,
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md,
    borderWidth: 0.5,
    color: colors.textPrimary,
    minHeight: 140,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  frequent: {
    gap: spacing.sm,
  },
  frequentLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    borderWidth: 0.5,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipLabel: {
    ...typography.label,
    color: colors.textPrimary,
  },
  footer: {
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
})
