import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { theme } from '@/theme'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import TabBar from '@/components/modal/shared/TabBar'
import Card from '@/components/modal/shared/Card'
import { Text } from '@/components/modal/shared/Text'

const TABS = ['Grades', 'HW & Tasks', 'Progress', 'Reports']

export default function TeacherReports() {
  const [activeTab, setActiveTab] = useState('Reports')
  const [filter, setFilter] = useState<'unread' | 'read'>('unread')
  const [selectedReport, setSelectedReport] = useState<number | null>(null)

  const handleTabChange = (tab: string) => {
    if (tab === 'Grades') router.replace('/(parent)/school/school-parent')
    else if (tab === 'HW & Tasks') router.replace('/(parent)/school/school-parent')
    else if (tab === 'Progress') router.replace('/(parent)/school/school-progress')
    else setActiveTab(tab)
  }

  return (
    <ScreenWrapper scroll={false}>
      <Header
        title="Teacher Reports"
        subtitle="3 unread reports"
        onBack={() => router.replace('/(parent)/school/school-parent')}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Toggle Filter */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, filter === 'unread' && styles.activeToggle]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.toggleText, filter === 'unread' && styles.activeText]}>
              Unread (3)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, filter === 'read' && styles.activeToggle]}
            onPress={() => setFilter('read')}
          >
            <Text style={[styles.toggleText, filter === 'read' && styles.activeText]}>
              Read
            </Text>
          </TouchableOpacity>
        </View>

        <Text variant="heading" style={styles.sectionTitle}>New</Text>

        {[1, 2, 3].map((_, i) => (
          <TouchableOpacity key={i} onPress={() => setSelectedReport(i)} activeOpacity={0.8}>
            <Card
              variant="default"
              style={selectedReport === i
                ? { ...styles.reportCard, backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                : styles.reportCard}
            >
              <View style={[styles.avatarCircle, selectedReport === i && { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.teacherName, selectedReport === i && { color: theme.colors.textWhite }]}>
                  Ms. Sara Mahmoud - Math
                </Text>
                <Text style={[styles.reportPreview, selectedReport === i && { color: 'rgba(255,255,255,0.85)' }]}>
                  Zaid did well on the term test overall, but we notice difficulty with fractions...
                </Text>
                <Text style={[styles.timestamp, selectedReport === i && { color: 'rgba(255,255,255,0.7)' }]}>Today, 8:30 AM</Text>
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

  sectionTitle: { marginVertical: theme.spacing.md },

  reportCard: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primaryLighter,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.full,
    marginRight: theme.spacing.sm,
  },
  teacherName: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primaryDark,
    fontSize: 14,
  },
  reportPreview: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  timestamp: {
    color: theme.colors.textMuted,
    fontSize: 10,
    marginTop: theme.spacing.xs,
  },
})
