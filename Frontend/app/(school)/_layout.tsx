import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function SchoolLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="teachers" />
        <Stack.Screen name="students" />
        <Stack.Screen name="add-teacher" />
        <Stack.Screen name="add-teacher-empty" />
        <Stack.Screen name="add-student" />
        <Stack.Screen name="teacher/[id]" />
        <Stack.Screen name="student/[id]" />
      </Stack>
    </SafeAreaProvider>
  );
}
