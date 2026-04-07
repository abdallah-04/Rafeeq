import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function TeacherLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="student-quick-access" />
        <Stack.Screen name="Student_dashboard" />
        <Stack.Screen name="notes" />
        <Stack.Screen name="homework" />
        <Stack.Screen name="reports" />
        <Stack.Screen name="add-note" />
        <Stack.Screen name="add-student" />
        <Stack.Screen name="monthly-exam" />
        <Stack.Screen name="road-map" />
      </Stack>
    </SafeAreaProvider>
  );
}
