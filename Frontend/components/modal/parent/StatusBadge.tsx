import React from 'react'
import { View, StyleSheet } from 'react-native'
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
    { label: string; bg: string; text: string }
    > = {
    repeat:      { label: '⟳ Repeat',    bg: '#D1FAE5', text: '#059669' },
    start:       { label: '▶ Start',      bg: '#DBEAFE', text: '#2563EB' },
    completed:   { label: 'Completed',    bg: '#D1FAE5', text: '#059669' },
    in_progress: { label: 'In progress',  bg: '#DBEAFE', text: '#2563EB' },
    new:         { label: 'New',          bg: '#FEF3C7', text: '#D97706' },
    later:       { label: 'Later',        bg: '#FEF3C7', text: '#D97706' },
}

export default function StatusBadge({ variant }: StatusBadgeProps) {
    const config = BADGE_CONFIG[variant]

    return (
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
        <Text style={[styles.label, { color: config.text }]}>
            {config.label}
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