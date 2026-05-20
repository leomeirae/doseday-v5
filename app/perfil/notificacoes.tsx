import { useEffect, useState } from 'react'
import {
  Linking,
  View,
  Text,
  Switch,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@hooks/useSession'
import {
  getPermissionStatus,
  requestPermissions,
  scheduleTestNotification,
  getAllScheduledDoseNotifications,
  type NotificationPermissionStatus,
} from '@lib/notifications'
import { supabase } from '@lib/supabase/client'
import { colors, typography, spacing, radius } from '@lib/theme/tokens'
import { showSuccessToast } from '@lib/utils/showToast'

async function getUserSettings(userId: string) {
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

function toDbTime(displayTime: string): string {
  return displayTime.length === 5 ? `${displayTime}:00` : displayTime
}

async function setNotificationsEnabled(
  userId: string,
  enabled: boolean,
  notificationTime: string
): Promise<void> {
  const { error } = await supabase.from('user_settings').upsert(
    {
      user_id: userId,
      notifications_enabled: enabled,
      notification_time: toDbTime(notificationTime),
    },
    { onConflict: 'user_id' }
  )
  if (error) throw error
}

export default function NotificacoesScreen() {
  const router = useRouter()
  const { session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()

  const [permStatus, setPermStatus] = useState<NotificationPermissionStatus>('undetermined')
  const [nextNotifDate, setNextNotifDate] = useState<Date | null>(null)
  const [testLoading, setTestLoading] = useState(false)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['userSettings', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getUserSettings(userId)
    },
    enabled: !!userId,
  })

  useEffect(() => {
    getPermissionStatus().then(setPermStatus)
    getAllScheduledDoseNotifications().then((triggers) => {
      // DATE trigger has a `date` field
      const dateTriggers = triggers as unknown as { date: number }[]
      if (dateTriggers.length > 0 && dateTriggers[0].date) {
        setNextNotifDate(new Date(dateTriggers[0].date))
      }
    })
  }, [])

  const { mutate: toggleEnabled } = useMutation({
    mutationFn: (enabled: boolean) => {
      if (!userId) throw new Error('No user')
      return setNotificationsEnabled(userId, enabled, settings?.notificationTime ?? '20:00')
    },
    onMutate: async (enabled) => {
      await queryClient.cancelQueries({ queryKey: ['userSettings', userId] })
      queryClient.setQueryData(['userSettings', userId], (old: typeof settings) =>
        old ? { ...old, notificationsEnabled: enabled } : old
      )
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings', userId] })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings', userId] })
    },
  })

  async function handlePermissionPress() {
    if (permStatus === 'denied') {
      await Linking.openSettings()
      return
    }

    if (permStatus === 'undetermined') {
      const status = await requestPermissions()
      setPermStatus(status)
    }
  }

  async function handleTestNotification() {
    if (permStatus !== 'granted') return
    setTestLoading(true)
    try {
      await scheduleTestNotification()
      showSuccessToast('Notificação de teste em 5 segundos')
    } finally {
      setTestLoading(false)
    }
  }

  const permLabel =
    permStatus === 'granted'
      ? 'Ativas'
      : permStatus === 'denied'
        ? 'Bloqueadas'
        : 'Não configurado'

  const permColor =
    permStatus === 'granted'
      ? colors.semanticPositive
      : permStatus === 'denied'
        ? colors.semanticCritical
        : colors.textTertiary

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <SymbolView name="chevron.left" size={18} tintColor={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status card */}
        <Pressable
          style={({ pressed }) => [
            styles.card,
            permStatus !== 'granted' && pressed && styles.pressed,
          ]}
          onPress={handlePermissionPress}
          disabled={permStatus === 'granted'}
          accessibilityRole={permStatus === 'granted' ? undefined : 'button'}
          accessibilityLabel="Permissão de notificações"
          accessibilityHint={
            permStatus === 'denied'
              ? 'Abre os Ajustes do iOS para reativar notificações'
              : permStatus === 'undetermined'
                ? 'Solicita permissão para enviar lembretes de dose'
                : undefined
          }
        >
          <Text style={styles.cardLabel}>STATUS</Text>
          <View style={styles.cardRow}>
            <View style={styles.cardRowTextWrap}>
              <Text style={styles.cardRowLabel}>Permissão</Text>
              {permStatus !== 'granted' && (
                <Text style={styles.cardRowHint}>
                  {permStatus === 'denied'
                    ? 'Toque para abrir os Ajustes'
                    : 'Toque para ativar lembretes'}
                </Text>
              )}
            </View>
            <View style={styles.cardRowTrailing}>
              <Text style={[styles.cardRowValue, { color: permColor }]}>{permLabel}</Text>
              {permStatus !== 'granted' && (
                <SymbolView
                  name="chevron.right"
                  size={14}
                  tintColor={colors.textTertiary}
                />
              )}
            </View>
          </View>
        </Pressable>

        {/* Toggle master switch */}
        {isLoading ? (
          <View style={styles.card}>
            <ActivityIndicator size="small" color={colors.semanticInfo} />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>LEMBRETES</Text>
            <View style={styles.cardRow}>
              <View style={styles.cardRowTextWrap}>
                <Text style={styles.cardRowLabel}>Lembretes de dose</Text>
                <Text style={styles.cardRowHint}>Receber lembrete no horário configurado</Text>
              </View>
              <Switch
                value={settings?.notificationsEnabled ?? true}
                onValueChange={(val) => toggleEnabled(val)}
                trackColor={{ false: colors.bgSurface, true: colors.semanticInfo }}
                thumbColor={colors.textPrimary}
                ios_backgroundColor={colors.bgSurface}
                accessibilityRole="switch"
                accessibilityLabel="Lembretes de dose"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.cardRow}>
              <Text style={styles.cardRowLabel}>Horário</Text>
              <Text style={styles.cardRowValue}>{settings?.notificationTime ?? '20:00'}</Text>
            </View>
          </View>
        )}

        {/* Next notification */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>PRÓXIMO LEMBRETE</Text>
          <Text style={styles.nextNotifText}>
            {nextNotifDate
              ? nextNotifDate.toLocaleString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Nenhum agendado'}
          </Text>
        </View>

        {/* Test notification */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>TESTE</Text>
          <Text style={styles.cardRowHint}>
            Envia uma notificação local em 5 segundos para confirmar que o lembrete chega.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.testButton,
              permStatus !== 'granted' && styles.testButtonDisabled,
              pressed && permStatus === 'granted' && styles.pressed,
            ]}
            onPress={handleTestNotification}
            disabled={testLoading || permStatus !== 'granted'}
            accessibilityRole="button"
            accessibilityLabel="Testar notificação"
            accessibilityHint="Agenda uma notificação de teste para daqui a 5 segundos"
          >
            {testLoading ? (
              <ActivityIndicator size="small" color={colors.semanticInfo} />
            ) : (
              <>
                <SymbolView name="bell.fill" size={16} tintColor={colors.semanticInfo} />
                <Text style={styles.testButtonLabel}>Testar notificação</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const { bgBase, bgElevated, textPrimary, textSecondary, textTertiary, semanticInfo } = colors

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: bgBase },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: { ...typography.title, color: textPrimary },
  headerSpacer: { width: 18 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  card: {
    backgroundColor: bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardLabel: {
    ...typography.caption,
    color: textTertiary,
    letterSpacing: 0.5,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  cardRowTextWrap: { flex: 1, gap: spacing.xxs, marginRight: spacing.sm },
  cardRowTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardRowLabel: { ...typography.body, color: textPrimary },
  cardRowHint: { ...typography.caption, color: textSecondary },
  cardRowValue: { ...typography.body, color: textSecondary },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  nextNotifText: { ...typography.body, color: textSecondary },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: `${semanticInfo}18`,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${semanticInfo}30`,
    paddingVertical: spacing.md,
  },
  testButtonDisabled: {
    opacity: 0.45,
  },
  testButtonLabel: { ...typography.label, color: semanticInfo },
  pressed: { opacity: 0.7 },
})
