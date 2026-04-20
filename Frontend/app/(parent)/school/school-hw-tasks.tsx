import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { theme } from '@/theme'
import { useTranslation } from 'react-i18next'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import TabBar from '@/components/modal/shared/TabBar'
import Card from '@/components/modal/shared/Card'
import { Text } from '@/components/modal/shared/Text'
import SchoolCard from '@/components/modal/parent/schoolCard'
import { useActiveChildStore } from '@/store/activeChildStore'
import { apiGetHomeworkForParent, HomeworkResponse } from '@/services/api'

const TABS = ['Grades', 'HW & Tasks', 'Progress', 'Reports']

export default function HWTasksScreen() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [activeTab, setActiveTab] = useState('HW & Tasks')
  const [hwList, setHwList] = useState<HomeworkResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const activeChild = useActiveChildStore((s) => s.activeChild)

  const load = useCallback(async () => {
    if (!activeChild) { setIsLoading(false); return }
    try { setHwList(await apiGetHomeworkForParent(activeChild.id)) }
    catch { /* silently show empty */ }
    finally { setIsLoading(false); setRefreshing(false) }
  }, [activeChild?.id])

  useEffect(() => { load() }, [load])

  const handleTabChange = (tab: string) => {
    if (tab === 'Grades')   router.replace('/(parent)/school/school-parent' as any)
    else if (tab === 'Progress') router.replace('/(parent)/school/school-progress' as any)
    else if (tab === 'Reports')  router.replace('/(parent)/school/school-reports' as any)
    else setActiveTab(tab)
  }

  const childName = activeChild?.fullNameAr ?? activeChild?.fullNameEn ?? '—'
  const statusColor = (status: string) => (status === 'SUBMITTED' || status === 'GRADED') ? '#22C55E' : '#F97316'

  return (
    <ScreenWrapper scroll={false}>
      <Header title={t('schoolPage.tabs.homework')} subtitle={childName}
        onBack={() => router.replace('/(parent)/school/school-parent' as any)} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} />}>
        <SchoolCard schoolName={t('school.home.title')} grade={childName} location="" />
        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />
        ) : hwList.length === 0 ? (
          <Text variant="caption" color="textSecondary" style={{ textAlign: 'center', marginTop: 40 }}>
            {t('schoolPage.hw.empty', 'No homework assigned yet')}
          </Text>
        ) : (
          <View style={styles.list}>
            {hwList.map((hw) => (
              <Card key={hw.id} variant="default" style={styles.hwCard}>
                <View style={styles.hwTop}>
                  <Text style={styles.hwTitle}>{hw.title}</Text>
                  <View style={[styles.statusDot, { backgroundColor: statusColor(hw.status) }]} />
                </View>
                <Text style={styles.hwDesc}>{hw.description}</Text>
                <Text style={styles.hwDue}>
                  {t('schoolPage.hw.due', 'Due')}: {hw.dueDate ? new Date(hw.dueDate).toLocaleDateString(isRTL ? 'ar-JO' : 'en-GB') : '—'}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  list: { gap: theme.spacing.md, paddingTop: theme.spacing.lg },
  hwCard: { padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
  hwTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hwTitle: { fontFamily: theme.typography.fontFamily.bold, fontSize: 14, color: theme.colors.textPrimary, flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginStart: 8 },
  hwDesc: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18, marginBottom: 6 },
  hwDue: { color: theme.colors.textMuted, fontSize: 11, fontFamily: theme.typography.fontFamily.medium },
})