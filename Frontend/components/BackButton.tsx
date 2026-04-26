import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/Colors';

interface BackButtonProps 
{
  onPress: () => void;
}
export default function BackButton({ onPress }: BackButtonProps) 
{
    return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel="Back"
      accessibilityRole="button"
    >
      <Ionicons
        name="chevron-back"
        size={22}
        color={colors.primary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 20,       
    backgroundColor: colors.surface,
    alignItems: 'center',     
    justifyContent: 'center',  
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
