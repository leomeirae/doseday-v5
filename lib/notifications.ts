import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import type { NextDoseData } from '@lib/supabase/queries/doses'

// Identifier prefix for dose reminder notifications
const DOSE_NOTIF_ID_PREFIX = 'dose-reminder-'

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export async function requestPermissions(): Promise<NotificationPermissionStatus> {
  if (Platform.OS !== 'ios') return 'undetermined'

  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return 'granted'
  if (existing === 'denied') return 'denied'

  const { status } = await Notifications.requestPermissionsAsync()
  console.log('[notifications] requestPermissions result:', status)
  return status as NotificationPermissionStatus
}

export async function getPermissionStatus(): Promise<NotificationPermissionStatus> {
  if (Platform.OS !== 'ios') return 'undetermined'
  const { status } = await Notifications.getPermissionsAsync()
  return status as NotificationPermissionStatus
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS !== 'ios') return null

  const status = await getPermissionStatus()
  if (status !== 'granted') return null

  try {
    const token = await Notifications.getExpoPushTokenAsync()
    console.log('[notifications] push token:', token.data)
    return token.data
  } catch (err) {
    console.warn('[notifications] failed to get push token:', err)
    return null
  }
}

/**
 * Schedules a single local notification T0 for the next dose.
 * Cancels any previous notification for the same dose cycle first.
 * Returns the notification identifier or null if scheduling was skipped.
 */
export async function scheduleLocalNotification(
  nextDose: NextDoseData,
  notificationTimeStr: string, // HH:MM:SS format from user_settings.notification_time
  referenceId?: string // ID of the last applied dose — used for deeplink highlight
): Promise<string | null> {
  if (Platform.OS !== 'ios') return null

  const status = await getPermissionStatus()
  if (status !== 'granted') return null

  // Cancel previous T0 for this cycle
  await cancelDoseNotifications()

  // Parse notification time
  const [hours, minutes] = notificationTimeStr.split(':').map(Number)

  const scheduledDate = new Date(nextDose.scheduledDate)
  scheduledDate.setHours(hours, minutes, 0, 0)

  // Do not schedule if the trigger time is in the past
  if (scheduledDate <= new Date()) {
    console.log('[notifications] skipping schedule — trigger date is in the past')
    return null
  }

  const trigger: Notifications.DateTriggerInput = { type: Notifications.SchedulableTriggerInputTypes.DATE, date: scheduledDate }

  const id = await Notifications.scheduleNotificationAsync({
    identifier: `${DOSE_NOTIF_ID_PREFIX}${scheduledDate.getTime()}`,
    content: {
      title: 'DoseDay',
      body: 'Hora da sua dose semanal.',
      data: { type: 'dose_reminder', scheduledDate: scheduledDate.toISOString(), dose_id: referenceId ?? null },
    },
    trigger,
  })

  console.log('[notifications] scheduled dose reminder:', id, 'for', scheduledDate.toISOString())
  return id
}

export async function cancelDoseNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  const doseNotifs = scheduled.filter((n) => n.identifier.startsWith(DOSE_NOTIF_ID_PREFIX))
  await Promise.all(doseNotifs.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)))
  if (doseNotifs.length > 0) {
    console.log('[notifications] cancelled', doseNotifs.length, 'dose notification(s)')
  }
}

export async function scheduleTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'DoseDay',
      body: 'Hora da sua dose semanal.',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 },
  })
  console.log('[notifications] test notification scheduled in 5s')
}

export async function getAllScheduledDoseNotifications(): Promise<Notifications.NotificationTrigger[]> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  return scheduled
    .filter((n) => n.identifier.startsWith(DOSE_NOTIF_ID_PREFIX))
    .map((n) => n.trigger)
}
