import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Text } from './Text';
import { theme } from '@/theme';

type Props = {
    onPress?: () => void;
};

export default function BackButton({ onPress }: Props) {
    const handlePress = () => {
        if (onPress) {
        onPress();
        } else {
        router.back();
        }
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.7}>
        <Text style={styles.icon}>←</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 36,
        height: 36,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.textPrimary,
    },
});