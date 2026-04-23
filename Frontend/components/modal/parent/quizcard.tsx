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
import StatusBadge, { BadgeVariant } from '@/components/modal/parent/StatusBadge'
import { useAppStore } from '@/store/Appstore'

interface QuizCardProps {
    icon: ImageSourcePropType
    iconBgColor: string
    iconTintColor?: string
    title: string
    questionsCount: number
    durationMinutes: number
    status: BadgeVariant
    onPress: () => void
}

export default function QuizCard({
    icon,
    iconBgColor,
    iconTintColor,
    title,
    questionsCount,
    durationMinutes,
    status,
    onPress,
}: QuizCardProps) {
    const { t } = useTranslation()
    const isRTL = useAppStore((state) => state.isRTL)

    return (
        <TouchableOpacity
            style={[styles.card, isRTL && styles.cardRTL]}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={title}
        >
            <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
                <Image
                    source={icon}
                    style={[styles.icon, iconTintColor ? { tintColor: iconTintColor } : undefined]}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.info}>
                <Text style={[styles.title, isRTL && styles.textRTL]} numberOfLines={1}>
                    {title}
                </Text>
                <Text style={[styles.meta, isRTL && styles.textRTL]}>
                    {questionsCount} {t('quizzes.questions')} - {durationMinutes} {t('quizzes.mins')}
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
    cardRTL: {
        flexDirection: 'row-reverse',
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
        textAlign: 'left',
    },
    meta: {
        fontSize: 12,
        fontFamily: 'Lexend_400Regular',
        color: theme.colors.textMuted,
        textAlign: 'left',
    },
    textRTL: {
        textAlign: 'right',
    },
})
