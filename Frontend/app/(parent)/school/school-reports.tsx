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

type TabKey = 'grades' | 'homework' | 'progress' | 'reports'

export default function TeacherReports() {
    const { t } = useTranslation()
    const isRTL = useAppStore((state) => state.isRTL)
    const [activeTab, setActiveTab] = useState<TabKey>('reports')
    const [filter, setFilter] = useState<'unread' | 'read'>('unread')
    const [selectedReport, setSelectedReport] = useState<number | null>(null)

    const tabs = useMemo(
        () => [
            { key: 'grades', label: t('schoolPage.tabs.grades') },
            { key: 'homework', label: t('schoolPage.tabs.homework') },
            { key: 'progress', label: t('schoolPage.tabs.progress') },
            { key: 'reports', label: t('schoolPage.tabs.reports') },
        ],
        [t]
    )

    const reports = useMemo(
        () => [0, 1, 2].map((index) => ({
            id: index,
            teacherName: t('schoolPage.cards.teacherName'),
            teacherSubject: t('schoolPage.cards.subjects.math'),
            time: t('schoolPage.cards.reportTime'),
        })),
        [t]
    )

    const handleTabChange = (tab: string) => {
        const nextTab = tab as TabKey

        if (nextTab === 'grades') router.replace('/(parent)/school/school-parent')
        else if (nextTab === 'homework') router.replace('/(parent)/school/school-hw-tasks')
        else if (nextTab === 'progress') router.replace('/(parent)/school/school-progress')
        else setActiveTab('reports')
    }

    return (
        <ScreenWrapper padded={false} scroll={false}>
            <Header
                title={t('schoolPage.reports.title')}
                subtitle={t('schoolPage.reports.unreadCount', { count: 3 })}
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
                        style={[styles.toggleBtn, filter === 'unread' && styles.activeToggle]}
                        onPress={() => setFilter('unread')}
                    >
                        <Text style={[styles.toggleText, filter === 'unread' && styles.activeText]}>
                            {t('schoolPage.reports.unread')} (3)
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, filter === 'read' && styles.activeToggle]}
                        onPress={() => setFilter('read')}
                    >
                        <Text style={[styles.toggleText, filter === 'read' && styles.activeText]}>
                            {t('schoolPage.reports.read')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text variant="heading" style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                    {t('common.new')}
                </Text>

                {reports.map((report) => (
                    <TouchableOpacity key={report.id} onPress={() => setSelectedReport(report.id)} activeOpacity={0.8}>
                        <Card
                            variant="default"
                            style={selectedReport === report.id
                                ? { ...styles.reportCard, backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                : styles.reportCard}
                        >
                            <View style={[styles.reportRow, isRTL && styles.reportRowRTL]}>
                                <View style={[styles.avatarCircle, selectedReport === report.id && { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                                <View style={styles.reportBody}>
                                    <Text style={[styles.teacherName, isRTL && styles.textRTL, selectedReport === report.id && { color: theme.colors.textWhite }]}>
                                        {t('schoolPage.cards.teacherWithSubject', {
                                            name: report.teacherName,
                                            subject: report.teacherSubject,
                                        })}
                                    </Text>
                                    <Text style={[styles.reportPreview, isRTL && styles.textRTL, selectedReport === report.id && { color: 'rgba(255,255,255,0.85)' }]}>
                                        {t('schoolPage.reports.previewText')}
                                    </Text>
                                    <Text style={[styles.timestamp, isRTL && styles.textRTL, selectedReport === report.id && { color: 'rgba(255,255,255,0.7)' }]}>
                                        {t('schoolPage.reports.todayTime', { time: report.time })}
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    </TouchableOpacity>
                ))}
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
    sectionTitle: {
        marginVertical: theme.spacing.md,
        textAlign: 'left',
    },
    reportCard: {
        marginBottom: theme.spacing.md,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.primaryLighter,
        borderWidth: 1,
        borderColor: theme.colors.primaryLight,
    },
    reportRow: {
        flexDirection: 'row',
    },
    reportRowRTL: {
        flexDirection: 'row-reverse',
    },
    avatarCircle: {
        width: 40,
        height: 40,
        backgroundColor: theme.colors.primaryLight,
        borderRadius: theme.radius.full,
        marginEnd: theme.spacing.sm,
    },
    reportBody: {
        flex: 1,
    },
    teacherName: {
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.primaryDark,
        fontSize: 14,
        textAlign: 'left',
    },
    reportPreview: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginTop: 4,
        textAlign: 'left',
    },
    timestamp: {
        color: theme.colors.textMuted,
        fontSize: 10,
        marginTop: theme.spacing.xs,
        textAlign: 'left',
    },
    textRTL: {
        textAlign: 'right',
    },
})
