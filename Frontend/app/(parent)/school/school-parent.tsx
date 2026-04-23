import React, { useMemo, useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { theme } from '@/theme'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/Appstore'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import TabBar from '@/components/modal/shared/TabBar'
import Card from '@/components/modal/shared/Card'
import { Text } from '@/components/modal/shared/Text'
import SchoolCard from '@/components/modal/parent/schoolCard'

type TabKey = 'grades' | 'homework' | 'progress' | 'reports'

export default function SchoolScreen() {
    const { t } = useTranslation()
    const isRTL = useAppStore((state) => state.isRTL)
    const [activeTab, setActiveTab] = useState<TabKey>('grades')

    const tabs = useMemo(
        () => [
            { key: 'grades', label: t('schoolPage.tabs.grades') },
            { key: 'homework', label: t('schoolPage.tabs.homework') },
            { key: 'progress', label: t('schoolPage.tabs.progress') },
            { key: 'reports', label: t('schoolPage.tabs.reports') },
        ],
        [t]
    )

    const gradeCards = useMemo(
        () => [
            { subject: t('schoolPage.cards.subjects.arabic'), score: 92 },
            { subject: t('schoolPage.cards.subjects.math'), score: 92 },
            { subject: t('schoolPage.cards.subjects.science'), score: 92 },
        ],
        [t]
    )

    const handleTabChange = (tab: string) => {
        const nextTab = tab as TabKey

        if (nextTab === 'progress') router.replace('/(parent)/school/school-progress')
        else if (nextTab === 'reports') router.replace('/(parent)/school/school-reports')
        else if (nextTab === 'homework') router.replace('/(parent)/school/school-hw-tasks')
        else setActiveTab('grades')
    }

    return (
        <ScreenWrapper padded={false} scroll={false}>
            <Header
                title={t('schoolPage.title')}
                subtitle={t('schoolPage.cards.childSubtitle', { name: 'Ayoub', grade: '4' })}
                onBack={() => router.back()}
            />

            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <SchoolCard
                    schoolName={t('school.home.title')}
                    grade={t('schoolPage.gradeLabel', { grade: '4 - A' })}
                    location={t('schoolPage.cards.location')}
                />

                <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

                <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
                    <Text variant="heading">{t('schoolPage.grades.comingUp')}</Text>
                    <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
                </View>

                <View style={styles.gradesGrid}>
                    {gradeCards.map((item, index) => (
                        <Card key={index} variant="outlined" padded={false} style={styles.gradeCard}>
                            <Text variant="caption" style={styles.gradeSubject}>{item.subject}</Text>
                            <Text variant="heading" style={styles.gradeScore}>
                                {item.score}<Text style={styles.gradeTotal}>/100</Text>
                            </Text>
                        </Card>
                    ))}
                </View>

                <Text variant="heading" style={[styles.upcomingTitle, isRTL && styles.textRTL]}>
                    {t('schoolPage.upcoming')}
                </Text>
                <Card variant="default" style={[styles.upcomingCard, isRTL && styles.upcomingCardRTL]}>
                    <View style={styles.upcomingIconBox} />
                    <View style={styles.upcomingBody}>
                        <Text style={[styles.upcomingTitleText, isRTL && styles.textRTL]}>
                            {t('schoolPage.hwTasks.readingHw')}
                        </Text>
                        <Text variant="caption" style={[styles.upcomingSubtitle, isRTL && styles.textRTL]}>
                            {t('schoolPage.hwTasks.lesson', { number: 7 })}
                        </Text>
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
    content: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.lg,
    },
    sectionHeaderRTL: {
        flexDirection: 'row-reverse',
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
        textAlign: 'center',
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
    upcomingTitle: { marginTop: theme.spacing.xl, textAlign: 'left' },
    upcomingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.sm,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
        padding: theme.spacing.md,
    },
    upcomingCardRTL: {
        flexDirection: 'row-reverse',
    },
    upcomingIconBox: {
        width: 40,
        height: 40,
        backgroundColor: theme.colors.primaryLighter,
        borderRadius: theme.radius.md,
        marginEnd: theme.spacing.sm,
    },
    upcomingBody: {
        flex: 1,
    },
    upcomingTitleText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        color: theme.colors.textPrimary,
        textAlign: 'left',
    },
    upcomingSubtitle: { color: theme.colors.textSecondary, textAlign: 'left' },
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
    textRTL: {
        textAlign: 'right',
    },
})
