import React, { useState } from 'react';
import { View, TextInput as RNTextInput, Text, TouchableOpacity, StyleSheet, I18nManager, KeyboardTypeOptions } from 'react-native';
import { theme } from '@/theme';

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  errorMsg?: string;
  secureEntry?: boolean;
  keyboardType?: KeyboardTypeOptions; 
};

export default function TextInput({ label, placeholder, value, onChangeText, errorMsg, secureEntry = false, keyboardType }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const isRTL = I18nManager.isRTL;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, errorMsg && { borderColor: theme.colors.error }]}>
        <RNTextInput
          style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureEntry && !showPassword}
        />
        {secureEntry && (
          <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
            <Text>{showPassword ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', marginBottom: theme.spacing.sm },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.inputBorder,
    paddingHorizontal: theme.spacing.lg,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.regular,
  },
  error: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error,
    marginTop: 4,
  },
});