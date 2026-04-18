import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TEACHER_STUDENTS, type TeacherStudent } from '../_students';

function TeacherStudentCard({
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
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() => onPress(student)}
      activeOpacity={0.75}
    >
      <View style={[styles.cardTop, isRTL && styles.rowReverse]}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: student.avatarBg }]}>
          <Text style={styles.avatarText}>{student.initials}</Text>
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <View style={[styles.cardNameRow, isRTL && styles.rowReverse]}>
            <Text style={styles.studentName}>{isRTL ? student.nameAr : student.name}</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>{t('teacher.studentCard.active', 'Active')}</Text>
            </View>
          </View>
          <View style={[styles.tagsRow, isRTL && styles.rowReverse]}>
            <View
              style={[
                styles.tag,
                { backgroundColor: student.levelColor + '22' },
              ]}
            >
              <Text style={[styles.tagText, { color: student.levelColor }]}>
                {t('teacher.studentCard.level', { level: levelNum })}
              </Text>
            </View>
            <View
              style={[
                styles.tag,
                { backgroundColor: student.conditionColor + '22' },
              ]}
            >
              <Text
                style={[styles.tagText, { color: student.conditionColor }]}
              >
                {student.condition}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${student.progress}%` }]}
          />
        </View>
        <Text style={styles.progressLabel}>{student.progress}%</Text>
      </View>
    </TouchableOpacity>
  );
}

function GhostCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.ghostCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.ghostAvatar}>
        <Text style={styles.ghostPlus}>+</Text>
      </View>
      <View style={styles.ghostLines}>
        <View style={styles.ghostLine1} />
        <View style={styles.ghostLine2} />
      </View>
    </TouchableOpacity>
  );
}

export default function TeacherHomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const handleTeacherStudentPress = (student: TeacherStudent) => {
    router.push({
      pathname: '/(teacher)/student-quick-access',
      params: { studentId: student.id },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

          <View style={styles.penguinBox}>
            <Text style={styles.penguinEmoji}>🐧</Text>
          </View>

        <View style={styles.welcomeBlock}>
          <Text style={[styles.welcomeText, isRTL && styles.textRight]}>
            {t('teacher.home.greeting', 'Hello,')}{'\n'}
            <Text style={styles.welcomeName}>
              {t('teacher.profile.name', 'Mr. Ahmad')}
            </Text>
          </Text>
        </View>

        {/* ── MY STUDENTS card ── */}
        <View style={styles.studentsCard}>
          <Text style={styles.sectionTitle}>
            {t('teacher.home.myStudents', 'MY STUDENTS')}
          </Text>

          {TEACHER_STUDENTS.map((s) => (
            <TeacherStudentCard key={s.id} student={s} onPress={handleTeacherStudentPress} />
          ))}

          <GhostCard onPress={() => router.push('/(teacher)/add-student')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 4,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  logoEN: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 22,
    color: '#508DF7',
    letterSpacing: 2,
    lineHeight: 26,
  },
  logoAR: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 16,
    color: '#BA6DE9',
    textAlign: 'right',
  },
  penguinBox: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  penguinEmoji: {
    fontSize: 48,
  },

  // Welcome
  welcomeBlock: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  welcomeText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 28,
    color: '#1a1a2e',
    lineHeight: 36,
  },
  welcomeName: {
    color: '#508DF7',
  },
  textRight: {
    textAlign: 'right',
  },

  // TeacherStudents card container
  studentsCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 16,
    shadowColor: '#508DF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  sectionTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: '#508DF7',
    letterSpacing: 1.5,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 14,
  },

  // TeacherStudent card
  studentCard: {
    backgroundColor: '#FAFBFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(80,141,247,0.08)',
    shadowColor: '#508DF7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(80,141,247,0.12)',
  },
  avatarText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 16,
    color: '#1a1a2e',
  },
  cardInfo: {
    flex: 1,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  studentName: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 15,
    color: '#1a1a2e',
  },
  activeBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
  },
  activeBadgeText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: '#2E7D32',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 99,
  },
  tagText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 7,
    backgroundColor: '#EEF2FF',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#508DF7',
    borderRadius: 99,
  },
  progressLabel: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 12,
    color: '#508DF7',
    minWidth: 32,
    textAlign: 'right',
  },

  // Ghost card
  ghostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderColor: '#C8D9FB',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFF',
  },
  ghostAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostPlus: {
    fontSize: 26,
    color: '#508DF7',
    lineHeight: 30,
  },
  ghostLines: {
    flex: 1,
    gap: 8,
  },
  ghostLine1: {
    width: 100,
    height: 10,
    backgroundColor: '#E8EEFF',
    borderRadius: 6,
  },
  ghostLine2: {
    width: 70,
    height: 8,
    backgroundColor: '#F0F3FF',
    borderRadius: 6,
  },
});
