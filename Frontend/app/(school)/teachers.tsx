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

const { colors, spacing, radius } = theme

const MOCK_TEACHERS = [
  { id: '1', name: 'Ahmad Sami', childCount: 3, progress: 62 },
  { id: '2', name: 'Tala Kamal', childCount: 5, progress: 78 },
]

function TeacherCard({ teacher, t }: { teacher: typeof MOCK_TEACHERS[0]; t: any }) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/(school)/teacher/${teacher.id}` as any)}
      activeOpacity={0.7}
    >
      <Card variant="elevated" style={styles.card}>
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

            <ProgressBar value={teacher.progress} height={6} showLabel={false} />
            <Text variant="caption" color="textSecondary" style={styles.progressText}>
              {teacher.progress}%
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

      <Card variant="outlined" padded={false} style={styles.ghostCard}>{null}</Card>
      <Card variant="outlined" padded={false} style={styles.ghostCard}>{null}</Card>

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
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <Header
        title={t('teachers.title')}
        onBack={() => router.back()}
        rightElement={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/(school)/add-teacher')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color={colors.white} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {isEmpty ? (
          <EmptyState t={t} />
        ) : (
          <View style={styles.list}>
            {teachers.map(tc => <TeacherCard key={tc.id} teacher={tc} t={t} />)}

            <TouchableOpacity
              style={styles.ghostCardAdd}
              onPress={() => router.push('/(school)/add-teacher')}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
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
  progressText: {
    textAlign: 'right',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
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
  ghostCard: {
    width: '100%',
    height: 72,
    borderStyle: 'dashed',
    backgroundColor: colors.backgroundLight,
  },
  ctaBtn: {
    width: '100%',
    marginTop: spacing.sm,
  },
  ghostCardAdd: {
    height: 72,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
