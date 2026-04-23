import React from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { theme } from '@/theme'
import Card from '@/components/modal/shared/Card'
import { Text } from '@/components/modal/shared/Text'
import { useAppStore } from '@/store/Appstore'

interface SchoolCardProps {
    schoolName: string
    grade: string
    location: string
}

export default function SchoolCard({ schoolName, grade, location }: SchoolCardProps) {
    const isRTL = useAppStore((state) => state.isRTL)

    return (
        <Card variant="elevated" style={[styles.card, isRTL && styles.cardRTL]}>
            <View style={styles.iconBox}>
                <Image
                    source={require('@/assets/images/icons/school-icon.png')}
                    style={styles.icon}
                />
            </View>
            <View style={styles.textBlock}>
                <Text variant="heading" style={[styles.name, isRTL && styles.textRTL]}>{schoolName}</Text>
                <Text style={[styles.grade, isRTL && styles.textRTL]}>{grade}</Text>
                <Text style={[styles.location, isRTL && styles.textRTL]}>{location}</Text>
            </View>
        </Card>
    )
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginVertical: theme.spacing.lg,
        backgroundColor: theme.colors.primary,
        borderWidth: 0,
    },
    cardRTL: {
        flexDirection: 'row-reverse',
    },
    iconBox: {
        width: 60,
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: theme.radius.lg,
    },
    icon: {
        width: 60,
        height: 60,
        borderRadius: theme.radius.lg,
    },
    textBlock: { flex: 1 },
    name: { color: theme.colors.textWhite, textAlign: 'left' },
    grade: { color: theme.colors.textWhite, opacity: 0.9, textAlign: 'left' },
    location: { color: theme.colors.textWhite, fontSize: 12, marginTop: 4, textAlign: 'left' },
    textRTL: {
        textAlign: 'right',
    },
})
