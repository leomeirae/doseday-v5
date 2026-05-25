import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { AuthButton } from '@components/ui/AuthButton'
import { useRegisterMemoryNote } from '@hooks/useRegisterMemoryNote'
import { mapQueryError } from '@lib/supabase/queries/errors'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'
import { showErrorToast, showSuccessToast } from '@lib/utils/showToast'
import { memoryNoteSchema } from '@lib/validation/diarioSchemas'

const NOTES_MAX_LENGTH = 500

export default function AnotarMemoriaScreen() {
  const router = useRouter()
  const { mutate, isPending } = useRegisterMemoryNote()
  const [notes, setNotes] = useState('')

  const trimmed = notes.trim()
  const canSubmit = trimmed.length > 0 && !isPending

  function dismiss() {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/')
    }
  }

  function handleSubmit() {
    const parsed = memoryNoteSchema.safeParse({ notes: trimmed })
    if (!parsed.success) return

    mutate(parsed.data, {
      onSuccess: () => {
        showSuccessToast('Memória registrada')
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
        <Text style={styles.headerTitle}>Anotar memória</Text>
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
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={8}
            maxLength={NOTES_MAX_LENGTH}
            placeholder="Anote uma lembrança, observação ou item para a próxima consulta."
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.brand}
            autoCapitalize="sentences"
            autoCorrect
            textAlignVertical="top"
            accessibilityLabel="Anotar memória"
            testID="anotar-memoria-input"
            style={styles.textarea}
          />
        </ScrollView>

        <View style={styles.footer}>
          <AuthButton
            label="Registrar"
            onPress={handleSubmit}
            loading={isPending}
            disabled={!canSubmit}
            testID="anotar-memoria-submit"
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
  },
  textarea: {
    ...typography.body,
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md,
    borderWidth: 0.5,
    color: colors.textPrimary,
    minHeight: 200,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  footer: {
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
})
