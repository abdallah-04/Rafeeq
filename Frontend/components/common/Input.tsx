
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../constants';
import ThemedText from '../ThemedText';
 
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  required?: boolean;
}
 
export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  required = false,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
 
  const getBorderColor = () => {
    if (error) return colors.inputBorderError;
    if (isFocused) return colors.inputBorderFocus;
    return colors.inputBorder;
  };
 
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}
      
      <View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
          textInputProps.editable === false && styles.disabled,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <ThemedText
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
          ]}
          placeholderTextColor={colors.inputPlaceholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
        
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      {hint && !error && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
};
 
const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelContainer: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  required: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  inputWithLeftIcon: {
    marginLeft: spacing.sm,
  },
  inputWithRightIcon: {
    marginRight: spacing.sm,
  },
  leftIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: colors.inputBackgroundDisabled,
    borderColor: colors.borderLight,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.error,
    marginTop: spacing.xs,
  },
  hintText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});