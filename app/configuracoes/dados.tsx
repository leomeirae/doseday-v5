import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { File, Paths } from 'expo-file-system'
import { useRouter } from 'expo-router'
import * as Sharing from 'expo-sharing'
import { SymbolView } from 'expo-symbols'
import { SettingsFooter } from '@components/settings/SettingsFooter'
import { SettingsGroup } from '@components/settings/SettingsGroup'
import { SettingsHeader } from '@components/settings/SettingsHeader'
import { SettingsRow } from '@components/settings/SettingsRow'
import { SettingsSectionHeader } from '@components/settings/SettingsSectionHeader'
import { useDeleteAccount } from '@hooks/useDeleteAccount'
import { useExportUserData } from '@hooks/useExportUserData'
import { useSession } from '@hooks/useSession'
import { supabase } from '@lib/supabase/client'
import { colors, radius, spacing, typography } from '@lib/theme/tokens'
import { showErrorToast, showSuccessToast } from '@lib/utils/showToast'
import type { Tables } from '../../types/database'

type ConsentHistoryRow = Tables<'consent_history'>

async function getConsentHistory(userId: string): Promise<ConsentHistoryRow[]> {
  const { data, error } = await supabase
    .from('consent_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export default function ConfiguracoesDadosScreen() {
  const router = useRouter()
  const { session } = useSession()
  const userId = session?.user.id
  const exportUserData = useExportUserData(userId)
  const deleteAccount = useDeleteAccount()
  const [consentModalVisible, setConsentModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')

  const { data: consentHistory, isLoading: isConsentLoading } = useQuery({
    queryKey: ['consentHistory', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getConsentHistory(userId)
    },
    enabled: !!userId && consentModalVisible,
  })

  async function handleExportPress() {
    exportUserData.mutate(undefined, {
      onSuccess: async (data) => {
        try {
          const isSharingAvailable = await Sharing.isAvailableAsync()
          if (!isSharingAvailable) {
            showErrorToast('Compartilhamento indisponível neste dispositivo.')
            return
          }

          const file = new File(Paths.cache, `doseday-dados-${formatFileDate(new Date())}.json`)
          file.create({ overwrite: true })
          file.write(JSON.stringify(data, null, 2))

          await Sharing.shareAsync(file.uri, {
            mimeType: 'application/json',
            UTI: 'public.json',
            dialogTitle: 'Exportar meus dados',
          })
          showSuccessToast('Arquivo de dados gerado')
        } catch {
          showErrorToast('Não consegui compartilhar seus dados.')
        }
      },
      onError: () => showErrorToast('Não consegui exportar seus dados.'),
    })
  }

  function handleDeletePress() {
    Alert.alert(
      'Excluir conta?',
      'Você tem certeza? Esta ação é irreversível.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          style: 'destructive',
          onPress: () => {
            setConfirmationText('')
            setDeleteModalVisible(true)
          },
        },
      ]
    )
  }

  function handleFinalDeletePress() {
    deleteAccount.mutate(undefined, {
      onError: () => showErrorToast('Não consegui excluir sua conta.'),
    })
  }

  const canDelete = confirmationText.trim().toUpperCase() === 'EXCLUIR'
  const exportRowValue = exportUserData.isPending ? { value: 'Gerando...' } : {}

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <SettingsHeader
        title="Dados"
        onBack={() => router.back()}
        backAccessibilityLabel="Voltar para Configurações"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SettingsSectionHeader title="LGPD" />
        <SettingsGroup>
          <SettingsRow
            icon="square.and.arrow.up"
            label="Exportar meus dados"
            onPress={handleExportPress}
            accessibilityHint="Gera um arquivo JSON com os seus dados do DoseDay."
            testID="settings-data-export"
            {...exportRowValue}
          />
          <SettingsRow
            icon="checkmark.seal"
            label="Histórico de consentimento"
            divider
            onPress={() => setConsentModalVisible(true)}
            accessibilityHint="Mostra os consentimentos registrados na conta."
            testID="settings-data-consent-history"
          />
        </SettingsGroup>

        <SettingsSectionHeader title="Conta" />
        <SettingsGroup>
          <SettingsRow
            icon="trash"
            label="Excluir minha conta"
            destructive
            chevron={false}
            onPress={handleDeletePress}
            accessibilityHint="Inicia a confirmação para excluir a conta e os dados."
            testID="settings-data-delete-account"
          />
        </SettingsGroup>

        <SettingsFooter />
      </ScrollView>

      <ConsentHistoryModal
        visible={consentModalVisible}
        isLoading={isConsentLoading}
        rows={consentHistory ?? []}
        onClose={() => setConsentModalVisible(false)}
      />

      <DeleteAccountModal
        visible={deleteModalVisible}
        confirmationText={confirmationText}
        isPending={deleteAccount.isPending}
        canDelete={canDelete}
        onChangeText={setConfirmationText}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleFinalDeletePress}
      />
    </SafeAreaView>
  )
}

