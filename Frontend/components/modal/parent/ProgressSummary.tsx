import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Text } from '@/components/RNText'
import { theme } from '@/theme'
import { useAppStore } from '@/store/Appstore'

export interface SkillItem {
    label: string
    percentage: number
    color: string
}

interface ProgressSummaryProps {
    title: string
    items: SkillItem[]
    viewDetailsLabel?: string
    onViewDetails?: () => void
}

export default function ProgressSummary({
    title,
    items,
    viewDetailsLabel,
    onViewDetails,
}: ProgressSummaryProps) {
    const isRTL = useAppStore((state) => state.isRTL)

    return (
        <View style={styles.container}>
            <View style={[styles.header, isRTL && styles.headerRTL]}>
                <Text style={[styles.title, isRTL && styles.textRTL]}>{title}</Text>
                {onViewDetails && viewDetailsLabel ? (
                    <TouchableOpacity onPress={onViewDetails} accessibilityRole="link">
                        <Text style={styles.viewDetails}>{viewDetailsLabel}</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            <View style={styles.skills}>
                {items.map((item, index) => {
                    const clampedPct = Math.min(100, Math.max(0, item.percentage))

                    return (
                        <View key={index} style={styles.skillRow}>
                            <View style={[styles.skillMeta, isRTL && styles.skillMetaRTL]}>
                                <Text style={[styles.skillLabel, isRTL && styles.textRTL]}>
                                    {item.label}
                                </Text>
                                <Text style={[styles.skillPct, { color: item.color }]}>
                                    {clampedPct}%
                                </Text>
                            </View>
                            <View style={styles.trackBg}>
                                <View
                                    style={[
                                        styles.trackFill,
                                        { width: `${clampedPct}%`, backgroundColor: item.color },
                                        isRTL && styles.trackFillRTL,
                                    ]}
                                />
                            </View>
                        </View>
                    )
                })}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
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
        marginBottom: theme.spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerRTL: {
        flexDirection: 'row-reverse',
    },
    title: {
        fontSize: 16,
        fontFamily: 'Lexend_700Bold',
        fontWeight: '700',
        color: theme.colors.textPrimary,
        textAlign: 'left',
    },
    viewDetails: {
        fontSize: 13,
        fontFamily: 'Lexend_400Regular',
        color: theme.colors.textSecondary,
    },
    skills: {
        gap: theme.spacing.md,
    },
    skillRow: {
        gap: 6,
    },
    skillMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skillMetaRTL: {
        flexDirection: 'row-reverse',
    },
    skillLabel: {
        fontSize: 12,
        fontFamily: 'Lexend_600SemiBold',
        fontWeight: '600',
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        textAlign: 'left',
    },
    textRTL: {
        textAlign: 'right',
    },
    skillPct: {
        fontSize: 13,
        fontFamily: 'Lexend_700Bold',
        fontWeight: '700',
    },
    trackBg: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    trackFill: {
        height: '100%',
        borderRadius: 4,
    },
    trackFillRTL: {
        alignSelf: 'flex-end',
    },
})
