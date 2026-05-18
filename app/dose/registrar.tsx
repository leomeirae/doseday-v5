import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Pressable,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import DateTimePicker from '@react-native-community/datetimepicker'
import * as Haptics from 'expo-haptics'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'
import { TextField } from '@components/ui/TextField'
import { AuthButton } from '@components/auth/AuthButton'
import { useProfile } from '@hooks/useProfile'
import { useRegisterDose } from '@hooks/useRegisterDose'
import { showSuccessToast, showErrorToast } from '@lib/utils/showToast'
import { mapQueryError } from '@lib/supabase/queries/errors'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatMedicationName } from '@lib/utils/formatMedicationName'
import {
  registerDoseSchema,
  INJECTION_SITES,
  INJECTION_SITE_LABELS,
  SIDE_EFFECTS,
  SIDE_EFFECT_LABELS,
} from '@lib/validation/doseSchemas'
import type { InjectionSite, SideEffect } from '@lib/validation/doseSchemas'

export default function RegistrarDoseScreen() {
  const router = useRouter()
  const { data: profile } = useProfile()
  const { mutate, isPending } = useRegisterDose()

  const [doseText, setDoseText] = useState('')
  const [applicationDate, setApplicationDate] = useState(() => new Date())
  const [injectionSite, setInjectionSite] = useState<InjectionSite | undefined>(undefined)
  const [sideEffects, setSideEffects] = useState<SideEffect[]>([])
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPicker, setShowPicker] = useState(false)
  const autoFilledRef = useRef(false)

  useEffect(() => {
    if (autoFilledRef.current || profile?.currentDose == null) return
    setDoseText(String(profile.currentDose))
    autoFilledRef.current = true
  }, [profile?.currentDose])

  const hasMedication = !!profile?.currentMedication

  function toggleSideEffect(effect: SideEffect) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSideEffects((prev) =>
      prev.includes(effect) ? prev.filter((e) => e !== effect) : [...prev, effect]
    )
  }

  function selectInjectionSite(site: InjectionSite) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setInjectionSite((prev) => (prev === site ? undefined : site))
  }

  function handleSubmit() {
    const parsed = registerDoseSchema.safeParse({
      dose: doseText === '' ? undefined : parseFloat(doseText),
      applicationDate,
      injectionSite,
      sideEffects,
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
    mutate(parsed.data, {
      onSuccess: () => {
        showSuccessToast('Dose registrada')
        router.back()
      },
      onError: (err) => {
        showErrorToast(mapQueryError(err))
      },
    })
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityLabel="Fechar"
          accessibilityRole="button"
        >
          <SymbolView name="xmark" size={18} tintColor={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Registrar dose</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Medicamento (read-only) */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Medicamento</Text>
            <View style={styles.readOnlyField}>
              <Text
                style={[
                  styles.readOnlyText,
                  !hasMedication && styles.readOnlyTextDim,
                ]}
              >
                {hasMedication
                  ? formatMedicationName(profile.currentMedication!)
                  : 'Defina seu medicamento no perfil'}
              </Text>
            </View>
          </View>

          {/* Dose */}
          <TextField
            label="Dose (mg)"
            value={doseText}
            onChangeText={(v) => {
              setDoseText(v)
              if (errors.dose) setErrors((e) => ({ ...e, dose: '' }))
            }}
            keyboardType="decimal-pad"
            autoCapitalize="none"
            placeholder="ex: 5"
            error={errors.dose}
            testID="dose-input"
          />

          {/* Quando */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Quando</Text>
            <TouchableOpacity
              onPress={() => setShowPicker((v) => !v)}
              activeOpacity={0.7}
              style={styles.dateButton}
              accessibilityLabel={`Data selecionada: ${format(applicationDate, "d 'de' MMM 'às' HH:mm", { locale: ptBR })}`}
              accessibilityRole="button"
            >
              <Text style={styles.dateButtonText}>
                {format(applicationDate, "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
              </Text>
              <SymbolView name="chevron.down" size={14} tintColor={colors.textTertiary} />
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                value={applicationDate}
                mode="datetime"
                display="inline"
                maximumDate={new Date()}
                onChange={(_event, date) => {
                  if (date) setApplicationDate(date)
                }}
                themeVariant="dark"
                accentColor={colors.brand}
              />
            )}
            {!!errors.applicationDate && (
              <Text style={styles.errorText}>{errors.applicationDate}</Text>
            )}
          </View>

          {/* Local da aplicação */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Local da aplicação</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {INJECTION_SITES.map((site) => (
                <Chip
                  key={site}
                  label={INJECTION_SITE_LABELS[site]}
                  selected={injectionSite === site}
                  onPress={() => selectInjectionSite(site)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Efeitos colaterais */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Efeitos colaterais</Text>
            <View style={styles.chipsWrap}>
              {SIDE_EFFECTS.map((effect) => (
                <Chip
                  key={effect}
                  label={SIDE_EFFECT_LABELS[effect]}
                  selected={sideEffects.includes(effect)}
                  onPress={() => toggleSideEffect(effect)}
                />
              ))}
            </View>
          </View>

          {/* Observações */}
          <TextField
            label="Observações"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            maxLength={500}
            placeholder="Opcional"
            error={errors.notes}
            testID="notes-input"
          />
        </ScrollView>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <AuthButton
            label="Registrar dose"
            onPress={handleSubmit}
            loading={isPending}
            disabled={!hasMedication || isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
      ]}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 18,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  readOnlyField: {
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  readOnlyText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  readOnlyTextDim: {
    color: colors.textSecondary,
  },
  dateButton: {
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  chips: {
    gap: spacing.xs,
    paddingRight: spacing.lg,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.bgElevated,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chipSelected: {
    borderColor: colors.brand,
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
})
