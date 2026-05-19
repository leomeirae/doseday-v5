import { useEffect, useRef, useState } from 'react'
import * as Notifications from 'expo-notifications'
import { AppState } from 'react-native'
import { getPermissionStatus, type NotificationPermissionStatus } from '@lib/notifications'

export function useNotifications() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('undetermined')
  const receivedListener = useRef<Notifications.EventSubscription | null>(null)
  const responseListener = useRef<Notifications.EventSubscription | null>(null)

  async function checkPermission() {
    const status = await getPermissionStatus()
    setPermissionStatus(status)
  }

  useEffect(() => {
    checkPermission()

    // Re-check when app comes to foreground (user may have changed settings)
    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkPermission()
      }
    })

    return () => {
      appStateSub.remove()
    }
  }, [])

  function setupListeners(
    onReceived?: (notification: Notifications.Notification) => void,
    onResponse?: (response: Notifications.NotificationResponse) => void
  ) {
    receivedListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[useNotifications] received:', notification.request.identifier)
      onReceived?.(notification)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('[useNotifications] response tapped:', response.notification.request.identifier)
      onResponse?.(response)
    })

    return () => {
      receivedListener.current?.remove()
      responseListener.current?.remove()
    }
  }

  return {
    permissionStatus,
    recheckPermission: checkPermission,
    setupListeners,
  }
}
