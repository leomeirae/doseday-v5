import { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { AuthButton } from '@components/ui/AuthButton'
import { SettingsHeader } from '@components/settings/SettingsHeader'
import { TextField } from '@components/ui/TextField'
import { useProfile } from '@hooks/useProfile'
import { useSession } from '@hooks/useSession'
import { useUpdateMedicalContext } from '@hooks/useUpdateProfile'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'
import { showErrorToast, showSuccessToast } from '@lib/utils/showToast'
import type { MedicalSupport } from '@lib/types/onboarding'
import {
  doctorNameSchema,
  medicalSupportSchema,
} from '@lib/validation/onboardingSchemas'

const SUPPORT_ORDER: MedicalSupport[] = ['yes', 'sometimes', 'no']

export default function ConfiguracoesMedicoScreen() {
  const router = useRouter()
  const { t } = useTranslation('onboarding')
  const { session } = useSession()
  const userId = session?.user.id ?? ''
  const { data: profile } = useProfile()
  const updateMedicalContext = useUpdateMedicalContext(userId)

  const [support, setSupport] = useState<MedicalSupport | null>(null)
  const [doctorName, setDoctorName] = useState('')
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [datePressed, setDatePressed] = useState(false)

  useEffect(() => {
    setSupport(profile?.hasMedicalSupport ?? null)
    setDoctorName(profile?.doctorName ?? '')
    setAppointmentDate(
      profile?.nextAppointmentDate ? fromDateOnly(profile.nextAppointmentDate) : null
    )
  }, [profile?.doctorName, profile?.hasMedicalSupport, profile?.nextAppointmentDate])

  const draftDoctorName = doctorName.trim() || null
  const draftAppointmentDate = appointmentDate ? dateOnly(appointmentDate) : null
  const isDirty = profile != null && (
    support !== profile.hasMedicalSupport
    || draftDoctorName !== (profile.doctorName?.trim() || null)
    || draftAppointmentDate !== (profile.nextAppointmentDate ?? null)
  )

  function handleSubmit() {
    const supportParsed = medicalSupportSchema.safeParse({
      has_medical_support: support,
    })
    const doctorParsed = doctorNameSchema.safeParse({
      doctor_name: doctorName,
    })

    if (!supportParsed.success) {
      setError('Selecione uma opção de acompanhamento.')
      return
    }
    if (!doctorParsed.success) {
      setError(doctorParsed.error.issues[0]?.message ?? 'Confira o nome informado.')
      return
    }

    setError(undefined)
    const trimmedName = doctorName.trim()

    updateMedicalContext.mutate(
      {
        hasMedicalSupport: supportParsed.data.has_medical_support,
        doctorName: trimmedName.length > 0 ? trimmedName : null,
        nextAppointmentDate: appointmentDate ? dateOnly(appointmentDate) : null,
      },
      {
        onSuccess: () => {
          showSuccessToast('Acompanhamento salvo')
          router.back()
        },
        onError: () => {
          showErrorToast('Não consegui salvar o acompanhamento.')
        },
      }
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <SettingsHeader
        title="Acompanhamento"
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
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Acompanhamento médico</Text>
            <View accessibilityRole="radiogroup" style={styles.segmented}>
              {SUPPORT_ORDER.map((option, index) => {
                const selected = support === option
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setSupport(option)
                      if (error) setError(undefined)
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={t(`medicalSupport.options.${option}.label`)}
                    accessibilityHint={t(`medicalSupport.options.${option}.caption`)}
                    style={[
                      styles.option,
                      index < SUPPORT_ORDER.length - 1 && styles.optionDivider,
                      selected && styles.optionSelected,
                    ]}
                    testID={`settings-medical-support-${option}`}
                  >
                    <Text
                      style={[styles.optionLabel, selected && styles.optionLabelSelected]}
                      numberOfLines={2}
                    >
                      {t(`medicalSupport.options.${option}.label`)}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
            {support && (
              <Text style={styles.optionCaption}>
                {t(`medicalSupport.options.${support}.caption`)}
              </Text>
            )}
          </View>

          <TextField
            label="Nome do profissional"
            value={doctorName}
            onChangeText={(value) => {
              setDoctorName(value)
              if (error) setError(undefined)
            }}
            placeholder="ex: Dra. Ana Costa"
            testID="settings-doctor-name-input"
          />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Próxima consulta</Text>
            <Pressable
              onPress={() => setShowPicker((current) => !current)}
              onPressIn={() => setDatePressed(true)}
              onPressOut={() => setDatePressed(false)}
              accessibilityRole="button"
              accessibilityLabel="Próxima consulta"
              accessibilityHint="Escolhe a data da próxima consulta."
              style={[styles.dateButton, datePressed && styles.dateButtonPressed]}
              testID="settings-next-appointment-button"
            >
              <Text style={styles.dateButtonText}>
                {appointmentDate
                  ? format(appointmentDate, "d 'de' MMMM yyyy", { locale: ptBR })
                  : 'Sem data definida'}
              </Text>
              <SymbolView name="chevron.down" size={14} tintColor={colors.textTertiary} />
            </Pressable>

            {showPicker && (
              <DateTimePicker
                value={appointmentDate ?? new Date()}
                mode="date"
                display="inline"
                minimumDate={new Date()}
                onChange={(_event, selectedDate) => {
                  if (selectedDate) setAppointmentDate(selectedDate)
                }}
                themeVariant="dark"
                accentColor={colors.semanticInfo}
              />
            )}

            {appointmentDate && (
              <Pressable
                onPress={() => setAppointmentDate(null)}
                accessibilityRole="button"
                accessibilityLabel="Remover próxima consulta"
                style={({ pressed }) => [styles.clearButton, pressed && styles.clearPressed]}
              >
                <Text style={styles.clearText}>Remover data</Text>
              </Pressable>
            )}
          </View>

          {error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>

        <View style={styles.footer}>
          <AuthButton
            label={updateMedicalContext.isPending ? 'Salvando...' : 'Salvar acompanhamento'}
            onPress={handleSubmit}
            loading={updateMedicalContext.isPending}
            disabled={updateMedicalContext.isPending || !isDirty}
            testID="settings-medical-context-submit"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function dateOnly(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fromDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
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
    gap: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  section: {
    gap: spacing.xs,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  segmented: {
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  option: {
    backgroundColor: colors.bgElevated,
    flex: 1,
    justifyContent: 'center',
    minHeight: 60,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  optionDivider: {
    borderRightColor: 'rgba(255,255,255,0.10)',
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  optionSelected: {
    backgroundColor: colors.bgSurface,
  },
  optionLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: colors.semanticInfo,
  },
  optionCaption: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  dateButton: {
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md,
    borderWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  dateButtonPressed: {
    backgroundColor: colors.bgSurface,
  },
  dateButtonText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  clearButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  clearPressed: {
    opacity: 0.65,
  },
  clearText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  error: {
    ...typography.caption,
    color: colors.semanticCritical,
  },
  footer: {
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
})
