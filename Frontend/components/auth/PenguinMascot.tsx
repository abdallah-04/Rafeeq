import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';

type MascotVariant = 
  | 'welcome'     
  | 'learning'    
  | 'celebrating' 
  | 'thinking'     
  | 'default';  

interface PenguinMascotProps {
  variant?: MascotVariant;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const PenguinMascot: React.FC<PenguinMascotProps> = ({
  variant = 'default',
  size = 'medium',
  style,
}) => {
  const sizeMap = {
    small: 80,
    medium: 120,
    large: 180,
  };

  const imageSize = sizeMap[size];

  return (
    <View style={[styles.container, { width: imageSize, height: imageSize }, style]}>
      {/* Placeholder - replace with actual Image component */}
      <View style={[styles.placeholder, { width: imageSize, height: imageSize }]} />
      {/* 
      <Image
        source={penguinImages[variant]}
        style={{ width: imageSize, height: imageSize }}
        resizeMode="contain"
      />
      */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});