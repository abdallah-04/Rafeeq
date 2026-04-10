import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { theme } from '@/theme'
import { router } from 'expo-router'

import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import TabBar from '@/components/modal/shared/TabBar'
import BottomNav from '@/components/modal/shared/BottomNav'
import Card from '@/components/modal/shared/Card'
import { Text } from '@/components/modal/shared/Text'

const TABS = ['Grades', 'HW & Tasks', 'Progress', 'Reports']

export default function SchoolScreen() {
    const [activeTab, setActiveTab] = useState('Grades')

    const handleTabChange = (tab: string) => {
        if (tab === 'Progress') router.replace('(parent)/school/school-progress')
        else if (tab === 'Reports') router.replace('(parent)/school/school-reports')
        else setActiveTab(tab)
    }

    return (
        <ScreenWrapper scroll={false}>
        <Header
            title="School"
            subtitle="Ayoub, grade 4"
            onBack={() => router.back()}
        />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* School Info Card */}
            <Card variant="elevated" style={styles.schoolCard}>
            <View style={styles.schoolIconPlaceholder} />
            <View style={styles.schoolTextBlock}>
                <Text variant="heading" style={styles.schoolName}>School name</Text>
                <Text style={styles.schoolInfo}>Grade 4 - A</Text>
                <Text style={styles.schoolLocation}>📍 Amman</Text>
            </View>
            </Card>

            <TabBar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

            {/* Grades Section */}
            <View style={styles.sectionHeader}>
            <Text variant="heading">Current Term Grades</Text>
            <Text style={styles.seeAll}>See all</Text>
            </View>

            <View style={styles.gradesGrid}>
            {['Arabic', 'Arabic', 'Arabic'].map((subject, i) => (
                <Card key={i} variant="outlined" padded={false} style={styles.gradeCard}>
                <Text variant="caption" style={styles.gradeSubject}>{subject}</Text>
                <Text variant="heading" style={styles.gradeScore}>
                    92<Text style={styles.gradeTotal}>/100</Text>
                </Text>
                </Card>
            ))}
            </View>

            {/* Upcoming Section */}
            <Text variant="heading" style={styles.upcomingTitle}>Coming Up This Week</Text>
            <Card variant="default" style={styles.upcomingCard}>
            <View style={styles.upcomingIconBox} />
            <View style={{ flex: 1 }}>
                <Text style={styles.upcomingTitleText}>Reading Homework -</Text>
                <Text variant="caption" style={styles.upcomingSubtitle}>Lesson 7</Text>
            </View>
            <View style={styles.tomorrowBadge}>
                <Text style={styles.tomorrowText}>Tomorrow</Text>
            </View>
            </Card>
        </ScrollView>

        <BottomNav />
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    scroll: { flex: 1, paddingHorizontal: theme.spacing.xl },

    schoolCard: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginVertical: theme.spacing.lg,
        backgroundColor: theme.colors.primary,
        borderWidth: 0,
    },
    schoolIconPlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: theme.radius.lg,
    },
    schoolTextBlock: { flex: 1 },
    schoolName: { color: theme.colors.textWhite },
    schoolInfo: { color: theme.colors.textWhite, opacity: 0.9 },
    schoolLocation: { color: theme.colors.textWhite, fontSize: 12, marginTop: 4 },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.lg,
    },
    seeAll: {
        color: theme.colors.primary,
        fontSize: theme.typography.fontSize.xs,
        fontFamily: theme.typography.fontFamily.regular,
    },

    gradesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.md,
    },
    gradeCard: {
        width: '30%',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    gradeSubject: {
        fontSize: 10,
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
    },
    gradeScore: {
        fontSize: 20,
        color: theme.colors.primary,
    },
    gradeTotal: {
        fontSize: 10,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
    },

    upcomingTitle: { marginTop: theme.spacing.xl },
    upcomingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.sm,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
        padding: theme.spacing.md,
    },
    upcomingIconBox: {
        width: 40,
        height: 40,
        backgroundColor: theme.colors.primaryLighter,
        borderRadius: theme.radius.md,
        marginRight: theme.spacing.sm,
    },
    upcomingTitleText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        color: theme.colors.textPrimary,
    },
    upcomingSubtitle: { color: theme.colors.textSecondary },
    tomorrowBadge: {
        backgroundColor: theme.colors.primaryLighter,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
        borderRadius: theme.radius.lg,
    },
    tomorrowText: {
        color: theme.colors.primary,
        fontSize: 10,
        fontFamily: theme.typography.fontFamily.bold,
    },
})