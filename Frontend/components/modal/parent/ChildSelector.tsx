import React from 'react'
import {
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    ImageSourcePropType,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/RNText'
import { theme } from '@/theme'
import { useAppStore } from '@/store/Appstore'

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
    const { t } = useTranslation()
    const isRTL = useAppStore((state) => state.isRTL)

    return (
        <TouchableOpacity
            style={[styles.container, isRTL && styles.containerRTL]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            accessibilityRole={onPress ? 'button' : 'none'}
            accessibilityLabel={`${name}, ${t('myChildren.years', { age })}`}
        >
            <Image source={avatar} style={styles.avatar} />

            <View style={styles.info}>
                <Text style={[styles.name, isRTL && styles.textRTL]}>
                    {name}, {t('myChildren.years', { age })}
                </Text>
                <View style={[styles.badges, isRTL && styles.badgesRTL]}>
                    {badges.map((badge, index) => (
                        <View
                            key={index}
                            style={[styles.badge, { backgroundColor: `${badge.color}33` }]}
                        >
                            <Text style={[styles.badgeText, { color: badge.color }]}>
                                {badge.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {onPress && <Text style={styles.arrow}>{isRTL ? '<' : '>'}</Text>}
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
    containerRTL: {
        flexDirection: 'row-reverse',
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
        textAlign: 'left',
    },
    textRTL: {
        textAlign: 'right',
    },
    badges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    badgesRTL: {
        flexDirection: 'row-reverse',
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
