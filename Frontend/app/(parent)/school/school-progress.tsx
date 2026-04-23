import React, { useMemo, useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { theme } from '@/theme'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/Appstore'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import TabBar from '@/components/modal/shared/TabBar'
import ProgressSummary from '@/components/modal/parent/ProgressSummary'
import Card from '@/components/modal/shared/Card'
import { Text } from '@/components/modal/shared/Text'
import SchoolCard from '@/components/modal/parent/schoolCard'

type TabKey = 'grades' | 'homework' | 'progress' | 'reports'

export default function ProgressReport() {
    const { t } = useTranslation()
    const isRTL = useAppStore((state) => state.isRTL)
    const [activeTab, setActiveTab] = useState<TabKey>('progress')

    const tabs = useMemo(
        () => [
            { key: 'grades', label: t('schoolPage.tabs.grades') },
            { key: 'homework', label: t('schoolPage.tabs.homework') },
            { key: 'progress', label: t('schoolPage.tabs.progress') },
            { key: 'reports', label: t('schoolPage.tabs.reports') },
        ],
        [t]
    )

    const skills = useMemo(
        () => [
            { label: t('schoolPage.cards.subjects.arabic'), percentage: 79, color: '#3B82F6' },
            { label: t('schoolPage.cards.subjects.math'), percentage: 59, color: '#F59E0B' },
            { label: t('schoolPage.cards.subjects.science'), percentage: 85, color: '#A855F7' },
        ],
        [t]
    )

    const handleTabChange = (tab: string) => {
        const nextTab = tab as TabKey

        if (nextTab === 'grades') router.replace('/(parent)/school/school-parent')
        else if (nextTab === 'homework') router.replace('/(parent)/school/school-hw-tasks')
        else if (nextTab === 'reports') router.replace('/(parent)/school/school-reports')
        else setActiveTab('progress')
    }

    return (
        <ScreenWrapper padded={false} scroll={false}>
            <Header
                title={t('schoolPage.tabs.progress')}
                subtitle={t('schoolPage.progress.trackingSubtitle')}
                onBack={() => router.replace('/(parent)/school/school-parent')}
            />

            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <SchoolCard
                    schoolName={t('school.home.title')}
                    grade={t('schoolPage.gradeLabel', { grade: '4 - A' })}
                    location={t('schoolPage.cards.location')}
                />

                <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

                <Card variant="elevated" style={[styles.banner, isRTL && styles.bannerRTL]}>
                    <View style={styles.bannerBody}>
                        <Text style={[styles.bannerTitle, isRTL && styles.textRTL]}>{t('schoolPage.progress.overall')}</Text>
                        <Text style={[styles.bannerSub, isRTL && styles.textRTL]}>{t('schoolPage.progress.semester')}</Text>
                    </View>
                    <Text style={styles.percentageText}>81%</Text>
                </Card>

                <ProgressSummary title={t('schoolPage.progress.homeworkCompletion')} items={skills} />

                <Text variant="heading" style={[styles.notesTitle, isRTL && styles.textRTL]}>
                    {t('schoolPage.progress.teacherNote')}
                </Text>
                <Card variant="outlined" style={styles.noteCard}>
                    <Text style={[styles.noteTitle, isRTL && styles.textRTL]}>
                        {t('schoolPage.progress.teacherNote')} - {t('schoolPage.progress.lastWeek')}
                    </Text>
                    <Text style={[styles.noteBody, isRTL && styles.textRTL]}>
                        {t('schoolPage.progress.noteBody')}
                    </Text>
                    <Text style={[styles.noteAuthor, isRTL && styles.textRTL]}>
                        {t('schoolPage.cards.teacherAuthor', { name: t('schoolPage.cards.teacherName'), date: t('schoolPage.cards.reportDate') })}
                    </Text>
                </Card>
            </ScrollView>
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    scroll: { flex: 1 },
    content: {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.xl,
    },
    banner: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        borderWidth: 0,
    },
    bannerRTL: {
        flexDirection: 'row-reverse',
    },
    bannerBody: {
        flex: 1,
    },
    bannerTitle: {
        color: theme.colors.textWhite,
        fontSize: 20,
        fontFamily: theme.typography.fontFamily.bold,
        textAlign: 'left',
    },
    bannerSub: {
        color: theme.colors.textWhite,
        opacity: 0.8,
        fontSize: theme.typography.fontSize.sm,
        textAlign: 'left',
    },
    percentageText: {
        color: theme.colors.textWhite,
        fontSize: 32,
        fontFamily: theme.typography.fontFamily.bold,
    },
    notesTitle: {
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.sm,
        textAlign: 'left',
    },
    noteCard: {
        padding: theme.spacing.lg,
        marginTop: theme.spacing.xs,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    noteTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        marginBottom: theme.spacing.xs,
        textAlign: 'left',
    },
    noteBody: {
        color: theme.colors.textSecondary,
        fontSize: theme.typography.fontSize.sm,
        lineHeight: 18,
        textAlign: 'left',
    },
    noteAuthor: {
        color: theme.colors.textMuted,
        fontSize: theme.typography.fontSize.xs,
        marginTop: theme.spacing.md,
        textAlign: 'right',
    },
    textRTL: {
        textAlign: 'right',
    },
})
