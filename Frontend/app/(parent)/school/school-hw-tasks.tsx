import React, { useMemo, useState } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { theme } from '@/theme'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/Appstore'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import TabBar from '@/components/modal/shared/TabBar'
import Card from '@/components/modal/shared/Card'
import { Text } from '@/components/modal/shared/Text'
import SchoolCard from '@/components/modal/parent/schoolCard'

interface Item {
    subject: string
    title: string
    due: string
    status: 'pending' | 'submitted'
    lesson?: string
}

type TabKey = 'grades' | 'homework' | 'progress' | 'reports'

export default function HWTasksScreen() {
    const { t } = useTranslation()
    const isRTL = useAppStore((state) => state.isRTL)
    const [activeTab, setActiveTab] = useState<TabKey>('homework')
    const [filter, setFilter] = useState<'hw' | 'tasks'>('hw')

    const tabs = useMemo(
        () => [
            { key: 'grades', label: t('schoolPage.tabs.grades') },
            { key: 'homework', label: t('schoolPage.tabs.homework') },
            { key: 'progress', label: t('schoolPage.tabs.progress') },
            { key: 'reports', label: t('schoolPage.tabs.reports') },
        ],
        [t]
    )

    const hwItems = useMemo<Item[]>(
        () => [
            {
                subject: t('schoolPage.cards.subjects.arabic'),
                title: t('schoolPage.hwTasks.readingHw'),
                lesson: t('schoolPage.hwTasks.lesson', { number: 7 }),
                due: t('schoolPage.tomorrow'),
                status: 'pending',
            },
            {
                subject: t('schoolPage.cards.subjects.math'),
                title: t('schoolPage.cards.hw.fractionsWorksheet'),
                lesson: t('schoolPage.cards.hw.chapter', { number: 3 }),
                due: t('schoolPage.cards.hw.inDays', { count: 2 }),
                status: 'pending',
            },
            {
                subject: t('schoolPage.cards.subjects.science'),
                title: t('schoolPage.cards.hw.plantDiagram'),
                lesson: t('schoolPage.cards.hw.unit', { number: 2 }),
                due: t('schoolPage.cards.hw.nextWeek'),
                status: 'submitted',
            },
        ],
        [t]
    )

    const taskItems = useMemo<Item[]>(
        () => [
            {
                subject: t('schoolPage.cards.subjects.arabic'),
                title: t('schoolPage.cards.tasks.oralRecitation'),
                due: t('schoolPage.tomorrow'),
                status: 'pending',
            },
            {
                subject: t('schoolPage.cards.subjects.math'),
                title: t('schoolPage.cards.tasks.timesTablePractice'),
                due: t('homework.today'),
                status: 'submitted',
            },
        ],
        [t]
    )

    const handleTabChange = (tab: string) => {
        const nextTab = tab as TabKey

        if (nextTab === 'grades') router.replace('/(parent)/school/school-parent')
        else if (nextTab === 'progress') router.replace('/(parent)/school/school-progress')
        else if (nextTab === 'reports') router.replace('/(parent)/school/school-reports')
        else setActiveTab('homework')
    }

    const items = filter === 'hw' ? hwItems : taskItems

    return (
        <ScreenWrapper padded={false} scroll={false}>
            <Header
                title={t('schoolPage.tabs.homework')}
                subtitle={t('schoolPage.cards.childSubtitle', { name: 'Ayoub', grade: '4' })}
                onBack={() => router.replace('/(parent)/school/school-parent')}
            />

            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <SchoolCard
                    schoolName={t('school.home.title')}
                    grade={t('schoolPage.gradeLabel', { grade: '4 - A' })}
                    location={t('schoolPage.cards.location')}
                />

                <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

                <View style={[styles.toggleContainer, isRTL && styles.toggleContainerRTL]}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, filter === 'hw' && styles.activeToggle]}
                        onPress={() => setFilter('hw')}
                    >
                        <Text style={[styles.toggleText, filter === 'hw' && styles.activeText]}>
                            {t('schoolPage.hwTasks.homework')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, filter === 'tasks' && styles.activeToggle]}
                        onPress={() => setFilter('tasks')}
                    >
                        <Text style={[styles.toggleText, filter === 'tasks' && styles.activeText]}>
                            {t('schoolPage.hwTasks.tasks')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
                    <Text variant="heading">{t('schoolPage.grades.comingUp')}</Text>
                    <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
                </View>

                {items.map((item, index) => {
                    const isPending = item.status === 'pending'

                    return (
                        <Card key={index} variant="default" style={[styles.hwCard, isRTL && styles.hwCardRTL]}>
                            <View style={[styles.subjectTag, { backgroundColor: isPending ? theme.colors.primaryLighter : theme.colors.backgroundLight }]}>
                                <Text style={[styles.subjectText, { color: isPending ? theme.colors.primary : theme.colors.textMuted }]}>
                                    {item.subject}
                                </Text>
                            </View>
                            <View style={styles.hwInfo}>
                                <Text style={[styles.hwTitle, isRTL && styles.textRTL]}>{item.title}</Text>
                                {item.lesson ? (
                                    <Text variant="caption" style={[styles.hwLesson, isRTL && styles.textRTL]}>{item.lesson}</Text>
                                ) : null}
                                <View style={[styles.hwMeta, isRTL && styles.hwMetaRTL]}>
                                    <Text style={[styles.dueText, isRTL && styles.textRTL]}>{item.due}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: isPending ? theme.colors.primaryLighter : '#D1FAE5' }]}>
                                        <Text style={[styles.statusText, { color: isPending ? theme.colors.primary : '#059669' }]}>
                                            {isPending ? t('schoolPage.hwTasks.pending') : t('schoolPage.hwTasks.submitted')}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </Card>
                    )
                })}
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
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.backgroundLight,
        borderRadius: theme.radius.lg,
        padding: 4,
        marginTop: theme.spacing.lg,
    },
    toggleContainerRTL: {
        flexDirection: 'row-reverse',
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
        borderRadius: theme.radius.md,
    },
    activeToggle: { backgroundColor: theme.colors.primary },
    activeText: { color: theme.colors.textWhite },
    toggleText: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.medium,
        color: theme.colors.textSecondary,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.sm,
    },
    sectionHeaderRTL: {
        flexDirection: 'row-reverse',
    },
    seeAll: {
        color: theme.colors.primary,
        fontSize: theme.typography.fontSize.xs,
        fontFamily: theme.typography.fontFamily.regular,
    },
    hwCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.sm,
        padding: theme.spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
    },
    hwCardRTL: {
        flexDirection: 'row-reverse',
    },
    subjectTag: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
        borderRadius: theme.radius.md,
        marginEnd: theme.spacing.sm,
        alignSelf: 'flex-start',
    },
    subjectText: {
        fontSize: 11,
        fontFamily: theme.typography.fontFamily.bold,
    },
    hwInfo: { flex: 1 },
    hwTitle: {
        fontFamily: theme.typography.fontFamily.semiBold,
        color: theme.colors.textPrimary,
        fontSize: theme.typography.fontSize.sm,
        textAlign: 'left',
    },
    hwLesson: {
        color: theme.colors.textSecondary,
        marginTop: 2,
        textAlign: 'left',
    },
    hwMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: theme.spacing.xs,
    },
    hwMetaRTL: {
        flexDirection: 'row-reverse',
    },
    dueText: {
        fontSize: 11,
        color: theme.colors.textMuted,
        textAlign: 'left',
    },
    statusBadge: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: theme.radius.lg,
    },
    statusText: {
        fontSize: 10,
        fontFamily: theme.typography.fontFamily.bold,
    },
    textRTL: {
        textAlign: 'right',
    },
})
