import { StyleSheet } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, type Href } from 'expo-router'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { SettingsFooter } from '@components/settings/SettingsFooter'
import { SettingsGroup } from '@components/settings/SettingsGroup'
import { SettingsHeader } from '@components/settings/SettingsHeader'
import { SettingsRow } from '@components/settings/SettingsRow'
import { SettingsSectionHeader } from '@components/settings/SettingsSectionHeader'
import { useProfile } from '@hooks/useProfile'
import { colors, spacing } from '@lib/theme/tokens'
import { formatMedicationName } from '@lib/utils/formatMedicationName'

export default function ConfiguracoesTratamentoScreen() {
  const router = useRouter()
  const { t } = useTranslation('onboarding')
  const { data: profile } = useProfile()

  const medication = profile?.currentMedication
    ? formatMedicationName(profile.currentMedication)
    : 'A definir'
  const dose = profile?.currentDose !== null && profile?.currentDose !== undefined
    ? `${formatNumber(profile.currentDose)} mg`
    : null
  const protocol = profile?.doseFrequencyDays
    ? `${profile.doseFrequencyDays} dias`
    : 'A definir'
  const goalWeight = profile?.goalWeight !== null && profile?.goalWeight !== undefined
    ? `${formatNumber(profile.goalWeight)} kg`
    : 'A definir'
  const support = profile?.hasMedicalSupport
    ? t(`medicalSupport.options.${profile.hasMedicalSupport}.label`)
    : 'A definir'
  const doctor = profile?.doctorName ?? 'Sem nome salvo'
  const concerns = formatConcerns(profile?.mainConcerns?.length ?? 0)
  const appointment = profile?.nextAppointmentDate
    ? format(fromDateOnly(profile.nextAppointmentDate), "d 'de' MMMM", { locale: ptBR })
    : 'Sem data definida'

  function open(route: Href) {
    router.push(route)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <SettingsHeader
        title="Tratamento"
        onBack={() => router.back()}
        backAccessibilityLabel="Voltar para Configurações"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSectionHeader title="Medicamento" />
        <SettingsGroup>
          <SettingsRow
            icon="cross.case"
            label="Medicamento atual"
            value={dose ? `${medication} · ${dose}` : medication}
            stacked
            onPress={() => open('/perfil/protocolo' as Href)}
            accessibilityHint="Edita medicação, dose e intervalo entre aplicações."
            testID="settings-treatment-medication"
          />
          <SettingsRow
            icon="calendar"
            label="Protocolo de dose"
            value={protocol}
            stacked
            divider
            onPress={() => open('/perfil/protocolo' as Href)}
            accessibilityHint="Define o intervalo entre aplicações."
            testID="settings-treatment-protocol"
          />
        </SettingsGroup>

        <SettingsSectionHeader title="Metas" />
        <SettingsGroup>
          <SettingsRow
            icon="scalemass"
            label="Peso meta"
            value={goalWeight}
            stacked
            onPress={() => open('/configuracoes/tratamento/peso-meta' as Href)}
            accessibilityHint="Edita sua meta de peso."
            testID="settings-treatment-goal-weight"
          />
        </SettingsGroup>

        <SettingsSectionHeader title="Acompanhamento" />
        <SettingsGroup>
          <SettingsRow
            icon="person.circle.fill"
            label="Acompanhamento médico"
            value={support}
            stacked
            onPress={() => open('/configuracoes/tratamento/medico' as Href)}
            accessibilityHint="Edita acompanhamento, profissional e próxima consulta."
            testID="settings-treatment-medical-support"
          />
          <SettingsRow
            icon="person.circle.fill"
            label="Profissional"
            value={doctor}
            stacked
            divider
            onPress={() => open('/configuracoes/tratamento/medico' as Href)}
            accessibilityHint="Edita o profissional que acompanha seu tratamento."
            testID="settings-treatment-doctor"
          />
          <SettingsRow
            icon="calendar"
            label="Próxima consulta"
            value={appointment}
            stacked
            divider
            onPress={() => open('/configuracoes/tratamento/medico' as Href)}
            accessibilityHint="Edita a data da próxima consulta."
            testID="settings-treatment-next-appointment"
          />
        </SettingsGroup>

        <SettingsSectionHeader title="Memória clínica" />
        <SettingsGroup>
          <SettingsRow
            icon="doc.text"
            label="Preocupações"
            value={concerns}
            stacked
            chevron={false}
            testID="settings-treatment-concerns"
          />
        </SettingsGroup>

        <SettingsFooter />
      </ScrollView>
    </SafeAreaView>
  )
}

function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 1,
  })
}

function formatConcerns(count: number): string {
  if (count === 0) return 'Nenhuma selecionada'
  if (count === 1) return '1 selecionada'
  return `${count} selecionadas`
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
})
