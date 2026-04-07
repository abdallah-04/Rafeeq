import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/modal/shared/Text'
import { Button } from '@/components/modal/shared/Button'
import Card from '@/components/modal/shared/Card'
import Avatar from '@/components/modal/shared/Avatar'
import Badge from '@/components/modal/shared/Badge'
import ProgressBar from '@/components/modal/shared/progressBar'
import Header from '@/components/modal/shared/Header'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import { theme } from '@/theme'
import { StatusBar } from 'expo-status-bar'

const { colors, spacing, typography, radius } = theme

type Difficulty = 'ADD' | 'ADHD' | 'IFD'

interface Student {
  id: string
  name: string
  level: number
  difficulty: Difficulty
  progress: number
}

const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Ayoub Maher', level: 3, difficulty: 'ADD',  progress: 62 },
  { id: '2', name: 'Mona Ramzi',  level: 5, difficulty: 'ADHD', progress: 78 },
  { id: '3', name: 'Nagham Marq', level: 1, difficulty: 'IFD',  progress: 45 },
]

const DIFFICULTY_BADGE: Record<Difficulty, 'blue' | 'purple' | 'orange'> = {
  ADD:  'blue',
  ADHD: 'purple',
  IFD:  'orange',
}

function StudentCard({ student }: { student: Student }) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/(school)/student/${student.id}` as any)}
      activeOpacity={0.7}
    >
      <Card variant="elevated" padded style={styles.card}>
        <View style={styles.cardRow}>
          <Avatar name={student.name} size="md" />
          <View style={styles.cardInfo}>
            <View style={styles.cardTopRow}>
              <Text variant="body" style={styles.studentName}>{student.name}</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>
            <View style={styles.tagsRow}>
              <Badge label={`Level ${student.level}`} variant="blue" />
              <Badge label={student.difficulty} variant={DIFFICULTY_BADGE[student.difficulty]} />
            </View>
            <ProgressBar value={student.progress} height={6} showLabel={false} />
            <Text variant="caption" color="textSecondary" style={styles.progressText}>
              {student.progress}%
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  )
}

function EmptyState({ t }: { t: any }) {
  return (
    <View style={styles.emptyContainer}>
      <Image
        source={require('@/assets/images/mascot/rafeeq_waving.png')}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text variant="heading" style={styles.emptyTitle}>{t('students.emptyTitle')}</Text>
      <Text variant="caption" color="textSecondary" style={styles.emptySubtitle}>
        {t('students.emptySubtitle')}
      </Text>
      <View style={styles.ghostCard} />
      <View style={styles.ghostCard} />
      <Button
        label={t('students.addFirst')}
        onPress={() => router.push('/(school)/add-student')}
        style={styles.ctaBtn}
      />
    </View>
  )
}

export default function StudentsScreen() {
  const { t } = useTranslation()
  const [students] = useState(MOCK_STUDENTS)
  const isEmpty = students.length === 0

  const AddButton = (
    <TouchableOpacity
      style={styles.addBtn}
      onPress={() => router.push('/(school)/add-student')}
    >
      <Text style={styles.addBtnText}>+</Text>
    </TouchableOpacity>
  )

  return (
    <ScreenWrapper scroll={false} padded={false}>
      <StatusBar style="dark" />
      <Header title={t('students.title')} rightElement={AddButton} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {isEmpty ? (
          <EmptyState t={t} />
        ) : (
          <View style={styles.list}>
            {students.map(s => <StudentCard key={s.id} student={s} />)}
            <TouchableOpacity
              style={styles.ghostCardAdd}
              onPress={() => router.push('/(school)/add-student')}
            >
              <Text style={styles.ghostPlus}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },

  /* Card */
  card: {
    gap: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentName: {
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  activeBadge: {
    backgroundColor: colors.successLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  activeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.success,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progressText: {
    textAlign: 'right',
    marginTop: 2,
  },

  /* Add button in header */
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 22,
    color: colors.white,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 26,
  },

  /* Empty state */
  emptyContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  emptyImage: {
    width: 120,
    height: 120,
  },
  emptyTitle: {
    textAlign: 'center',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },
  ghostCard: {
    width: '100%',
    height: 88,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surfaceElevated,
  },
  ctaBtn: {
    width: '100%',
    marginTop: spacing.sm,
  },
  ghostCardAdd: {
    height: 88,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostPlus: {
    fontSize: 28,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
  },
})
