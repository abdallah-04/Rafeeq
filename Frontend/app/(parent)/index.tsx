/**
 * app/(parent)/index.tsx
 *
 * Post-login landing router for the parent section.
 *
 * Decision tree (runs once on mount):
 *   children.length === 0  →  replace with MyChildrenEmpty
 *   children.length >= 1   →  replace with myChildren (populated list)
 *
 * Uses router.replace so this screen is removed from the stack;
 * pressing back from the destination will NOT return here.
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { apiGetChildren } from '@/services/api';
import { theme } from '@/theme';

export default function ParentIndex() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const children = await apiGetChildren();
        if (cancelled) return;
        router.replace(children.length === 0 ? '/(parent)/MyChildrenEmpty' as any : '/(parent)/myChildren' as any);
      } catch {
        if (!cancelled) router.replace('/(parent)/MyChildrenEmpty' as any);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' },
});