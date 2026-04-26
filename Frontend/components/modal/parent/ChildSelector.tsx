import React from 'react'
import {
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    ImageSourcePropType,
    I18nManager,
} from 'react-native'
import { theme } from '@/theme'
import { Text } from '@/components/modal/shared/Text'

export interface Badge {
    label: string
    color: string
}

interface ChildSelectorProps {
    name: string
    age: number
    avatar: ImageSourcePropType
    badges: Badge[]
    onPress?: () => void
    }

export default function ChildSelector({
    name,
    age,
    avatar,
    badges,
    onPress,
    }: ChildSelectorProps) {
    return (
        <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        accessibilityRole={onPress ? 'button' : 'none'}
        accessibilityLabel={`${name}, ${age} years old`}
        >
        {/* Avatar */}
        <Image source={avatar} style={styles.avatar} />

        {/* Info */}
        <View style={styles.info}>
            <Text style={styles.name}>
            {name}, {age} years
            </Text>
            <View style={styles.badges}>
            {badges.map((badge, i) => (
                <View
                key={i}
                style={[styles.badge, { backgroundColor: badge.color + '33' }]}
                >
                <Text style={[styles.badgeText, { color: badge.color }]}>
                    {badge.label}
                </Text>
                </View>
            ))}
            </View>
        </View>

        {onPress && (
            <Text style={styles.arrow}>{I18nManager.isRTL ? '‹' : '›'}</Text>
        )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        marginHorizontal: theme.spacing.xl,
        marginVertical: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.spacing.md,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EEF4FF',
    },
    info: {
        flex: 1,
        gap: 6,
    },
    name: {
        fontSize: 15,
        fontFamily: 'Lexend_600SemiBold',
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    badges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 11,
        fontFamily: 'Lexend_500Medium',
        fontWeight: '500',
    },
    arrow: {
        fontSize: 22,
        color: theme.colors.textMuted,
        fontWeight: '300',
    },
})