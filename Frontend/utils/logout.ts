/**
 * utils/logout.ts
 * Unified logout — call this instead of store.logout() directly.
 * 1. Calls backend revoke (best-effort)
 * 2. Clears AsyncStorage refresh token
 * 3. Clears authStore
 * 4. Navigates to login
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiLogout } from '@/services/api';
import { expireSession } from '@/utils/session';

export async function performLogout(): Promise<void> {
  try {
    const storedRefresh = await AsyncStorage.getItem('rafeeq-refresh-token');
    if (storedRefresh) {
      await apiLogout(storedRefresh).catch(() => {});
    }
  } catch { /* ignore */ } finally {
    await expireSession();
  }
}
