import { useEffect, useRef } from 'react'
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
import React from 'react'

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } } })
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const router   = useRouter()
  const segments = useSegments()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const role            = useAuthStore(selectRole)
  const isRTL           = useAuthStore(selectIsRTL)
  const language        = useAuthStore(selectLanguage)
  const storeLogin      = useAuthStore((s) => s.login)
  const storeLogout     = useAuthStore((s) => s.logout)
  const storeUser       = useAuthStore((s) => s.user)
  const refreshAttempted = useRef(false)

  const [fontsLoaded, fontError] = useFonts({
    Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold,
    'Tajawal-Regular': Tajawal_400Regular, 'Tajawal-Medium': Tajawal_500Medium,
    'Tajawal-SemiBold': Tajawal_700Bold, 'Tajawal-Bold': Tajawal_700Bold,
  })

  useEffect(() => { if (fontsLoaded || fontError) SplashScreen.hideAsync() }, [fontsLoaded, fontError])

  useEffect(() => {
    changeLanguage(language)
    if (I18nManager.isRTL !== isRTL) I18nManager.forceRTL(isRTL)
  }, [language, isRTL])

  // Auto refresh token on startup
  useEffect(() => {
    if (!fontsLoaded && !fontError) return
    if (refreshAttempted.current) return
    refreshAttempted.current = true
    if (!isAuthenticated) return
    ;(async () => {
      try {
        const storedRefresh = await AsyncStorage.getItem('rafeeq-refresh-token')
        if (!storedRefresh) return
        const res = await apiRefreshToken(storedRefresh)
        const raw = await AsyncStorage.getItem('rafeeq-auth-storage')
        if (raw) {
          const parsed = JSON.parse(raw)
          parsed.state.token = res.accessToken
          await AsyncStorage.setItem('rafeeq-auth-storage', JSON.stringify(parsed))
        }
        if (res.refreshToken) await AsyncStorage.setItem('rafeeq-refresh-token', res.refreshToken)
        if (storeUser) storeLogin(storeUser, res.accessToken)
      } catch {
        await AsyncStorage.removeItem('rafeeq-refresh-token')
        storeLogout()
      }
    })()
  }, [fontsLoaded, fontError, isAuthenticated])

  // Role-based routing
  useEffect(() => {
    if (!fontsLoaded && !fontError) return
    const inAuthGroup    = segments[0] === '(auth)'
    const inParentGroup  = segments[0] === '(parent)'
    const inTeacherGroup = segments[0] === '(teacher)'
    const inSchoolGroup  = segments[0] === '(school)'

    if (!isAuthenticated) {
      if (!inAuthGroup) router.replace('/(auth)/language' as any)
      return
    }

    if (role === 'parent'  && !inParentGroup)  { router.replace('/(parent)/'          as any); return }
    if (role === 'teacher' && !inTeacherGroup) { router.replace('/(teacher)/'         as any); return }
    if (role === 'school'  && !inSchoolGroup)  { router.replace('/(school)/students'  as any); return }
  }, [isAuthenticated, role, fontsLoaded, fontError, segments])

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