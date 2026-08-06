import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'

import { useActiveChildStore } from '@/store/activeChildStore'
import { useAuthStore } from '@/store/authStore'

let clearProtectedCache: (() => void) | null = null
let expirationPromise: Promise<void> | null = null
let expirationRedirectPending = false

export function registerProtectedCacheClearer(clear: () => void): void {
  clearProtectedCache = clear
}

export function isSessionExpirationInProgress(): boolean {
  return expirationRedirectPending
}

export function acknowledgeSessionExpirationRedirect(): void {
  expirationRedirectPending = false
}

async function clearLocalSessionAndRedirect(): Promise<void> {
  await AsyncStorage.removeItem('rafeeq-refresh-token')
  useAuthStore.getState().logout()
  useActiveChildStore.getState().clearActiveChild()
  clearProtectedCache?.()
  router.replace('/(auth)/login' as never)
}

/** Clear local authenticated state and leave protected navigation exactly once. */
export function expireSession(): Promise<void> {
  if (expirationPromise) return expirationPromise
  if (expirationRedirectPending) return Promise.resolve()

  expirationRedirectPending = true
  expirationPromise = clearLocalSessionAndRedirect().finally(() => {
    expirationPromise = null
  })

  return expirationPromise
}
