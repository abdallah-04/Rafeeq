import { Colors, Radius, Spacing } from "@/theme";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
      <Card variant="elevated" padded style={styles.card}>
        <View style={styles.cardRow}>
          <Avatar name={teacher.name} size="md" />
          <View style={styles.cardInfo}>
            <View style={styles.cardTopRow}>
              <Text variant="body" style={styles.teacherName}>{teacher.name}</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>{t('teachers.active')}</Text>
              </View>
            </View>
            <Badge label={`${teacher.childCount} ${t('teachers.children')}`} variant="blue" />
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
        source={require("@/assets/images/mascot/rafeeq_clabbing.png")}
        style={styles.emptyIllustration}
        resizeMode="contain"
      />
      <Image
        source={require("@/assets/images/mascot/rafeeq_clabbing.png")}
        style={styles.emptyPenguin}
        resizeMode="contain"
      />
      <Text variant="heading" style={styles.emptyTitle}>{t('teachers.emptyTitle')}</Text>
      <Text variant="caption" color="textSecondary" style={styles.emptySubtitle}>
        {t('teachers.emptySubtitle')}
      </Text>
      <View style={styles.ghostCard} />
      <View style={styles.ghostCard} />
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

  const AddButton = (
    <TouchableOpacity
      style={styles.addBtn}
      onPress={() => router.push('/(school)/add-teacher')}
    >
      <Text style={styles.addBtnText}>+</Text>
    </TouchableOpacity>
  )

  return (
    <ScreenWrapper scroll={false} padded={false}>
      <StatusBar style="dark" />
      <Header title={t('teachers.title')} rightElement={AddButton} />

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
  teacherName: {
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
  emptyIllustration: {
    width: 120,
    height: 120,
  },
  emptyPenguin: {
    width: 80,
    height: 80,
    marginTop: -20,
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
    height: 72,
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
    height: 72,
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
