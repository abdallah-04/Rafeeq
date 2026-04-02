import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import React from 'react';
import { useAuthStore, selectLanguageSelected } from '@/store/authStore';

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.8)).current;

  const languageSelected = useAuthStore(selectLanguageSelected);

  useEffect(() => {
    // Fade + scale animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // After 2 s, decide where to go:
    // • First launch (no language chosen) → language selection
    // • Returning user → onboarding (or further if already seen)
    const timer = setTimeout(() => {
      if (!languageSelected) {
        router.replace('/(auth)/language');
      } else {
        router.replace('/(auth)/onboarding');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Text style={styles.logo}>RAFEEQ</Text>
        <Text style={styles.sub}>رفيق</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#508DF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  sub: {
    fontSize: 20,
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
});