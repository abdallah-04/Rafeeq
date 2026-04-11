import React from 'react';
import { TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

const { colors } = theme;

type Props = {
    onPress?: () => void;
};

export default function BackButton({ onPress }: Props) {
    // Arrow points right in RTL, left in LTR
    const icon = I18nManager.isRTL ? 'chevron-forward' : 'chevron-back';

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityLabel="Back"
        >
            <Ionicons name={icon} size={22} color={colors.primary} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
});
