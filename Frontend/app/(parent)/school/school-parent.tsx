import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { theme } from '@/theme'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'

import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import TabBar from '@/components/modal/shared/TabBar'
import Card from '@/components/modal/shared/Card'
import { Text } from '@/components/modal/shared/Text'
import SchoolCard from '@/components/modal/parent/schoolCard'

const TABS = ['Grades', 'HW & Tasks', 'Progress', 'Reports']

export default function SchoolScreen() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('Grades')

    const handleTabChange = (tab: string) => {
        if (tab === 'Progress') router.replace('/(parent)/school/school-progress')
        else if (tab === 'Reports') router.replace('/(parent)/school/school-reports')
        else if (tab === 'HW & Tasks') router.replace('/(parent)/school/school-hw-tasks')
        else setActiveTab(tab)
    }

    return (
        <ScreenWrapper scroll={false}>
            <Header
                title={t('schoolPage.title')}
                subtitle="Ayoub, grade 4"
                onBack={() => router.back()}
            />

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                <SchoolCard
                    schoolName={t('school.home.title')}
                    grade={t('schoolPage.gradeLabel', { grade: '4 - A' })}
                    location="Amman"
                />

                <TabBar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

                {/* Grades Section */}
                <View style={styles.sectionHeader}>
                    <Text variant="heading">{t('schoolPage.grades.comingUp')}</Text>
                    <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
                </View>

                <View style={styles.gradesGrid}>
                    {['Arabic', 'Math', 'Science'].map((subject, i) => (
                        <Card key={i} variant="outlined" padded={false} style={styles.gradeCard}>
                            <Text variant="caption" style={styles.gradeSubject}>{subject}</Text>
                            <Text variant="heading" style={styles.gradeScore}>
                                92<Text style={styles.gradeTotal}>/100</Text>
                            </Text>
                        </Card>
                    ))}
                </View>

                {/* Upcoming Section */}
                <Text variant="heading" style={styles.upcomingTitle}>{t('schoolPage.upcoming')}</Text>
                <Card variant="default" style={styles.upcomingCard}>
                    <View style={styles.upcomingIconBox} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.upcomingTitleText}>{t('schoolPage.hwTasks.readingHw')}</Text>
                        <Text variant="caption" style={styles.upcomingSubtitle}>{t('schoolPage.hwTasks.lesson', { number: 7 })}</Text>
                    </View>
                    <View style={styles.tomorrowBadge}>
                        <Text style={styles.tomorrowText}>{t('schoolPage.tomorrow')}</Text>
                    </View>
                </Card>
            </ScrollView>
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    scroll: { flex: 1 },

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
        marginEnd: theme.spacing.sm,
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
