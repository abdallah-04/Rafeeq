import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { theme } from '@/theme'
import { useTranslation } from 'react-i18next'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import TabBar from '@/components/modal/shared/TabBar'
import ProgressSummary from '@/components/modal/parent/ProgressSummary'
import Card from '@/components/modal/shared/Card'
import { Text } from '@/components/modal/shared/Text'
import SchoolCard from '@/components/modal/parent/schoolCard'

const TABS = ['Grades', 'HW & Tasks', 'Progress', 'Reports']

const SKILLS = [
  { label: 'Arabic', percentage: 79, color: '#3B82F6' },
  { label: 'Math', percentage: 59, color: '#F59E0B' },
  { label: 'Science', percentage: 85, color: '#A855F7' },
]

export default function ProgressReport() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('Progress')

  const handleTabChange = (tab: string) => {
    if (tab === 'Grades') router.replace('/(parent)/school/school-parent')
    else if (tab === 'HW & Tasks') router.replace('/(parent)/school/school-hw-tasks')
    else if (tab === 'Reports') router.replace('/(parent)/school/school-reports')
    else setActiveTab(tab)
  }

  return (
    <ScreenWrapper scroll={false}>
      <Header
        title={t('schoolPage.tabs.progress')}
        subtitle={t('schoolPage.progress.trackingSubtitle')}
        onBack={() => router.replace('/(parent)/school/school-parent')}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <SchoolCard
          schoolName={t('school.home.title')}
          grade={t('schoolPage.gradeLabel', { grade: '4 - A' })}
          location="Amman"
        />

        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Overall Banner */}
        <Card variant="elevated" style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>{t('schoolPage.progress.overall')}</Text>
            <Text style={styles.bannerSub}>{t('schoolPage.progress.semester')}</Text>
          </View>
          <Text style={styles.percentageText}>81%</Text>
        </Card>

        <ProgressSummary title={t('schoolPage.progress.homeworkCompletion')} items={SKILLS} />

        {/* Teacher Notes Section */}
        <Text variant="heading" style={styles.notesTitle}>{t('schoolPage.progress.teacherNote')}</Text>
        <Card variant="outlined" style={styles.noteCard}>
          <Text style={styles.noteTitle}>💬 {t('schoolPage.progress.teacherNote')} - {t('schoolPage.progress.lastWeek')}</Text>
          <Text style={styles.noteBody}>
            {t('schoolPage.progress.noteBody')}
          </Text>
          <Text style={styles.noteAuthor}>Ms. Sara Mahmoud - Mar 28</Text>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, paddingTop: theme.spacing.sm },

  banner: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 0,
  },
  bannerTitle: {
    color: theme.colors.textWhite,
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.bold,
  },
  bannerSub: {
    color: theme.colors.textWhite,
    opacity: 0.8,
    fontSize: theme.typography.fontSize.sm,
  },
  percentageText: {
    color: theme.colors.textWhite,
    fontSize: 32,
    fontFamily: theme.typography.fontFamily.bold,
  },

  notesTitle: { marginTop: theme.spacing.xl, marginBottom: theme.spacing.sm },

  noteCard: {
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  noteTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    marginBottom: theme.spacing.xs,
  },
  noteBody: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 18,
  },
  noteAuthor: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.md,
    textAlign: 'right',
  },
})
