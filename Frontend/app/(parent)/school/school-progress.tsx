import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native'
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
import { useActiveChildStore } from '@/store/activeChildStore'
import { apiGetChildSummary, apiGetNotesForParent, ChildSummaryResponse, NoteResponse } from '@/services/api'

const TABS = ['Grades', 'HW & Tasks', 'Progress', 'Reports']

export default function ProgressReport() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [activeTab, setActiveTab] = useState('Progress')
  const [summary, setSummary] = useState<ChildSummaryResponse | null>(null)
  const [notes, setNotes] = useState<NoteResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const activeChild = useActiveChildStore((s) => s.activeChild)

  const load = useCallback(async () => {
    if (!activeChild) { setIsLoading(false); return }
    try {
      const [s, n] = await Promise.all([
        apiGetChildSummary(activeChild.id),
        apiGetNotesForParent(activeChild.id),
      ])
      setSummary(s); setNotes(n)
    } catch { /* silently show empty */ }
    finally { setIsLoading(false); setRefreshing(false) }
  }, [activeChild?.id])

  useEffect(() => { load() }, [load])

  const handleTabChange = (tab: string) => {
    if (tab === 'Grades')        router.replace('/(parent)/school/school-parent' as any)
    else if (tab === 'HW & Tasks') router.replace('/(parent)/school/school-hw-tasks' as any)
    else if (tab === 'Reports')    router.replace('/(parent)/school/school-reports' as any)
    else setActiveTab(tab)
  }

  const childName  = activeChild?.fullNameAr ?? activeChild?.fullNameEn ?? '—'
  const level      = summary?.assessedLevel ?? activeChild?.level ?? null
  const levelPct   = level ? Math.min(level * 20, 100) : 0
  const skills     = level ? [{ label: t('schoolPage.progress.assessedLevel','Assessed Level'), percentage: levelPct, color: '#3B82F6' }] : []

  return (
    <ScreenWrapper scroll={false}>
      <Header title={t('schoolPage.tabs.progress')} subtitle={t('schoolPage.progress.trackingSubtitle')}
        onBack={() => router.replace('/(parent)/school/school-parent' as any)} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} />}>
        <SchoolCard schoolName={t('school.home.title')} grade={childName} location="" />
        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />
        ) : (
          <>
            <Card variant="elevated" style={styles.banner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>{t('schoolPage.progress.overall')}</Text>
                <Text style={styles.bannerSub}>{summary?.status ?? t('schoolPage.progress.semester')}</Text>
              </View>
              <Text style={styles.percentageText}>{level ? `L${level}` : '—'}</Text>
            </Card>
            {skills.length > 0 && <ProgressSummary title={t('schoolPage.progress.homeworkCompletion')} items={skills} />}
            {notes.length > 0 && (
              <>
                <Text variant="heading" style={styles.notesTitle}>{t('schoolPage.progress.teacherNote')}</Text>
                {notes.slice(0, 3).map((note) => (
                  <Card key={note.id} variant="outlined" style={styles.noteCard}>
                    <Text style={styles.noteTitle}>💬 {note.title}</Text>
                    <Text style={styles.noteBody}>{note.content}</Text>
                    <Text style={styles.noteAuthor}>{note.createdAt ? new Date(note.createdAt).toLocaleDateString(isRTL ? 'ar-JO' : 'en-GB') : ''}</Text>
                  </Card>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, paddingTop: theme.spacing.sm },
  banner: { backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.lg, marginBottom: theme.spacing.lg, borderWidth: 0 },
  bannerTitle: { color: theme.colors.textWhite, fontSize: 20, fontFamily: theme.typography.fontFamily.bold },
  bannerSub: { color: theme.colors.textWhite, opacity: 0.8, fontSize: theme.typography.fontSize.sm },
  percentageText: { color: theme.colors.textWhite, fontSize: 32, fontFamily: theme.typography.fontFamily.bold },
  notesTitle: { marginTop: theme.spacing.xl, marginBottom: theme.spacing.sm },
  noteCard: { padding: theme.spacing.lg, marginTop: theme.spacing.xs, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.sm },
  noteTitle: { fontFamily: theme.typography.fontFamily.bold, marginBottom: theme.spacing.xs },
  noteBody: { color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm, lineHeight: 18 },
  noteAuthor: { color: theme.colors.textMuted, fontSize: theme.typography.fontSize.xs, marginTop: theme.spacing.md, textAlign: 'right' },
})