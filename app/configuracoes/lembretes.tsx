import { useState } from 'react'
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import DateTimePicker from '@react-native-community/datetimepicker'
import { SettingsFooter } from '@components/settings/SettingsFooter'
import { SettingsGroup } from '@components/settings/SettingsGroup'
import { SettingsHeader } from '@components/settings/SettingsHeader'
import { SettingsSectionHeader } from '@components/settings/SettingsSectionHeader'
import { useNotifications } from '@hooks/useNotifications'
import { useSession } from '@hooks/useSession'
import { requestPermissions } from '@lib/notifications'
import { supabase } from '@lib/supabase/client'
import { colors, spacing, typography } from '@lib/theme/tokens'
import { showErrorToast, showSuccessToast } from '@lib/utils/showToast'

type UserSettings = {
  notificationsEnabled: boolean
  notificationTime: string
}

async function getUserSettings(userId: string): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('notifications_enabled, notification_time')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error

  return {
    notificationsEnabled: data?.notifications_enabled ?? true,
    notificationTime: (data?.notification_time ?? '20:00:00').slice(0, 5),
  }
}

async function saveUserSettings(userId: string, settings: UserSettings): Promise<void> {
  const { error } = await supabase.from('user_settings').upsert(
    {
      user_id: userId,
      notifications_enabled: settings.notificationsEnabled,
      notification_time: toDbTime(settings.notificationTime),
    },
    { onConflict: 'user_id' }
  )
  if (error) throw error
}

