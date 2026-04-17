import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import React from 'react';
import { Text } from '@/components/modal/shared/Text';
import { theme } from '@/theme';

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/(auth)/language');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.brand}>RAFEEQ</Text>
        <Text style={styles.brandAr}>رفيق</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  brand: {
    fontSize: 38,
    color: theme.colors.textWhite,
    fontFamily: theme.typography.fontFamily.bold,
    letterSpacing: 3,
  },
  brandAr: {
    fontSize: 22,
    color: theme.colors.textWhite,
    fontFamily: theme.typography.fontFamily.regular,
    opacity: 0.85,
  },
});