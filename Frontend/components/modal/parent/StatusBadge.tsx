import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/RNText'

export type BadgeVariant =
    | 'repeat'
    | 'start'
    | 'completed'
    | 'in_progress'
    | 'new'
    | 'later'

interface StatusBadgeProps {
    variant: BadgeVariant
}

const BADGE_CONFIG: Record<
    BadgeVariant,
    { bg: string; text: string; labelKey: string; fallback: string }
> = {
    repeat: { labelKey: 'common.repeat', fallback: 'Repeat', bg: '#D1FAE5', text: '#059669' },
    start: { labelKey: 'common.start', fallback: 'Start', bg: '#DBEAFE', text: '#2563EB' },
    completed: { labelKey: 'common.completed', fallback: 'Completed', bg: '#D1FAE5', text: '#059669' },
    in_progress: { labelKey: 'common.inProgress', fallback: 'In Progress', bg: '#DBEAFE', text: '#2563EB' },
    new: { labelKey: 'common.new', fallback: 'New', bg: '#FEF3C7', text: '#D97706' },
    later: { labelKey: 'quizzes.status.later', fallback: 'Later', bg: '#FEF3C7', text: '#D97706' },
}

export default function StatusBadge({ variant }: StatusBadgeProps) {
    const { t } = useTranslation()
    const config = BADGE_CONFIG[variant]

    return (
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
            <Text style={[styles.label, { color: config.text }]}>
                {t(config.labelKey, config.fallback)}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    label: {
        fontSize: 12,
        fontFamily: 'Lexend_600SemiBold',
        fontWeight: '600',
    },
})
