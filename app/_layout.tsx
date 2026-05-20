import '../lib/i18n'
import { useEffect } from 'react'
import { Stack, useRouter, useSegments, useRootNavigationState, type Href } from 'expo-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@lib/queryClient'
import { StatusBar } from 'expo-status-bar'
import Toast from 'react-native-toast-message'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { colors } from '@lib/theme/tokens'
import { AuthProvider } from '@contexts/AuthContext'
import { useSession } from '@hooks/useSession'
import { useProfile } from '@hooks/useProfile'
import { SplashView } from '@components/auth/SplashView'
import { toastConfig } from '@components/ui/toastConfig'
import { useNotifications } from '@hooks/useNotifications'
import { usePushTokenRegistration } from '@hooks/usePushTokenRegistration'
import { useScheduleDoseNotifications } from '@hooks/useScheduleDoseNotifications'

function NotificationBootstrap() {
  const router = useRouter()
  const { setupListeners } = useNotifications()

  usePushTokenRegistration()
  useScheduleDoseNotifications()

  useEffect(() => {
    const cleanup = setupListeners(
      undefined,
      (response) => {
        // Handle tap on notification — deeplink to Doses with optional highlight
        const data = response.notification.request.content.data as Record<string, unknown>
        const doseId = typeof data?.dose_id === 'string' ? data.dose_id : undefined
        if (doseId) {
          router.push(`/(tabs)/doses?highlight=${doseId}`)
        } else {
          router.push('/(tabs)/doses')
        }
      }
    )
    return cleanup
  }, [setupListeners, router])

  return null
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession()
  const { data: profile, isLoading: profileLoading, isFetching: profileFetching } = useProfile()
  const segments = useSegments()
  const router = useRouter()
  const navigationState = useRootNavigationState()

  useEffect(() => {
    if (loading) return
    if (session && (profileLoading || (profileFetching && profile === undefined))) return
    if (!navigationState?.key) return // navigator not yet mounted — wait

    const currentGroup = String(segments[0] ?? '')
    const inAuthGroup = currentGroup === '(auth)'
    const inOnboardingGroup = currentGroup === '(onboarding)'
    const onboardingCompleted = profile?.onboardingCompletedAt != null

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/signin')
    } else if (session && !onboardingCompleted && !inOnboardingGroup) {
      router.replace('/(onboarding)' as Href)
    } else if (session && onboardingCompleted && (inAuthGroup || inOnboardingGroup)) {
      router.replace('/(tabs)')
    }
  }, [
    session,
    loading,
    profile,
    profileLoading,
    profileFetching,
    navigationState?.key,
    segments,
    router,
  ])

  if (loading || (session && (profileLoading || (profileFetching && profile === undefined)))) {
    return <SplashView />
  }

  return <>{children}</>
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="light" />
          <AuthGuard>
            <NotificationBootstrap />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bgBase },
              }}
            >
              <Stack.Screen
                name="dose/registrar"
                options={{ presentation: 'modal', headerShown: false }}
              />
              <Stack.Screen
                name="peso/historico"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="peso/registrar"
                options={{ presentation: 'modal', headerShown: false }}
              />
              <Stack.Screen
                name="diario/checkin"
                options={{ presentation: 'modal', headerShown: false }}
              />
              <Stack.Screen
                name="diario/quick-log"
                options={{ presentation: 'modal', headerShown: false }}
              />
              <Stack.Screen
                name="perfil/notificacoes"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="perfil/account"
                options={{ headerShown: false }}
              />
            </Stack>
          </AuthGuard>
        </AuthProvider>
      </QueryClientProvider>
      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  )
}
