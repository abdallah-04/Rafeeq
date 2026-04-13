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

import { useAppStore } from '@/store/Appstore';
import { theme } from '@/theme';

const { colors } = theme;

export default function ParentIndex() {
  const children = useAppStore((s) => s.children);

  useEffect(() => {
    if (children.length === 0) {
      router.replace('/(parent)/MyChildrenEmpty' as any);
    } else {
      router.replace('/(parent)/myChildren' as any);
    }
    // Intentionally only runs on mount — children state at login time decides
    // the destination; subsequent changes are handled inside the screens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Brief loading screen while the replace is being processed
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
