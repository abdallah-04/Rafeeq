import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  useEffect(() => {
    const goNext = async () => {
      await new Promise((res) => setTimeout(res, 50));
      try {
        const raw = await AsyncStorage.getItem('rafeeq-auth-storage');
        const parsed = raw ? JSON.parse(raw) : null;
        const state = parsed?.state;

        if (state?.isAuthenticated) {
          if (state.role === 'parent') {
            router.replace('/(parent)/' as any);
            return;
          }
          if (state.role === 'teacher') {
            router.replace('/(teacher)/' as any);
            return;
          }
          if (state.role === 'school') {
            router.replace('/(school)/teachers' as any);
            return;
          }
        }
      } catch {
        // Fall through to the auth entry route below.
      }

      router.replace('/(auth)/language' as any);
    };
    goNext();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Loading...</Text>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginBottom: 16, fontSize: 18 },
});
