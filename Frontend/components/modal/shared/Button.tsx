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

  const getTextVariant = (): 'heading' | 'body' | 'caption' | 'label' => {
    if (variant === 'ghost') return 'label';
    return 'body';
  };

  const getTextColor = (): keyof typeof theme.colors => {
    switch (variant) {
      case 'primary':
        return 'textWhite';
      case 'secondary':
        return 'textPrimary';
      case 'outline':
        return 'buttonOutline';
      case 'ghost':
        return 'primary';
      default:
        return 'textPrimary';
    }
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
        <Text 
          variant={getTextVariant()}
          color={getTextColor()}
          style={[{ fontSize: variant === 'ghost' ? theme.typography.fontSize.sm : theme.typography.fontSize.base }, textStyle]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};