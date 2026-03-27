import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../constants';

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 4,
  onComplete,
  error,
  containerStyle,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (otp.every(digit => digit !== '')) {
      onComplete(otp.join(''));
    }
  }, [otp]);

  const handleChange = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length === 0) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (numericText.length === 1) {
      const newOtp = [...otp];
      newOtp[index] = numericText;
      setOtp(newOtp);
      
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (numericText.length === length) {
      const newOtp = numericText.split('').slice(0, length);
      setOtp(newOtp);
      inputRefs.current[length - 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '') {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const getBoxStyle = (index: number) => {
    if (error) {
      return [styles.box, styles.boxError];
    }
    if (focusedIndex === index) {
      return [styles.box, styles.boxFocused];
    }
    if (otp[index] !== '') {
      return [styles.box, styles.boxFilled];
    }
    return styles.box;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.boxesContainer}>
        {Array(length)
          .fill(0)
          .map((_, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={getBoxStyle(index)}
              value={otp[index]}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              textAlign="center"
            />
          ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  boxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  box: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.otpBoxBorder,
    backgroundColor: colors.otpBoxEmpty,
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  boxFocused: {
    borderColor: colors.otpBoxFocused,
    backgroundColor: colors.white,
  },
  boxFilled: {
    borderColor: colors.otpBoxFilled,
    backgroundColor: colors.white,
  },
  boxError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.error,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});