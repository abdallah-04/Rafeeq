import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/components/modal/shared/Text';
import { theme } from '@/theme';

const { colors, spacing, typography } = theme;

interface FooterProps {
    onLanguagePress?: () => void;
    onPrivacyPress?: () => void;
    onTermsPress?: () => void;
    currentLanguage?: string;
}

export default function Footer({
    onLanguagePress,
    onPrivacyPress,
    onTermsPress,
    currentLanguage = 'English (US)',
}: FooterProps) {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onLanguagePress}>
                <Text style={styles.link}>🌐 {currentLanguage} ∨</Text>
            </TouchableOpacity>
            
            <View style={styles.linksRow}>
                <TouchableOpacity onPress={onPrivacyPress}>
                    <Text style={styles.link}>Privacy Policy</Text>
                </TouchableOpacity>
                
                <Text style={styles.dot}>·</Text>
                
                <TouchableOpacity onPress={onTermsPress}>
                    <Text style={styles.link}>Terms of Service</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xl,
    },
    
    linksRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    
    link: {
        fontSize: typography.fontSize.xs,
        color: colors.textMuted,
    },
    
    dot: {
        fontSize: typography.fontSize.xs,
        color: colors.textMuted,
    },
});