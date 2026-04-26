import React from 'react'
import {
    View,
    Image,
    StyleSheet,
    ImageSourcePropType,
    } from 'react-native'
import { useTranslation } from 'react-i18next'
import {theme} from '@/theme'
import { Text } from '@/components/modal/shared/Text'

interface ProgressCardProps {
    childName: string
    monthLabel: string
    description: string
    percentage: number
    mascotImage: ImageSourcePropType
    }

export default function ProgressCard({
    childName,
    monthLabel,
    description,
    percentage,
    mascotImage,
    }: ProgressCardProps) {
    const { i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const clampedPct = Math.min(100, Math.max(0, percentage))

    return (
        <View style={styles.card}>
        <View style={[styles.row, isRTL && styles.rowRTL]}>
            <View style={styles.textBlock}>
            <Text style={[styles.title, isRTL && styles.textRTL]}>
                {childName}'s Progress {monthLabel}
            </Text>
            <Text style={[styles.desc, isRTL && styles.textRTL]} numberOfLines={2}>
                {description}
            </Text>
            </View>
            <Image
            source={mascotImage}
            style={styles.mascot}
            resizeMode="contain"
            />
        </View>
        <View style={styles.progressRow}>
            <View style={styles.trackBg}>
            <View
                style={[styles.trackFill, { width: `${clampedPct}%` }]}
            />
            </View>
            <Text style={styles.pct}>{clampedPct}%</Text>
        </View>
        </View>
    )
    }

    const styles = StyleSheet.create({
    card: {
        marginHorizontal: theme.spacing.sm,
        marginTop: theme.spacing.lg,
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
        gap: theme.spacing.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    rowRTL: {
        flexDirection: 'row-reverse',
    },
    textBlock: {
        flex: 1,
        gap: 4,
    },
    title: {
        fontSize: 15,
        fontFamily: 'Lexend_700Bold',
        fontWeight: '700',
        color: theme.colors.textPrimary,
        lineHeight: 22,
        textAlign: 'left',
    },
    desc: {
        fontSize: 13,
        fontFamily: 'Lexend_400Regular',
        color: theme.colors.textSecondary,
        lineHeight: 19,
        textAlign: 'left',
    },
    textRTL: {
        textAlign: 'right',
    },
    mascot: {
        width: 72,
        height: 72,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    trackBg: {
        flex: 1,
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    trackFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 4,
    },
    pct: {
        fontSize: 13,
        fontFamily: 'Lexend_700Bold',
        fontWeight: '700',
        color: theme.colors.textPrimary,
        minWidth: 36,
        textAlign: 'right',
    },
})
