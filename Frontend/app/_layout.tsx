import { useEffect, useRef, useState } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold } from '@expo-google-fonts/lexend'
import { Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold } from '@expo-google-fonts/tajawal'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { I18nManager } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import '@/i18n'
import { changeLanguage } from '@/i18n'
import { useAuthStore, selectIsAuthenticated, selectRole, selectIsRTL, selectLanguage } from '@/store/authStore'
import { ModalProvider } from '@/components/modal/ModalProvider'
import { apiRefreshToken } from '@/services/api'
import {
  acknowledgeSessionExpirationRedirect,
  expireSession,
  isSessionExpirationInProgress,
  registerProtectedCacheClearer,
} from '@/utils/session'
import React from 'react'

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } } })
registerProtectedCacheClearer(() => queryClient.clear())
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const router   = useRouter()
  const segments = useSegments()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const role            = useAuthStore(selectRole)
  const isRTL           = useAuthStore(selectIsRTL)
  const language        = useAuthStore(selectLanguage)
  const setAccessToken  = useAuthStore((s) => s.setAccessToken)
  const refreshAttempted = useRef(false)
  const [hasHydrated, setHasHydrated] = useState(useAuthStore.persist.hasHydrated())
  const [startupSessionChecked, setStartupSessionChecked] = useState(false)

  const [fontsLoaded, fontError] = useFonts({
    Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold,
    'Tajawal-Regular': Tajawal_400Regular, 'Tajawal-Medium': Tajawal_500Medium,
    'Tajawal-SemiBold': Tajawal_700Bold, 'Tajawal-Bold': Tajawal_700Bold,
  })

  useEffect(() => {
    if ((fontsLoaded || fontError) && hasHydrated && startupSessionChecked) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError, hasHydrated, startupSessionChecked])

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) setHasHydrated(true)
    return useAuthStore.persist.onFinishHydration(() => setHasHydrated(true))
  }, [])

  useEffect(() => {
    changeLanguage(language)
    if (I18nManager.isRTL !== isRTL) I18nManager.forceRTL(isRTL)
  }, [language, isRTL])

  // Auto refresh token on startup
  useEffect(() => {
    if (!fontsLoaded && !fontError) return
    if (!hasHydrated) return
    if (refreshAttempted.current) return
    refreshAttempted.current = true
    if (!isAuthenticated) {
      setStartupSessionChecked(true)
      return
    }
    ;(async () => {
      try {
        const storedRefresh = await AsyncStorage.getItem('rafeeq-refresh-token')
        if (!storedRefresh) {
          await expireSession()
          return
        }
        const res = await apiRefreshToken(storedRefresh)
        setAccessToken(res.accessToken)
        if (res.refreshToken) await AsyncStorage.setItem('rafeeq-refresh-token', res.refreshToken)
      } catch {
        await expireSession()
      } finally {
        setStartupSessionChecked(true)
      }
    })()
  }, [fontsLoaded, fontError, hasHydrated, isAuthenticated, setAccessToken])

  // Role-based routing
  useEffect(() => {
    if (!fontsLoaded && !fontError) return
    if (!hasHydrated || !startupSessionChecked) return
    const inAuthGroup    = segments[0] === '(auth)'
    const inParentGroup  = segments[0] === '(parent)'
    const inTeacherGroup = segments[0] === '(teacher)'
    const inSchoolGroup  = segments[0] === '(school)'
    const inExploreGroup = segments[0] === 'explore'
    const authScreen     = inAuthGroup ? segments[1] : null
    const allowOtpScreen = authScreen === 'verify-phone' || authScreen === 'verify-school-phone'

    if (authScreen === 'login' && isSessionExpirationInProgress()) {
      acknowledgeSessionExpirationRedirect()
    }

    if (!isAuthenticated) {
      if (isSessionExpirationInProgress()) return
      if (!inAuthGroup) router.replace('/(auth)/language' as any)
      return
    }

    if (allowOtpScreen) return
    if (inExploreGroup) return

    if (role === 'parent'  && !inParentGroup)  { router.replace('/(parent)/'          as any); return }
    if (role === 'teacher' && !inTeacherGroup) { router.replace('/(teacher)/'         as any); return }
    if (role === 'school'  && !inSchoolGroup)  { router.replace('/(school)/teachers'  as any); return }
  }, [isAuthenticated, role, fontsLoaded, fontError, hasHydrated, startupSessionChecked, segments])

  if (!fontsLoaded && !fontError) return null

  return (
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <StatusBar style="dark" />
        <Slot />
      </ModalProvider>
    </QueryClientProvider>
  )
}
