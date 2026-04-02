import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // animation
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

    // navigation
    setTimeout(() => {
      router.replace("/lnaguage");
    }, 2000);
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
    backgroundColor: "#508DF7",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 2,
  },
  sub: {
    fontSize: 20,
    color: "#fff",
    marginTop: 8,
  },
});
