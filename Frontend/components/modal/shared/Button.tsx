import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '@/theme';
import { Text } from '@/components/modal/shared/Text';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: Props) => {
  const isDisabled = disabled || loading;

  const variantStyles: Record<Variant, ViewStyle> = {
    primary: {
      backgroundColor: isDisabled
        ? theme.colors.buttonPrimaryDisabled
        : theme.colors.buttonPrimary,
      borderRadius: theme.radius.lg,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    secondary: {
      backgroundColor: theme.colors.buttonSecondary,
      borderRadius: theme.radius.lg,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.colors.buttonOutline,
      borderRadius: theme.radius.lg,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    ghost: {
      backgroundColor: 'transparent',
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  const variantTextStyles: Record<Variant, TextStyle> = {
    primary: {
      color: theme.colors.textWhite,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.bold,
      fontFamily: theme.typography.fontFamily.bold,
    },
    secondary: {
      color: theme.colors.textPrimary,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.bold,
      fontFamily: theme.typography.fontFamily.bold,
    },
    outline: {
      color: theme.colors.buttonOutline,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.bold,
      fontFamily: theme.typography.fontFamily.bold,
    },
    ghost: {
      color: theme.colors.primary,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      fontFamily: theme.typography.fontFamily.medium,
    },
  };

  return (
    <TouchableOpacity
      style={[variantStyles[variant], style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.colors.textWhite : theme.colors.primary}
          size="small"
        />
      ) : (
        <Text style={[variantTextStyles[variant], textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};