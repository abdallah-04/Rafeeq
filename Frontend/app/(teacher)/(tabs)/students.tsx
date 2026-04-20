import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/modal/shared/Text';
import { Button } from '@/components/modal/shared/Button';
import Avatar from '@/components/modal/shared/Avatar';
import Badge from '@/components/modal/shared/Badge';
import Card from '@/components/modal/shared/Card';
import ProgressBar from '@/components/modal/shared/progressBar';
import { theme } from '@/theme';
import { TEACHER_STUDENTS } from '../_students';
import { StudentListSkeleton } from '@/components/LoadingSkeleton';

// ─── Types ───────────────────────────────────────────────────────────────────

type Student = (typeof TEACHER_STUDENTS)[number];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StudentCard({ item, onPress, isRTL }: { item: Student; onPress: () => void; isRTL: boolean }) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <Card variant="elevated" style={styles.card}>

        {/* Top row: avatar + info */}
        <View style={[styles.row, isRTL && styles.rowReverse, styles.cardTop]}>
          <Avatar name={isRTL ? item.nameAr : item.name} size="md" />

          <View style={styles.cardInfo}>
            {/* Name + active badge */}
            <View style={[styles.row, isRTL && styles.rowReverse, styles.nameRow]}>
              <Text variant="label" style={styles.studentName}>
                {isRTL ? item.nameAr : item.name}
              </Text>
              <Badge label={t('teacher.studentCard.active', 'Active')} variant="green" />
            </View>

            {/* Level + condition tags */}
            <View style={[styles.row, isRTL && styles.rowReverse, styles.tagsRow]}>
              <Badge
                label={t('teacher.studentCard.level', { level: item.level.replace('Level ', '') })}
                variant="blue"
              />
              <Badge label={item.condition} variant="purple" />
            </View>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <ProgressBar value={item.progress} showLabel={false} height={7} />
          </View>
          <Text variant="caption" color="primary" style={styles.progressLabel}>
            {item.progress}%
          </Text>
        </View>

      </Card>
    </TouchableOpacity>
  );
}

function AddStudentCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <Card variant="outlined" style={styles.ghostCard}>
        <View style={styles.row}>
          <Avatar name="+" size="md" />
          <Text variant="body" color="textMuted">
            {t('teacher.students.addFirst', 'Add a new student')}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function StudentsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <StudentListSkeleton count={3} />;

  const handleAddStudent = () => router.push('/(teacher)/add-student');

  const handleStudentPress = (studentId: string) =>
    router.push({ pathname: '/(teacher)/student-quick-access', params: { studentId } });

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={[styles.row, isRTL && styles.rowReverse, styles.header]}>
        <Text variant="heading">{t('teacher.students.title', 'My Students')}</Text>
        <Button
          label={`+ ${t('teacher.students.add', 'Add')}`}
          onPress={handleAddStudent}
          variant="primary"
          style={styles.addBtn}
        />
      </View>

      <FlatList
        data={TEACHER_STUDENTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <StudentCard
            item={item}
            isRTL={isRTL}
            onPress={() => handleStudentPress(item.id)}
          />
        )}
        ListFooterComponent={<AddStudentCard onPress={handleAddStudent} />}
      />

    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Layout helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },

  // Header
  header: {
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  addBtn: {
    height: 38,
    paddingHorizontal: theme.spacing.md,
  },

  // List
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },

  // Student card
  card: {
    gap: theme.spacing.sm,
  },
  cardTop: {
    gap: theme.spacing.sm,
  },
  cardInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  nameRow: {
    justifyContent: 'space-between',
  },
  studentName: {
    color: theme.colors.textPrimary,
  },
  tagsRow: {
    gap: theme.spacing.xs,
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  progressTrack: {
    flex: 1,
  },
  progressLabel: {
    minWidth: 32,
    textAlign: 'right',
  },

  // Ghost / add card
  ghostCard: {
    borderStyle: 'dashed',
  },
});