export default function ConfiguracoesLembretesScreen() {
  const router = useRouter()
  const { session } = useSession()
  const userId = session?.user.id
  const queryClient = useQueryClient()
  const { permissionStatus, recheckPermission } = useNotifications()
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [permissionPressed, setPermissionPressed] = useState(false)
  const [timePressed, setTimePressed] = useState(false)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['userSettings', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getUserSettings(userId)
    },
    enabled: !!userId,
  })

  const updateSettings = useMutation({
    mutationFn: (nextSettings: UserSettings) => {
      if (!userId) throw new Error('No user')
      return saveUserSettings(userId, nextSettings)
    },
    onMutate: async (nextSettings) => {
      await queryClient.cancelQueries({ queryKey: ['userSettings', userId] })
      const previous = queryClient.getQueryData<UserSettings>(['userSettings', userId])
      queryClient.setQueryData<UserSettings>(['userSettings', userId], nextSettings)
      return { previous }
    },
    onError: (_error, _settings, context) => {
      queryClient.setQueryData(['userSettings', userId], context?.previous)
      showErrorToast('Não consegui salvar o lembrete.')
    },
    onSuccess: () => {
      showSuccessToast('Lembrete salvo')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings', userId] })
    },
  })

  async function handlePermissionPress() {
    if (permissionStatus === 'denied') {
      await Linking.openSettings()
      return
    }

    if (permissionStatus === 'undetermined') {
      await requestPermissions()
      await recheckPermission()
    }
  }

  function handleToggle(enabled: boolean) {
    updateSettings.mutate({
      notificationsEnabled: enabled,
      notificationTime: settings?.notificationTime ?? '20:00',
    })
  }

  function handleTimeChange(date: Date) {
    updateSettings.mutate({
      notificationsEnabled: settings?.notificationsEnabled ?? true,
      notificationTime: dateToDisplayTime(date),
    })
  }

  const currentSettings = settings ?? {
    notificationsEnabled: true,
    notificationTime: '20:00',
  }
  const permissionLabel = getPermissionLabel(permissionStatus)

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <SettingsHeader
        title="Lembretes"
        onBack={() => router.back()}
        backAccessibilityLabel="Voltar para Configurações"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSectionHeader title="Permissão" />
        <SettingsGroup>
          <Pressable
            onPress={handlePermissionPress}
            disabled={permissionStatus === 'granted'}
            accessibilityRole={permissionStatus === 'granted' ? undefined : 'button'}
            accessibilityLabel="Permissão de notificações"
            accessibilityHint={
              permissionStatus === 'denied'
                ? 'Abre os Ajustes do iOS.'
                : permissionStatus === 'undetermined'
                  ? 'Solicita permissão para enviar lembretes.'
                  : undefined
            }
            onPressIn={() => setPermissionPressed(true)}
            onPressOut={() => setPermissionPressed(false)}
            style={[
              styles.row,
              permissionStatus !== 'granted' && permissionPressed && styles.rowPressed,
            ]}
          >
            <SymbolView name="bell.fill" size={20} tintColor={colors.textSecondary} />
            <Text style={styles.rowLabel}>Notificações</Text>
            <View style={styles.spacer} />
            <Text style={[styles.rowValue, { color: permissionLabel.color }]}>
              {permissionLabel.label}
            </Text>
            {permissionStatus !== 'granted' && (
              <SymbolView name="chevron.right" size={14} tintColor={colors.textTertiary} />
            )}
          </Pressable>
        </SettingsGroup>

        <SettingsSectionHeader title="Dose" />
        <SettingsGroup>
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.semanticInfo} />
            </View>
          ) : (
            <>
              <View style={styles.row}>
                <SymbolView name="bell.badge.fill" size={20} tintColor={colors.textSecondary} />
                <View style={styles.rowCopy}>
                  <Text style={styles.rowLabel}>Notificações de dose</Text>
                  <Text style={styles.rowHint}>
                    Você recebe um lembrete um dia antes da próxima dose.
                  </Text>
                </View>
                <Switch
                  value={currentSettings.notificationsEnabled}
                  onValueChange={handleToggle}
                  disabled={updateSettings.isPending}
                  trackColor={{ false: colors.bgSurface, true: colors.semanticInfo }}
                  thumbColor={colors.textPrimary}
                  ios_backgroundColor={colors.bgSurface}
                  accessibilityRole="switch"
                  accessibilityLabel="Notificações de dose"
                />
              </View>

              <View style={styles.divider} />

              <Pressable
                onPress={() => setShowTimePicker((current) => !current)}
                accessibilityRole="button"
                accessibilityLabel="Horário da notificação"
                accessibilityHint="Escolhe o horário do lembrete."
                onPressIn={() => setTimePressed(true)}
                onPressOut={() => setTimePressed(false)}
                style={[styles.row, timePressed && styles.rowPressed]}
                testID="settings-notification-time"
              >
                <SymbolView name="clock" size={20} tintColor={colors.textSecondary} />
                <Text style={styles.rowLabel}>Horário da notificação</Text>
                <View style={styles.spacer} />
                <Text style={styles.rowValue}>{currentSettings.notificationTime}</Text>
                <SymbolView name="chevron.down" size={14} tintColor={colors.textTertiary} />
              </Pressable>

              {showTimePicker && (
                <DateTimePicker
                  value={timeToDate(currentSettings.notificationTime)}
                  mode="time"
                  display="spinner"
                  onChange={(_event, selectedDate) => {
                    if (selectedDate) handleTimeChange(selectedDate)
                  }}
                  themeVariant="dark"
                  accentColor={colors.semanticInfo}
                />
              )}
            </>
          )}
        </SettingsGroup>

        <SettingsFooter />
      </ScrollView>
    </SafeAreaView>
  )
}

function getPermissionLabel(status: 'granted' | 'denied' | 'undetermined'): {
  label: string
  color: string
} {
  if (status === 'granted') {
    return { label: 'Ativas', color: colors.semanticInfo }
  }
  if (status === 'denied') {
    return { label: 'Bloqueadas', color: colors.semanticWarning }
  }
  return { label: 'Não configurado', color: colors.textTertiary }
}

function toDbTime(displayTime: string): string {
  return displayTime.length === 5 ? `${displayTime}:00` : displayTime
}

function timeToDate(displayTime: string): Date {
  const [hours, minutes] = displayTime.split(':').map(Number)
  const date = new Date()
  date.setHours(hours ?? 20, minutes ?? 0, 0, 0)
  return date
}

function dateToDisplayTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
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
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowPressed: {
    backgroundColor: colors.bgSurface,
  },
  rowCopy: {
    flex: 1,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  rowHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  rowValue: {
    ...typography.body,
    color: colors.textSecondary,
  },
  spacer: {
    flex: 1,
  },
  divider: {
    borderTopColor: 'rgba(255,255,255,0.06)',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  loadingRow: {
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
})
