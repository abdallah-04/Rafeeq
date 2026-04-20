import React from 'react';
import { SafeAreaView, View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/modal/shared/Text';
import Avatar from '@/components/modal/shared/Avatar';
import Badge from '@/components/modal/shared/Badge';
import Card from '@/components/modal/shared/Card';
import ProgressBar from '@/components/modal/shared/progressBar';
import Mascot from '@/components/modal/shared/mascot';
import { theme } from '@/theme';
import { TEACHER_STUDENTS, type TeacherStudent } from '../_students';

// ─── Sub-components ──────────────────────────────────────────────────────────

function StudentCard({
  student,
  onPress,
}: {
  student: TeacherStudent;
  onPress: (s: TeacherStudent) => void;
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const levelNum = student.level.replace('Level ', '');

  return (
    <TouchableOpacity onPress={() => onPress(student)} activeOpacity={0.75}>
      <Card variant="elevated" style={styles.studentCard}>

        {/* Top row: avatar + info */}
        <View style={[styles.row, isRTL && styles.rowReverse, styles.cardTop]}>
          <Avatar name={isRTL ? student.nameAr : student.name} size="md" />

          <View style={styles.cardInfo}>
            {/* Name + active badge */}
            <View style={[styles.row, isRTL && styles.rowReverse, styles.nameRow]}>
              <Text variant="label" numberOfLines={1} style={styles.studentNameText}>
                {isRTL ? student.nameAr : student.name}
              </Text>
              <Badge label={t('teacher.studentCard.active', 'Active')} variant="green" />
            </View>

            {/* Level + condition tags */}
            <View style={[styles.row, isRTL && styles.rowReverse, styles.tagsRow]}>
              <Badge
                label={t('teacher.studentCard.level', { level: levelNum })}
                variant="blue"
              />
              <Badge label={student.condition} variant="purple" />
            </View>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <ProgressBar value={student.progress} showLabel={false} height={7} />
          </View>
          <Text variant="caption" color="primary" style={styles.progressLabel}>
            {student.progress}%
          </Text>
        </View>

      </Card>
    </TouchableOpacity>
  );
}

function AddStudentCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="outlined" style={styles.ghostCard}>
        <View style={styles.row}>
          <Avatar name="+" size="md" />
          <View style={styles.ghostLines}>
            <View style={styles.ghostLine1} />
            <View style={styles.ghostLine2} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function TeacherHomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const handleStudentPress = (student: TeacherStudent) =>
    router.push({
      pathname: '/(teacher)/student-quick-access',
      params: { studentId: student.id },
    });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mascot */}
        <Mascot pose="rafeeq" size="md" />

        {/* Welcome */}
        <View style={styles.welcomeBlock}>
          <Text
            variant="heading"
            style={[styles.welcomeText, isRTL && styles.textRight]}
          >
            {t('teacher.home.greeting', 'Hello,')}
            {'\n'}
            <Text variant="heading" color="primary">
              {t('teacher.profile.name', 'Mr. Ahmad')}
            </Text>
          </Text>
        </View>

        {/* My Students section */}
        <Card variant="elevated" style={styles.studentsCard}>
          <Text variant="label" color="primary" style={styles.sectionTitle}>
            {t('teacher.home.myStudents', 'MY STUDENTS')}
          </Text>

          {TEACHER_STUDENTS.map((s) => (
            <StudentCard key={s.id} student={s} onPress={handleStudentPress} />
          ))}

          <AddStudentCard onPress={() => router.push('/(teacher)/add-student')} />
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },

  // Layout helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },

  // Welcome
  welcomeBlock: {
    paddingHorizontal: theme.spacing.sm,
  },
  welcomeText: {
    lineHeight: 36,
  },
  textRight: {
    textAlign: 'right',
  },

  // Students section card
  studentsCard: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  },

  // Student card
  studentCard: {
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
  studentNameText: {
    flexShrink: 1,
  },
  tagsRow: {
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
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
  ghostLines: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  ghostLine1: {
    width: '70%',
    height: 10,
    backgroundColor: theme.colors.primaryLighter,
    borderRadius: theme.radius.full,
  },
  ghostLine2: {
    width: '50%',
    height: 8,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.radius.full,
  },
});