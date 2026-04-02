import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    const goNext = async () => {
      await new Promise(res => setTimeout(res, 50)); 
      router.replace('/splash'); 
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