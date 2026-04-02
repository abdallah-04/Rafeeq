import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, Radius } from '@/theme';

type Variant = 'primary' | 'outline' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        isDisabled && styles[`${variant}Disabled` as keyof typeof styles],
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.white : Colors.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.label,
            styles[`${variant}Label` as keyof typeof styles],
            isDisabled && styles[`${variant}LabelDisabled` as keyof typeof styles],
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  // ── Primary ──────────────────────────────
  primary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  primaryDisabled: {
    backgroundColor: '#B8CCFA',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryLabel: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Lexend_700Bold',
    fontWeight: '700',
  },
  primaryLabelDisabled: {
    color: Colors.white,
  },

  // ── Outline ──────────────────────────────
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  outlineDisabled: {
    borderColor: Colors.border,
  },
  outlineLabel: {
    color: Colors.primary,
    fontSize: 16,
    fontFamily: 'Lexend_600SemiBold',
    fontWeight: '600',
  },
  outlineLabelDisabled: {
    color: Colors.textMuted,
  },

  // ── Ghost ────────────────────────────────
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostDisabled: {},
  ghostLabel: {
    color: Colors.primary,
    fontSize: 15,
    fontFamily: 'Lexend_400Regular',
    textDecorationLine: 'underline',
  },
  ghostLabelDisabled: {
    color: Colors.textMuted,
  },

  label: {
    textAlign: 'center',
  },
});