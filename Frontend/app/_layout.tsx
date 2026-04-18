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
import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
} from '@expo-google-fonts/tajawal'
// Note: @expo-google-fonts/tajawal has no 600 weight; 700 Bold is the closest to SemiBold
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { I18nManager } from 'react-native'

import '@/i18n'
import { changeLanguage } from '@/i18n'

import {
  useAuthStore,
  selectIsAuthenticated,
  selectRole,
  selectIsRTL,
  selectLanguage,
} from '@/store/authStore'
import { ModalProvider } from '@/components/modal/ModalProvider'
import React from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const router   = useRouter()
  const segments = useSegments()

  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const role            = useAuthStore(selectRole)
  const isRTL           = useAuthStore(selectIsRTL)
  const language        = useAuthStore(selectLanguage)

  const [fontsLoaded, fontError] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
    'Tajawal-Regular':  Tajawal_400Regular,
    'Tajawal-Medium':   Tajawal_500Medium,
    'Tajawal-SemiBold': Tajawal_700Bold,
    'Tajawal-Bold':     Tajawal_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  // Keep i18next language and React Native layout direction in sync with the persisted store value.
  // This is essential on restart: the store rehydrates from AsyncStorage but i18next
  // re-initialises from the device locale, so we must reconcile them.
  useEffect(() => {
    changeLanguage(language)
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL)
    }
  }, [language, isRTL])

  useEffect(() => {
    if (!fontsLoaded && !fontError) return

    const inAuthGroup    = segments[0] === '(auth)'
    // const inParentGroup  = segments[0] === '(parent)'
    const inTeacherGroup = segments[0] === '(teacher)'
    const inSchoolGroup  = segments[0] === '(school)'

    if (!isAuthenticated) {
      if (!inAuthGroup && !inTeacherGroup && !inSchoolGroup) {
        router.replace('/(auth)/language')
      }
      return
    }

    // Logged in — redirect to the correct role navigator
    // if (role === 'parent' && !inParentGroup) {
    //   router.replace('/(parent)')
    //   return
    // }

    // if (role === 'teacher' && !inTeacherGroup) {
    //   router.replace('/(teacher)')
    //   return
    // }

    // if (role === 'school' && !inSchoolGroup) {
    //   router.replace('/(school)')
    //   return
    // }

  }, [isAuthenticated, role, fontsLoaded, fontError, segments])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <StatusBar style="dark" />
        <Slot />
      </ModalProvider>
    </QueryClientProvider>
  )
}