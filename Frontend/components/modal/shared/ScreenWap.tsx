import React, { ReactNode } from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/theme';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
}

export default function ScreenWrapper({
  children,
  scroll = false,
  padded = true,
  style,
}: Props) {
  const content = (
    <View style={[styles.inner, padded && styles.padded, style]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  inner: { flex: 1 },
  padded: { paddingHorizontal: theme.spacing.lg },
  scroll: { flexGrow: 1 },
});