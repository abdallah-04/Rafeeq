import React from 'react'
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ImageSourcePropType,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { theme } from '@/theme'
import StatusBadge, { BadgeVariant } from '@/components/modal/parent/StatusBadge'

interface QuizCardProps {
    icon: ImageSourcePropType
    iconBgColor: string
    iconTintColor?: string
    title: string
    questionsCount: number
    durationMinutes: number
    metaText?: string
    status: BadgeVariant
    onPress: () => void
    disabled?: boolean
}

export default function QuizCard({
    icon,
    iconBgColor,
    iconTintColor,
    title,
    questionsCount,
    durationMinutes,
    metaText,
    status,
    onPress,
    disabled = false,
    }: QuizCardProps) {
    const { t } = useTranslation()

    return (
        <TouchableOpacity
        style={[styles.card, disabled && styles.cardDisabled]}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled }}
        >
        <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
            <Image source={icon} style={[styles.icon, iconTintColor ? { tintColor: iconTintColor } : undefined]} resizeMode="contain" />
        </View>

        <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
            {title}
            </Text>
            <Text style={styles.meta}>
            {metaText ?? t('quiz.meta', {
                count: questionsCount,
                minutes: durationMinutes,
                defaultValue: `${questionsCount} questions · ${durationMinutes} mins`,
            })}
            </Text>
        </View>

        <StatusBadge variant={status} />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.spacing.md,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardDisabled: {
        opacity: 0.6,
    },
    iconBox: {
        width: 52,
        height: 52,
        borderRadius: theme.radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: 30,
        height: 30,
    },
    info: {
        flex: 1,
        gap: 4,
    },
    title: {
        fontSize: 15,
        fontFamily: 'Lexend_700Bold',
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    meta: {
        fontSize: 12,
        fontFamily: 'Lexend_400Regular',
        color: theme.colors.textMuted,
    },
})
