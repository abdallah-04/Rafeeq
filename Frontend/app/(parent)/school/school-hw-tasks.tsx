import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { theme } from '@/theme'
import { useTranslation } from 'react-i18next'
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

const TABS = ['Grades', 'HW & Tasks', 'Progress', 'Reports']

const HW_ITEMS: Item[] = [
  { subject: 'Arabic', title: 'Reading Homework', lesson: 'Lesson 7', due: 'Tomorrow', status: 'pending' },
  { subject: 'Math', title: 'Fractions Worksheet', lesson: 'Chapter 3', due: 'In 2 days', status: 'pending' },
  { subject: 'Science', title: 'Plant Diagram', lesson: 'Unit 2', due: 'Next week', status: 'submitted' },
]

const TASK_ITEMS: Item[] = [
  { subject: 'Arabic', title: 'Oral Recitation', due: 'Tomorrow', status: 'pending' },
  { subject: 'Math', title: 'Times Table Practice', due: 'Today', status: 'submitted' },
]

export default function HWTasksScreen() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('HW & Tasks')
  const [filter, setFilter] = useState<'hw' | 'tasks'>('hw')

  const handleTabChange = (tab: string) => {
    if (tab === 'Grades') router.replace('/(parent)/school/school-parent')
    else if (tab === 'Progress') router.replace('/(parent)/school/school-progress')
    else if (tab === 'Reports') router.replace('/(parent)/school/school-reports')
    else setActiveTab(tab)
  }

  const items = filter === 'hw' ? HW_ITEMS : TASK_ITEMS

  return (
    <ScreenWrapper scroll={false}>
      <Header
        title={t('schoolPage.tabs.homework')}
        subtitle="Ayoub, grade 4"
        onBack={() => router.replace('/(parent)/school/school-parent')}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <SchoolCard
          schoolName={t('school.home.title')}
          grade={t('schoolPage.gradeLabel', { grade: '4 - A' })}
          location="Amman"
        />

        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Filter Toggle */}
        <View style={styles.toggleContainer}>
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

        <View style={styles.sectionHeader}>
          <Text variant="heading">{t('schoolPage.grades.comingUp')}</Text>
          <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
        </View>

        {items.map((item, i) => {
          const isPending = item.status === 'pending'
          return (
            <Card key={i} variant="default" style={styles.hwCard}>
              <View style={[styles.subjectTag, { backgroundColor: isPending ? theme.colors.primaryLighter : theme.colors.backgroundLight }]}>
                <Text style={[styles.subjectText, { color: isPending ? theme.colors.primary : theme.colors.textMuted }]}>
                  {item.subject}
                </Text>
              </View>
              <View style={styles.hwInfo}>
                <Text style={styles.hwTitle}>{item.title}</Text>
                {'lesson' in item && (
                  <Text variant="caption" style={styles.hwLesson}>{item.lesson}</Text>
                )}
                <View style={styles.hwMeta}>
                  <Text style={styles.dueText}>📅 {item.due}</Text>
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

  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.radius.lg,
    padding: 4,
    marginTop: theme.spacing.lg,
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
  },
  hwLesson: {
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  hwMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  dueText: {
    fontSize: 11,
    color: theme.colors.textMuted,
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
})
