import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { theme } from '@/theme';

type AvatarSize = 'sm' | 'md' | 'lg';

type Props = {
  name?: string;
  imageUri?: string;
  size?: AvatarSize;
};

export default function Avatar({ name, imageUri, size = 'md' }: Props) {
  const sizeMap: Record<AvatarSize, number> = {
    sm: 30,
    md: 50,
    lg: 80,
  };
  const dimension = sizeMap[size];
  const initials = name
    ? name.split(' ').map((part) => part[0]).join('').toUpperCase()
    : '';

  return (
    <View style={[styles.container, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
        />
      ) : (
        <View style={[styles.fallback, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}>
          <Text style={[styles.initials, { fontSize: dimension / 2.5 }]}>{initials}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: theme.colors.inputPlaceholder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { resizeMode: 'cover' },
  fallback: {
    backgroundColor: theme.colors.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily.bold,
  },
});