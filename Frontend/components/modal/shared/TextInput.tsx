import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
  KeyboardTypeOptions,
  Image,
} from 'react-native';
import { theme } from '@/theme';
import { Text } from '@/components/modal/shared/Text';

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  errorMsg?: string;
  secureEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
};

export default function TextInput({
  label,
  placeholder,
  value,
  onChangeText,
  errorMsg,
  secureEntry = false,
  keyboardType,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const isRTL = I18nManager.isRTL;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, errorMsg && { borderColor: theme.colors.error }]}>
        <RNTextInput
          style={[
            styles.input,
            {
              textAlign: isRTL ? 'right' : 'left',
              writingDirection: isRTL ? 'rtl' : 'ltr',
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureEntry && !showPassword}
          keyboardType={keyboardType}
        />
        {secureEntry && (
          <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.iconButton}>
            <Image
              source={
                showPassword
                  ? require('@/assets/images/icons/hidden.png')
                  : require('@/assets/images/icons/eye.png')
              }
              style={styles.icon}
              resizeMode="contain"
            />
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
  iconButton: {
    marginStart: theme.spacing.sm,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: theme.colors.textMuted,
  },
  error: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error,
    marginTop: 4,
  },
});
