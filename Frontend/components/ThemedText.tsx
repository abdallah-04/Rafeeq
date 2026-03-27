import React from 'react';
import { colors } from '@/constants/Colors';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';

type TextVariant =
  | 'h1'          
  | 'h2'          
  | 'h3'         
  | 'bookTitle'   
  | 'author'      
  | 'body'        
  | 'caption'   
  | 'button'     
  | 'link'       
  | 'subtitle'   
  | 'byline'     
  | 'appTitle'   

type TextColor =
  | 'default'     
  | 'primary'     
  | 'muted'       
  | 'white'       

interface ThemedTextProps {
  children?: React.ReactNode;
  variant?: TextVariant;
  color?: TextColor;
  opacity?: number;
  center?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

export default function ThemedText({
  children,
  variant = 'body',
  color = 'default',
  opacity,
  center = false,
  style,
  numberOfLines,
}: ThemedTextProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        styles.base,
        styles[variant],
        colorStyles[color],
        center && styles.center,
        opacity !== undefined && { opacity },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
  center: {
    textAlign: 'center',
  },

  h1: {
    fontFamily: 'InriaSans_700Bold',
    fontSize: 36,
    letterSpacing: -0.684,
    lineHeight: 54,
  },
  h2: {
    fontFamily: 'InriaSans_400Regular',
    fontSize: 32,
    letterSpacing: -0.608,
    lineHeight: 48,
  },
  h3: {
    fontFamily: 'InriaSans_700Bold',
    fontSize: 17,
    letterSpacing: -0.323,
    lineHeight: 25,
  },
  Title: {
    fontFamily: 'InriaSans_700Bold',
    fontSize: 15,
    letterSpacing: -0.285,
    lineHeight: 22,
  },
  body: {
    fontFamily: 'InriaSans_700Bold',
    fontSize: 16,
    letterSpacing: -0.304,
    lineHeight: 24,
  },
  caption: {
    fontFamily: 'InriaSans_400Regular',
    fontSize: 10,
    letterSpacing: -0.19,
    lineHeight: 15,
  },
  button: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    lineHeight: 24,
  },
  tabLabel: {
    fontFamily: 'InriaSans_700Bold',
    fontSize: 12,
    letterSpacing: -0.228,
    lineHeight: 18,
  },

  link: {
    fontFamily: 'InriaSans_700Bold',
    fontSize: 15,
    letterSpacing: -0.285,
    lineHeight: 22,
  },
  subtitle: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 16,
    letterSpacing: -0.304,
    lineHeight: 24,
  },
  byline: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 24,
    letterSpacing: -0.456,
    lineHeight: 36,
  },
  appTitle: {
    fontFamily: 'InriaSans_700Bold',
    fontSize: 24,
    letterSpacing: -0.456,
    lineHeight: 36,
  },
});

const colorStyles = StyleSheet.create({
  default:   { color: colors.info },
  primary:   { color: colors.primary },
  muted:     { color: colors.textMuted },
  white:     { color: colors.white },
});