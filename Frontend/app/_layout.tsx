import { useEffect } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
} from '@expo-google-fonts/lexend'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { I18nManager } from 'react-native'

import '@/i18n'

import {
  useAuthStore,
  selectIsAuthenticated,
  selectRole,
  selectIsRTL,
} from '@/store/authStore'


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long data is considered fresh (5 min)
      staleTime: 1000 * 60 * 5,
      // How many times to retry a failed request
      retry: 1,
    },
  },
})


SplashScreen.preventAutoHideAsync()


export default function RootLayout() {
  const router     = useRouter()
  const segments   = useSegments()   

  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const role            = useAuthStore(selectRole)
  const isRTL           = useAuthStore(selectIsRTL)

  const [fontsLoaded, fontError] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])


  useEffect(() => {
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL)
    }
  }, [isRTL])

  useEffect(() => {
    if (!fontsLoaded && !fontError) return

    const inAuthGroup    = segments[0] === './(auth)'
    const inParentGroup  = segments[0] === './(parent)'
    const inTeacherGroup = segments[0] === './(teacher)'
    const inSchoolGroup  = segments[0] === './(school)'

    if (!isAuthenticated) {

      if (!inAuthGroup) {
        router.replace('./(auth)')
      }
      return
    }

    // Logged in — send to role-appropriate navigator
    // but only if not already there
    if (role === 'parent' && !inParentGroup) {
      router.replace('/(parent)')
      return
    }

    if (role === 'teacher' && !inTeacherGroup) {
      router.replace('/(teacher)')
      return
    }

    if (role === 'school' && !inSchoolGroup) {
      router.replace('/(school)')
      return
    }

  }, [isAuthenticated, role, fontsLoaded, fontError, segments])

  // ── Don't render anything until fonts load ─
  if (!fontsLoaded && !fontError) {
    return null   // splash screen is still showing
  }


  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={isRTL ? 'dark' : 'dark'} />
      <Slot />
    </QueryClientProvider>
  )
}