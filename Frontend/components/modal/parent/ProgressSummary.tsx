import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Text } from '@/components/RNText'
import { theme } from '@/theme'

export interface SkillItem {
    label: string
    percentage: number
    color: string
    }

    interface ProgressSummaryProps {
    title: string
    items: SkillItem[]
    onViewDetails?: () => void
    }

    export default function ProgressSummary({
    title,
    items,
    onViewDetails,
    }: ProgressSummaryProps) {
    return (
        <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <Text style={styles.title}>
            <Text style={styles.icon}>🎯 </Text>
            {title}
            </Text>
            {onViewDetails && (
            <TouchableOpacity onPress={onViewDetails} accessibilityRole="link">
                <Text style={styles.viewDetails}>View Details</Text>
            </TouchableOpacity>
            )}
        </View>

        {/* Skills */}
        <View style={styles.skills}>
            {items.map((item, i) => {
            const clampedPct = Math.min(100, Math.max(0, item.percentage))
            return (
                <View key={i} style={styles.skillRow}>
                    
                <View style={styles.skillMeta}>
                    <Text style={styles.skillLabel}>{item.label}</Text>
                    <Text style={[styles.skillPct, { color: item.color }]}>
                    {clampedPct}%
                    </Text>
                </View>
                {/* Progress bar */}
                <View style={styles.trackBg}>
                    <View
                    style={[
                        styles.trackFill,
                        { width: `${clampedPct}%`, backgroundColor: item.color },
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
    title: {
        fontSize: 16,
        fontFamily: 'Lexend_700Bold',
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    icon: {
        fontSize: 16,
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
    skillLabel: {
        fontSize: 12,
        fontFamily: 'Lexend_600SemiBold',
        fontWeight: '600',
        color: theme.colors.textSecondary,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
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
    })