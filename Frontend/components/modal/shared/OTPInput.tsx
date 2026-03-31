import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors } from '@/constants';

export default function OTPInput() {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const inputs = useRef<Array<TextInput | null>>([]);

    const handleChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 3) {
        inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
        inputs.current[index - 1]?.focus();
        }
    };

    return (
        <View style={styles.container}>
        {otp.map((digit, index) => (
            <TextInput
            key={index}
            ref={(ref) => {inputs.current[index] = ref; }}
            style={[
                styles.input,
                digit ? styles.filled : styles.empty,
                focusedIndex === index && styles.focused,
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            />
        ))}
        </View>
    );
    }

    const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginTop: 20,
    },
    input: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 18,
    },
    empty: {
        backgroundColor: colors.otpBoxEmpty,
        borderColor: colors.otpBoxBorder,
    },
    filled: {
        backgroundColor: colors.otpBoxFilled,
        borderColor: colors.otpBoxBorder,
    },
    focused: {
        borderColor: colors.otpBoxFocused,
    },
});