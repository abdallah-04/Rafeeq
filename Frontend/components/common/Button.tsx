import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`${size}Size`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.textBase,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.white : colors.primary}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
  
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceElevated,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  text: {
    backgroundColor: colors.transparent,
  },
  
  smallSize: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mediumSize: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  largeSize: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  
  textBase: {
    fontFamily: typography.fontFamily.semiBold,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
  },
  secondaryText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
  },
  outlineText: {
    color: colors.primary,
    fontSize: typography.fontSize.base,
  },
  textText: {
    color: colors.primary,
    fontSize: typography.fontSize.base,
  },
  
  smallText: {
    fontSize: typography.fontSize.sm,
  },
  mediumText: {
    fontSize: typography.fontSize.base,
  },
  largeText: {
    fontSize: typography.fontSize.lg,
  },
  
  disabled: {
    backgroundColor: colors.buttonDisabled,
    borderColor: colors.buttonDisabled,
  },
  disabledText: {
    color: colors.buttonTextDisabled,
  },
});