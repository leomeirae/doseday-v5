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
import { useTranslation } from 'react-i18next'
import { NumericInput } from '@components/onboarding/NumericInput'
import { SelectionCard } from '@components/onboarding/SelectionCard'
import { SettingsHeader } from '@components/settings/SettingsHeader'
import { AuthButton } from '@components/ui/AuthButton'
import { useProfile } from '@hooks/useProfile'
import { useSession } from '@hooks/useSession'
import { useUpdateDoseProtocol } from '@hooks/useUpdateProfile'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'
import {
  COMMON_DOSES,
  MEDICATION_OPTIONS,
  type OnboardingMedication,
} from '@lib/types/onboarding'
import { formatMedicationName } from '@lib/utils/formatMedicationName'
import { showSuccessToast } from '@lib/utils/showToast'

const SUGGESTED_INTERVALS = [1, 7, 10, 14] as const
const MAX_DOSE_MG = 20

// Normaliza o valor do banco pra uma opção conhecida do enum. Dados legados da V4
// podem ter sufixo (ex: "Mounjaro (Tirzepatida)") — formatMedicationName resolve.
function toMedicationOption(value: string | null): OnboardingMedication | null {
  if (value === null) return null
  const normalized = formatMedicationName(value)
  return MEDICATION_OPTIONS.includes(normalized as OnboardingMedication)
    ? (normalized as OnboardingMedication)
    : null
}