function ConsentHistoryModal({
  visible,
  isLoading,
  rows,
  onClose,
}: {
  visible: boolean
  isLoading: boolean
  rows: ConsentHistoryRow[]
  onClose: () => void
}) {
  const [closePressed, setClosePressed] = useState(false)

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, styles.modalHeaderTitle]}>
              Histórico de consentimento
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              onPressIn={() => setClosePressed(true)}
              onPressOut={() => setClosePressed(false)}
              style={[styles.iconButton, closePressed && styles.backPressed]}
            >
              <SymbolView name="xmark" size={16} tintColor={colors.textSecondary} />
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="small" color={colors.semanticInfo} />
            </View>
          ) : rows.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum consentimento registrado.</Text>
          ) : (
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {rows.map((row) => (
                <View key={row.id} style={styles.consentRow}>
                  <Text style={styles.consentType}>{formatConsentType(row.consent_type)}</Text>
                  <Text style={styles.consentMeta}>
                    {row.granted ? 'Aceito' : 'Revogado'} · v{row.version}
                  </Text>
                  <Text style={styles.consentDate}>{formatDisplayDate(row.created_at)}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  )
}

function DeleteAccountModal({
  visible,
  confirmationText,
  isPending,
  canDelete,
  onChangeText,
  onCancel,
  onConfirm,
}: {
  visible: boolean
  confirmationText: string
  isPending: boolean
  canDelete: boolean
  onChangeText: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}) {
  const [cancelPressed, setCancelPressed] = useState(false)
  const [confirmPressed, setConfirmPressed] = useState(false)

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Confirmar exclusão</Text>
          <Text style={styles.modalCopy}>
            Digite EXCLUIR para apagar sua conta e seus dados associados.
          </Text>
          <TextInput
            value={confirmationText}
            onChangeText={onChangeText}
            placeholder="EXCLUIR"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="characters"
            autoCorrect={false}
            selectionColor={colors.destructive}
            editable={!isPending}
            style={styles.confirmInput}
            accessibilityLabel="Confirmação de exclusão"
            testID="settings-delete-confirmation-input"
          />

          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              onPressIn={() => setCancelPressed(true)}
              onPressOut={() => setCancelPressed(false)}
              disabled={isPending}
              accessibilityRole="button"
              accessibilityLabel="Cancelar exclusão"
              style={[
                styles.secondaryButton,
                cancelPressed && styles.buttonPressed,
                isPending && styles.disabledButton,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              onPressIn={() => setConfirmPressed(true)}
              onPressOut={() => setConfirmPressed(false)}
              disabled={!canDelete || isPending}
              accessibilityRole="button"
              accessibilityLabel="Excluir conta"
              style={[
                styles.destructiveButton,
                confirmPressed && styles.buttonPressed,
                (!canDelete || isPending) && styles.disabledButton,
              ]}
              testID="settings-delete-final-button"
            >
              {isPending ? (
                <ActivityIndicator size="small" color={colors.textPrimary} />
              ) : (
                <Text style={styles.destructiveButtonText}>Excluir conta</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

function formatFileDate(date: Date): string {
  return date.toISOString().replace(/[:.]/g, '-')
}

function formatConsentType(consentType: string): string {
  const labels: Record<string, string> = {
    terms: 'Termos de uso',
    privacy: 'Política de privacidade',
    data_collection: 'Coleta de dados',
  }
  const label = labels[consentType]
  if (label) return label

  return consentType
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatDisplayDate(value: string | null): string {
  if (!value) return 'Data não registrada'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  backPressed: {
    opacity: 0.65,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.64)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalSheet: {
    backgroundColor: colors.bgElevated,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
    maxHeight: '78%',
    padding: spacing.lg,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  modalHeaderTitle: {
    flex: 1,
  },
  modalCopy: {
    ...typography.body,
    color: colors.textSecondary,
  },
  iconButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  modalLoading: {
    alignItems: 'center',
    minHeight: 96,
    justifyContent: 'center',
  },
  modalList: {
    maxHeight: 360,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  consentRow: {
    borderTopColor: 'rgba(255,255,255,0.06)',
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.xxs,
    paddingVertical: spacing.md,
  },
  consentType: {
    ...typography.body,
    color: colors.textPrimary,
  },
  consentMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  consentDate: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  confirmInput: {
    ...typography.body,
    backgroundColor: colors.bgSurface,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  destructiveButton: {
    alignItems: 'center',
    backgroundColor: colors.destructive,
    borderRadius: radius.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonPressed: {
    opacity: 0.72,
  },
  disabledButton: {
    opacity: 0.42,
  },
  secondaryButtonText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  destructiveButtonText: {
    ...typography.label,
    color: colors.textPrimary,
  },
})
