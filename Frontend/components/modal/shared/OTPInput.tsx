import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { theme } from '@/theme';

type Props = {
    length?: number;
    value: string[];
    onChange: (otp: string[]) => void;
    onComplete?: (otp: string) => void;
    error?: boolean;
    };

export default function OTPInput({ 
    length = 4, 
    value, 
    onChange, 
    onComplete,
    error = false 
    }: Props) {
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const inputs = useRef<Array<TextInput | null>>([]);

    // Reset focused state when value changes from outside
    useEffect(() => {
        if (value.every(digit => digit !== '')) {
        onComplete?.(value.join(''));
        }
    }, [value]);

    const handleChange = (text: string, index: number) => {
        if (text.length > 1) {
        const digits = text.replace(/\D/g, '').slice(0, length).split('');
        const newOtp = [...value];
        digits.forEach((d, i) => {
            if (i < length) newOtp[i] = d;
        });
        onChange(newOtp);
        const nextFocus = Math.min(digits.length, length - 1);
        inputs.current[nextFocus]?.focus();
        return;
    }

    const newOtp = [...value];
    newOtp[index] = text;
    onChange(newOtp);

    if (text && index < length - 1) {
        inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
        inputs.current[index - 1]?.focus();
        }
    };

    return (
        <View style={[styles.container, { gap: theme.spacing.md }]}>
        {value.map((digit, index) => (
            <TextInput
            key={index}
            ref={(ref) => {
                inputs.current[index] = ref;
            }}
            style={[
                styles.input,
                digit ? styles.filled : styles.empty,
                focusedIndex === index && styles.focused,
                error && styles.errorInput,
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            textContentType="oneTimeCode"
            />
        ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    input: {
        width: 62,
        height: 62,
        borderWidth: 1.5,
        borderRadius: theme.radius.lg,
        textAlign: 'center',
        fontSize: theme.typography.fontSize.xl,
        fontFamily: theme.typography.fontFamily.bold,
    },
    empty: {
        backgroundColor: theme.colors.backgroundLight,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary,
    },
    filled: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
        color: theme.colors.textWhite,
    },
    focused: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
    },
    errorInput: {
        borderColor: theme.colors.error,
    },
});