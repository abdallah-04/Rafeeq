import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
  KeyboardTypeOptions,
} from 'react-native';
import { Colors, Spacing, Radius } from '@/theme';

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  errorMsg?: string;
  secureEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  returnKeyType?: 'done' | 'next' | 'go' | 'search' | 'send';
  onSubmitEditing?: () => void;
  accessibilityLabel?: string;
  editable?: boolean;
};

export default function TextInput({
  label,
  placeholder,
  value,
  onChangeText,
  errorMsg,
  secureEntry = false,
  keyboardType = 'default',
  maxLength,
  autoCapitalize = 'none',
  returnKeyType,
  onSubmitEditing,
  accessibilityLabel,
  editable = true,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const isRTL = I18nManager.isRTL;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputRow, errorMsg ? styles.inputError : null]}>
        <RNTextInput
          style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureEntry && !showPassword}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          accessibilityLabel={accessibilityLabel ?? label}
          editable={editable}
        />
        {secureEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword((p) => !p)}
            style={styles.eyeBtn}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDark,
    fontFamily: 'Lexend_600SemiBold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    height: 52,
  },
  inputError: {
    borderColor: Colors.red,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
    fontFamily: 'Lexend_400Regular',
  },
  eyeBtn: {
    padding: Spacing.sm,
  },
  eyeIcon: {
    fontSize: 18,
  },
  error: {
    fontSize: 12,
    color: Colors.red,
    fontFamily: 'Lexend_400Regular',
  },
});