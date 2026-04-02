import { Stack } from 'expo-router';
import React from 'react';

// Layout for the (auth) route group.
// Defines a headerless Stack so each screen manages its own header.
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}