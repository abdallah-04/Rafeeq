import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingScreen" />
      <Stack.Screen name="TypeSelectionScreen" />
      <Stack.Screen name="LoginScreen" />
      <Stack.Screen name="ParentSignUpScreen" />
      <Stack.Screen name="TeacherSignUpScreen" />
    </Stack>
  );
}