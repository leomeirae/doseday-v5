import { useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@hooks/useSession'
import { useNotifications } from '@hooks/useNotifications'
import { registerForPushNotificationsAsync } from '@lib/notifications'
import { supabase } from '@lib/supabase/client'

async function savePushToken(userId: string, token: string): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ exp_push_token: token })
    .eq('user_id', userId)

  if (error) throw error
}

async function ensureUserSettingsDefaults(userId: string): Promise<void> {
  const { error } = await supabase.from('user_settings').upsert(
    {
      user_id: userId,
      notifications_enabled: true,
      notification_time: '20:00:00',
    },
    // Create defaults only when the row is missing; keep explicit opt-outs intact.
    { onConflict: 'user_id', ignoreDuplicates: true }
  )

  if (error) throw error
}

export function usePushTokenRegistration() {
  const { session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()
  const { permissionStatus } = useNotifications()
  const registeredRef = useRef(false)

  const { mutate: register } = useMutation({
    mutationKey: ['push-token', userId],
    mutationFn: async () => {
      if (!userId) return

      await ensureUserSettingsDefaults(userId)

      const token = await registerForPushNotificationsAsync()
      if (token) {
        await savePushToken(userId, token)
        console.log('[usePushTokenRegistration] token saved for user', userId)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings', userId] })
    },
    onError: (err) => {
      console.warn('[usePushTokenRegistration] error:', err)
    },
  })

  useEffect(() => {
    if (!userId || permissionStatus !== 'granted' || registeredRef.current) return
    registeredRef.current = true
    register()
  }, [userId, permissionStatus, register])
}