export default function DoseProtocolScreen() {
  const router = useRouter()
  const { t } = useTranslation('onboarding')
  const { session } = useSession()
  const { data: profile } = useProfile()
  const updateDoseProtocol = useUpdateDoseProtocol(session?.user?.id ?? '')

  const [medication, setMedication] = useState<OnboardingMedication | null>(null)
  const [doseText, setDoseText] = useState('')
  const [daysText, setDaysText] = useState('')

  const savedMedication = toMedicationOption(profile?.currentMedication ?? null)
  const savedDose = profile?.currentDose ?? null
  const savedDays = profile?.doseFrequencyDays ?? null

  // Hidratação por campo: só preenche valores existentes (não apaga o que o usuário digitou).
  useEffect(() => {
    if (savedMedication !== null) setMedication(savedMedication)
  }, [savedMedication])

  useEffect(() => {
    if (profile?.currentDose != null) setDoseText(String(profile.currentDose))
  }, [profile?.currentDose])

  useEffect(() => {
    if (profile?.doseFrequencyDays != null) setDaysText(String(profile.doseFrequencyDays))
  }, [profile?.doseFrequencyDays])

  // --- Dose: vazio = null ("a definir"); preenchida = positiva até 20 mg ---
  const parsedDose = useMemo(() => {
    if (doseText.trim() === '') return null
    const value = Number(doseText.trim().replace(',', '.'))
    return Number.isFinite(value) ? value : null
  }, [doseText])

  const doseInvalid =
    doseText.trim() !== '' &&
    (parsedDose === null || parsedDose <= 0 || parsedDose > MAX_DOSE_MG)

  // --- Frequência: vazio = null ("configurar depois"); preenchida = inteiro 1-90 ---
  const parsedDays = useMemo(() => {
    if (daysText.trim() === '') return null
    const value = Number(daysText.trim())
    return Number.isInteger(value) ? value : null
  }, [daysText])

  const daysInvalid =
    daysText.trim() !== '' && (parsedDays === null || parsedDays < 1 || parsedDays > 90)

  const isValid = !doseInvalid && !daysInvalid
  const isDirty =
    medication !== savedMedication ||
    (doseInvalid ? false : parsedDose !== savedDose) ||
    (daysInvalid ? false : parsedDays !== savedDays)
  const isBlocked = updateDoseProtocol.isPending || !session?.user?.id

  const commonDoses = medication ? COMMON_DOSES[medication] : []

  // Copy por status: quem ainda não começou vê "dose inicial", não "dose atual".
  const treatmentStatus = profile?.treatmentStatus
  const doseLabel =
    treatmentStatus === 'planning' || treatmentStatus === 'starting'
      ? 'Dose inicial'
      : 'Dose atual'

  function selectMedication(option: OnboardingMedication) {
    // Trocar de medicação limpa a dose — doses não são equivalentes entre medicações.
    if (option !== medication && doseText.trim() !== '') {
      setDoseText('')
    }
    setMedication(option)
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back()
      return
    }

    router.replace('/(tabs)/perfil' as Href)
  }

  function handleSave() {
    if (!session?.user?.id) return

    if (doseInvalid) {
      Alert.alert('', `Informe uma dose entre 0 e ${MAX_DOSE_MG} mg ou deixe em branco.`)
      return
    }

    if (daysInvalid) {
      Alert.alert('', 'Informe um intervalo entre 1 e 90 dias ou deixe em branco.')
      return
    }

    // Se o usuário não mexeu na medicação, preserva o valor original do banco
    // (dados legados podem ter nomes fora do enum, ex: "Mounjaro (Tirzepatida)").
    const medicationToSave =
      medication !== savedMedication ? medication : (profile?.currentMedication ?? null)

    updateDoseProtocol.mutate(
      {
        currentMedication: medicationToSave,
        currentDose: parsedDose,
        doseFrequencyDays: parsedDays,
      },
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
        title="Medicação e protocolo"
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
          {/* --- Medicamento --- */}
          <Text style={styles.title}>Medicamento</Text>
          <Text style={styles.description}>
            A medicação que você usa ou vai usar no tratamento.
          </Text>
          <View style={styles.options} accessibilityRole="radiogroup">
            {MEDICATION_OPTIONS.map((option) => (
              <SelectionCard
                key={option}
                title={t(`medication.options.${option}.label`)}
                caption={t(`medication.options.${option}.caption`)}
                selected={medication === option}
                onPress={() => selectMedication(option)}
                accessibilityLabel={t(`medication.options.${option}.label`)}
                accessibilityHint={t(`medication.options.${option}.caption`)}
                testID={`protocolo-medication-${option}`}
              />
            ))}
          </View>

          <View style={styles.sectionDivider} />

          {/* --- Dose --- */}
          <Text style={styles.title}>{doseLabel}</Text>
          <Text style={styles.description}>
            Se ainda não souber, deixe em branco — dá pra completar depois.
          </Text>
          <NumericInput
            label={doseLabel}
            suffix="mg"
            value={doseText}
            onChangeText={setDoseText}
            error={
              doseInvalid ? `Use um valor entre 0 e ${MAX_DOSE_MG} mg.` : undefined
            }
            placeholder="ex: 5"
            testID="protocolo-dose-input"
          />
          {commonDoses.length > 0 && medication ? (
            <View style={styles.doseChipsGroup}>
              <Text style={styles.fieldLabel}>Doses comuns de {medication}</Text>
              <View style={styles.chips} accessibilityRole="radiogroup">
                {commonDoses.map((dose) => {
                  const selected = parsedDose === dose
                  return (
                    <Pressable
                      key={dose}
                      onPress={() => setDoseText(String(dose))}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`${dose} mg`}
                      testID={`protocolo-dose-common-${dose}`}
                      style={[styles.chip, selected && styles.chipSelected]}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {String(dose).replace('.', ',')} mg
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          ) : null}

          <View style={styles.sectionDivider} />

          {/* --- Intervalo entre aplicações --- */}
          <Text style={styles.title}>Intervalo entre aplicações</Text>
          <Text style={styles.description}>
            Defina o intervalo combinado com quem te acompanha ou o intervalo que você está
            seguindo. O DoseDay usa esse dado para calcular a próxima dose. Se ainda não
            souber, deixe em branco.
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
              testID="protocolo-frequency-input"
            />
            <Text style={styles.inputSuffix}>dias</Text>
          </View>

          {daysInvalid && (
            <Text style={styles.errorText}>Use um número inteiro entre 1 e 90.</Text>
          )}

          <View style={styles.note}>
            <Text style={styles.noteText}>
              Se o protocolo mudar, edite aqui. O histórico anterior continua preservado.
            </Text>
          </View>

          <AuthButton
            label={updateDoseProtocol.isPending ? 'Salvando...' : 'Salvar'}
            onPress={handleSave}
            disabled={isBlocked || !isDirty || !isValid}
            accessibilityLabel="Salvar medicação e protocolo"
            testID="protocolo-save"
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
  options: {
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: spacing.xl,
  },
  doseChipsGroup: {
    gap: spacing.xs,
    marginTop: spacing.md,
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
    justifyContent: 'center',
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
