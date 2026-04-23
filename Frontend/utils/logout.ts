/**
 * utils/logout.ts
 * Unified logout — call this instead of store.logout() directly.
 * 1. Calls backend revoke (best-effort)
 * 2. Clears AsyncStorage refresh token
 * 3. Clears authStore
 * 4. Navigates to login
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { apiLogout } from '@/services/api';

export async function performLogout(): Promise<void> {
  try {
    const storedRefresh = await AsyncStorage.getItem('rafeeq-refresh-token');
    if (storedRefresh) {
      await apiLogout(storedRefresh).catch(() => {});
    }
  } catch { /* ignore */ } finally {
    await AsyncStorage.removeItem('rafeeq-refresh-token');
    useAuthStore.getState().logout();
    router.replace('/(auth)/login' as any);
  }
}