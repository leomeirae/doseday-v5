import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@hooks/useSession'
import { useDoseSummary } from '@hooks/useDoseSummary'
import { useNotifications } from '@hooks/useNotifications'
import { scheduleLocalNotification, cancelDoseNotifications } from '@lib/notifications'
import type { NotificationPermissionStatus } from '@lib/notifications'
import { supabase } from '@lib/supabase/client'

type UserSettings = {
  notificationsEnabled: boolean
  notificationTime: string
}

async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('notifications_enabled, notification_time')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    notificationsEnabled: data.notifications_enabled ?? true,
    notificationTime: data.notification_time ?? '20:00:00',
  }
}

export function useScheduleDoseNotifications() {
  const { session } = useSession()
  const userId = session?.user?.id

  const { data: doseSummary } = useDoseSummary()
  const { data: settings } = useQuery({
    queryKey: ['userSettings', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user')
      return getUserSettings(userId)
    },
    enabled: !!userId,
  })
  const { permissionStatus } = useNotifications()

  const prevNextDateRef = useRef<string | null>(null)
  const prevPermRef = useRef<NotificationPermissionStatus>('undetermined')

  const lastDoseId = doseSummary?.history[0]?.id

  useEffect(() => {
    const nextDose = doseSummary?.nextDose
    const notifEnabled = settings?.notificationsEnabled ?? true
    const notifTime = settings?.notificationTime ?? '20:00:00'

    // Force reschedule when permission transitions to granted
    if (permissionStatus === 'granted' && prevPermRef.current !== 'granted') {
      prevNextDateRef.current = null
    }
    prevPermRef.current = permissionStatus

    if (!nextDose || !notifEnabled) {
      cancelDoseNotifications()
      prevNextDateRef.current = null
      return
    }

    const nextDateStr = nextDose.scheduledDate.toISOString()
    if (prevNextDateRef.current === nextDateStr) return

    prevNextDateRef.current = nextDateStr
    scheduleLocalNotification(nextDose, notifTime, lastDoseId).catch((err) => {
      console.warn('[useScheduleDoseNotifications] schedule error:', err)
    })
  }, [doseSummary?.nextDose, lastDoseId, settings?.notificationsEnabled, settings?.notificationTime, permissionStatus])
}
