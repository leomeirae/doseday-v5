import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Redirect, useLocalSearchParams, useRouter, type Href } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import * as Haptics from 'expo-haptics'
import { AuthButton } from '@components/ui/AuthButton'
import { TextField } from '@components/ui/TextField'
import { useRegisterQuickLog } from '@hooks/useRegisterQuickLog'
import { mapQueryError } from '@lib/supabase/queries/errors'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'
import { showErrorToast, showSuccessToast } from '@lib/utils/showToast'
import {
  INTENSITY_LABELS,
  QUICK_LOG_LABELS,
  QUICK_LOG_TYPES,
  quickLogSchema,
} from '@lib/validation/diarioSchemas'
import type { QuickLogType } from '@lib/validation/diarioSchemas'

type Intensity = 1 | 2 | 3

export default function QuickLogScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ type?: string }>()
  const { mutate, isPending } = useRegisterQuickLog()
  const [intensity, setIntensity] = useState<Intensity>(2)
  const [notes, setNotes] = useState('')

  if (!params.type || params.type === 'other') {
    return <Redirect href={'/diario/anotar-memoria' as Href} />
  }

  const logType = QUICK_LOG_TYPES.includes(params.type as QuickLogType)
    ? (params.type as QuickLogType)
    : 'other'

  function selectIntensity(nextIntensity: Intensity) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setIntensity(nextIntensity)
  }

  function handleSubmit() {
    const parsed = quickLogSchema.safeParse({
      logType,
      intensity,
      notes: notes.trim() === '' ? undefined : notes.trim(),
    })

    if (!parsed.success) return

    mutate(parsed.data, {
      onSuccess: () => {
        showSuccessToast('Registrado')
        router.back()
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
          onPress={() => router.back()}
          hitSlop={13}
          accessibilityLabel="Fechar"
          accessibilityRole="button"
        >
          <SymbolView name="xmark" size={18} tintColor={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Registrar {QUICK_LOG_LABELS[logType]}</Text>
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
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Tipo</Text>
            <View style={styles.readOnly}>
              <Text style={styles.readOnlyText}>{QUICK_LOG_LABELS[logType]}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Intensidade</Text>
            <View style={styles.chips}>
              {([1, 2, 3] as Intensity[]).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => selectIntensity(item)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: intensity === item }}
                  accessibilityLabel={INTENSITY_LABELS[item]}
                  style={({ pressed }) => [
                    styles.chip,
                    intensity === item && styles.chipSelected,
                    pressed && styles.chipPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipLabel,
                      intensity === item && styles.chipLabelSelected,
                    ]}
                  >
                    {INTENSITY_LABELS[item]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <TextField
            label="Observações"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            maxLength={500}
            placeholder="Opcional"
            testID="quick-log-notes-input"
          />
        </ScrollView>

        <View style={styles.footer}>
          <AuthButton
            label="Registrar"
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
  readOnly: {
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md,
    borderWidth: 0.5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  readOnlyText: {
    ...typography.body,
    color: colors.textTertiary,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    borderWidth: 0.5,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipSelected: {
    borderColor: colors.textPrimary,
    borderWidth: 1,
  },
  chipPressed: {
    transform: [{ scale: 0.96 }],
  },
  chipLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  chipLabelSelected: {
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
