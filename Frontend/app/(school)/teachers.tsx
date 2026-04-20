import React, { useState } from 'react'
import { Image, ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/theme'
import { Text } from '@/components/modal/shared/Text'
import { Button } from '@/components/modal/shared/Button'
import Card from '@/components/modal/shared/Card'
import Header from '@/components/modal/shared/Header'
import Avatar from '@/components/modal/shared/Avatar'
import Badge from '@/components/modal/shared/Badge'
import ProgressBar from '@/components/modal/shared/progressBar'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'

const { colors, spacing, radius } = theme

const MOCK_TEACHERS = [
  { id: '1', name: 'Ahmad Sami', childCount: 3, progress: 62 },
  { id: '2', name: 'Tala Kamal', childCount: 5, progress: 78 },
  { id: '3', name: 'Mohammad Rami', childCount: 4, progress: 45 },
  { id: '4', name: 'Layla Hani', childCount: 2, progress: 90 },
]

function TeacherCard({ teacher, t }: { teacher: typeof MOCK_TEACHERS[0]; t: any }) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/(school)/teacher/${teacher.id}` as any)}
      activeOpacity={0.7}
    >
      <Card variant="elevated" style={styles.teacherCard}>
        <View style={styles.cardRow}>
          <Avatar name={teacher.name} size="md" />

          <View style={styles.cardInfo}>
            <View style={styles.cardTopRow}>
              <Text variant="label" color="textPrimary">{teacher.name}</Text>
              <Badge label={t('teachers.active')} variant="green" />
            </View>

            <Badge
              label={`${teacher.childCount} ${t('teachers.children')}`}
              variant="blue"
            />

            <View style={styles.progressContainer}>
              <ProgressBar value={teacher.progress} height={6} showLabel={false} />
              <Text variant="caption" color="textSecondary" style={styles.progressText}>
                {teacher.progress}%
              </Text>
            </View>
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
        source={require('@/assets/images/mascot/rafeeq_clabbing.png')}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text variant="heading" color="textPrimary" style={styles.centered}>
        {t('teachers.emptyTitle')}
      </Text>
      <Text variant="caption" color="textSecondary" style={styles.emptySubtitle}>
        {t('teachers.emptySubtitle')}
      </Text>

      <Button
        label={t('teachers.addFirst')}
        onPress={() => router.push('/(school)/add-teacher')}
        style={styles.ctaBtn}
      />
    </View>
  )
}

export default function TeachersScreen() {
  const { t } = useTranslation()
  const [teachers] = useState(MOCK_TEACHERS)
  const isEmpty = teachers.length === 0

  return (
    <ScreenWrapper>
      <StatusBar style="dark" />
      
      <Header
        title={t('teachers.title')}
        onBack={() => router.back()}
      />
      
      <Text style={styles.subtitle}>
        {t('school.teachers.subtitle')}
      </Text>

      <Card variant="elevated" style={styles.mainCard}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isEmpty ? (
            <EmptyState t={t} />
          ) : (
            <View style={styles.list}>
              {teachers.map(teacher => (
                <TeacherCard key={teacher.id} teacher={teacher} t={t} />
              ))}
              
              {/* Add Teacher Button */}
              <TouchableOpacity
                style={styles.addTeacherCard}
                onPress={() => router.push('/(school)/add-teacher')}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={32} color={colors.primary} />
                <Text variant="caption" color="primary" style={styles.addText}>
                  {t('teachers.addTeacher')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </Card>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  subtitle: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
  },
  mainCard: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  teacherCard: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
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
  progressContainer: {
    marginTop: spacing.xs,
  },
  progressText: {
    textAlign: 'right',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  emptyImage: {
    width: 120,
    height: 120,
  },
  centered: {
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },
  ctaBtn: {
    width: '100%',
    marginTop: spacing.sm,
  },
  addTeacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 72,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.backgroundLight,
    marginTop: spacing.xs,
  },
  addText: {
    fontFamily: theme.typography.fontFamily.medium,
  },
})