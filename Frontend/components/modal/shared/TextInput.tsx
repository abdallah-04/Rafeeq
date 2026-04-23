import React, { useState } from 'react';
import { View, TextInput as RNTextInput, TouchableOpacity, StyleSheet, I18nManager, KeyboardTypeOptions, Image, TextStyle, StyleProp } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  style?: StyleProp<TextStyle>;
  placeholderTextColor?: string;
  textAlign?: 'left' | 'right' | 'center';
};

export default function TextInput({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  errorMsg, 
  secureEntry = false, 
  keyboardType, 
  style,
  placeholderTextColor,
  textAlign
}: Props) {
  const { i18n } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const isRTL = I18nManager.isRTL;
  const isAr = i18n.language === 'ar';

  const getFontFamily = () => {
    if (isAr) {
      return theme.typography.fontFamily.regular;
    }
    return theme.typography.fontFamily.regular;
  };

  const finalFontFamily = getFontFamily();
  const finalTextAlign = textAlign || (isRTL ? 'right' : 'left');

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text 
          variant="label" 
          color={errorMsg ? 'error' : 'textPrimary'}
          style={[styles.label, isRTL && styles.labelRTL]}
        >
          {label}
        </Text>
      )}
      <View style={[styles.inputRow, errorMsg && { borderColor: theme.colors.error }]}>
        <RNTextInput
          style={[
            styles.input, 
            { 
              fontFamily: finalFontFamily, 
              textAlign: finalTextAlign 
            }, 
            isRTL && styles.inputRTL,
            style
          ]}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor || theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureEntry && !showPassword}
          keyboardType={keyboardType}
        />
        {secureEntry && (
          <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
            <Image 
              source={showPassword ? require('@/assets/images/icons/eye.png') : require('@/assets/images/icons/hidden.png')}
              style={styles.eyeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
      {errorMsg && (
        <Text 
          variant="caption" 
          color="error"
          style={[styles.error, isRTL && styles.errorRTL]}
        >
          {errorMsg}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', marginBottom: theme.spacing.sm },
  label: {
    fontSize: theme.typography.fontSize.sm,
    marginBottom: 4,
  },
  labelRTL: {
    textAlign: 'right',
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
  },
  inputRTL: {
    writingDirection: 'rtl',
  },
  eyeIcon: {
    width: 20,
    height: 20,
  },
  error: {
    fontSize: theme.typography.fontSize.xs,
    marginTop: 4,
  },
  errorRTL: {
    textAlign: 'right',
  },
});