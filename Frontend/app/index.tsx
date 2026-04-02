import { View, Text } from 'react-native';
import React from 'react';
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  useEffect(() => {
    router.replace('/splash'); 
  }, []);

  return null;
}