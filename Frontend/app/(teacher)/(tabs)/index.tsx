import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { apiGetStudents, StudentResponse } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

const DIFF_COLORS: Record<string, string> = {
  ADD:'#508DF7', ADHD:'#A855F7', ASD:'#10B981',
  DYS:'#F97316', IFD:'#EF4444', OTHER:'#6B7280',
};
const LEVEL_COLOR = '#BA6DE9';
const AVATAR_COLORS = ['#FFD9B3','#C8E6C9','#BBDEFB','#F8BBD0','#E1BEE7'];

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function getProgress(student: StudentResponse) {
  const baseLevel = student.assessedLevel ?? student.level;
  if (baseLevel == null) return null;
  return Math.max(0, Math.min(baseLevel * 20, 100));
}

function StudentCard({ student, index, onPress }: {
  student: StudentResponse; index: number; onPress: () => void;
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const displayName = isRTL ? student.fullNameAr : (student.fullNameEn ?? student.fullNameAr);
  const diffColor = DIFF_COLORS[student.learningDifficulty ?? 'OTHER'] ?? '#6B7280';
  const avatarBg  = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials  = getInitials(student.fullNameAr || student.fullNameEn || '?');
  const progress = getProgress(student);

  return (
    <TouchableOpacity style={styles.studentCard} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.cardTop, isRTL && styles.rowReverse]}>
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.cardInfo}>
          <View style={[styles.cardNameRow, isRTL && styles.rowReverse]}>
            <Text style={styles.studentName}>{displayName}</Text>
            <View style={[styles.activeBadge, student.status === 'ACTIVE' ? styles.badgeGreen : styles.badgeOrange]}>
              <Text style={[styles.activeBadgeText, student.status === 'ACTIVE' ? styles.badgeTextGreen : styles.badgeTextOrange]}>
                {student.status === 'ACTIVE'
                  ? t('teacher.studentCard.active', 'Active')
                  : t('teacher.studentCard.pending', 'Pending')}
              </Text>
            </View>
          </View>
          <View style={[styles.tagsRow, isRTL && styles.rowReverse]}>
            {student.level != null && (
              <View style={[styles.tag, { backgroundColor: LEVEL_COLOR + '22' }]}>
                <Text style={[styles.tagText, { color: LEVEL_COLOR }]}>
                  {t('teacher.studentCard.level', { level: student.level })}
                </Text>
              </View>
            )}
            {student.learningDifficulty && (
              <View style={[styles.tag, { backgroundColor: diffColor + '22' }]}>
                <Text style={[styles.tagText, { color: diffColor }]}>
                  {student.learningDifficulty}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress ?? 0}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{progress != null ? `${progress}%` : '--'}</Text>
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
  const user  = useAuthStore((s) => s.user);

  const [students,   setStudents]   = useState<StudentResponse[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiGetStudents();
      setStudents(data);
    } catch { /* empty list */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const teacherName = user?.name ?? user?.nameAr ?? t('teacher.profile.name', 'Teacher');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <View style={styles.penguinBox}>
          <Text style={styles.penguinEmoji}>🐧</Text>
        </View>

        <View style={styles.welcomeBlock}>
          <Text style={[styles.welcomeText, isRTL && styles.textRight]}>
            {t('teacher.home.greeting', 'Hello,')}{'  '}
            <Text style={styles.welcomeName}>{teacherName}</Text>
          </Text>
        </View>

        <View style={styles.studentsCard}>
          <Text style={styles.sectionTitle}>
            {t('teacher.home.myStudents', 'MY STUDENTS')}
          </Text>

          {loading ? (
            <ActivityIndicator color="#508DF7" style={{ marginVertical: 20 }} />
          ) : students.length === 0 ? (
            <Text style={styles.emptyText}>
              {t('teacher.students.empty', 'No students yet — add your first student')}
            </Text>
          ) : (
            students.map((s, i) => (
              <StudentCard
                key={s.id}
                student={s}
                index={i}
                onPress={() => router.push({ pathname: '/(teacher)/student-quick-access', params: { studentId: s.id } })}
              />
            ))
          )}

          <GhostCard onPress={() => router.push('/(teacher)/add-student')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: '#F5F7FF' },
  scroll:           { flex: 1 },
  scrollContent:    { paddingBottom: 32 },
  rowReverse:       { flexDirection: 'row-reverse' },
  penguinBox:       { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  penguinEmoji:     { fontSize: 48 },
  welcomeBlock:     { paddingHorizontal: 24, paddingVertical: 8 },
  welcomeText:      { fontFamily: 'Lexend_700Bold', fontSize: 28, color: '#1a1a2e', lineHeight: 36 },
  welcomeName:      { color: '#508DF7' },
  textRight:        { textAlign: 'right' },
  studentsCard:     { marginHorizontal: 16, marginTop: 8, backgroundColor: '#fff', borderRadius: 28, padding: 16, shadowColor: '#508DF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 4 },
  sectionTitle:     { fontFamily: 'Lexend_700Bold', fontSize: 13, color: '#508DF7', letterSpacing: 1.5, textAlign: 'center', textTransform: 'uppercase', marginBottom: 14 },
  emptyText:        { fontFamily: 'Lexend_500Medium', fontSize: 14, color: '#93C5FD', textAlign: 'center', paddingVertical: 20 },
  studentCard:      { backgroundColor: '#FAFBFF', borderRadius: 20, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(80,141,247,0.08)', elevation: 2 },
  cardTop:          { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar:           { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(80,141,247,0.12)' },
  avatarText:       { fontFamily: 'Lexend_600SemiBold', fontSize: 16, color: '#1a1a2e' },
  cardInfo:         { flex: 1 },
  cardNameRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  studentName:      { fontFamily: 'Lexend_600SemiBold', fontSize: 15, color: '#1a1a2e', flex: 1 },
  activeBadge:      { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  badgeGreen:       { backgroundColor: '#E8F5E9' },
  badgeOrange:      { backgroundColor: '#FFF3E0' },
  activeBadgeText:  { fontFamily: 'Lexend_600SemiBold', fontSize: 11 },
  badgeTextGreen:   { color: '#2E7D32' },
  badgeTextOrange:  { color: '#E65100' },
  tagsRow:          { flexDirection: 'row', gap: 6 },
  tag:              { paddingHorizontal: 9, paddingVertical: 2, borderRadius: 99 },
  tagText:          { fontFamily: 'Lexend_600SemiBold', fontSize: 11 },
  progressRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack:    { flex: 1, height: 7, backgroundColor: '#EEF2FF', borderRadius: 99, overflow: 'hidden' },
  progressFill:     { height: '100%', backgroundColor: '#508DF7', borderRadius: 99 },
  progressLabel:    { fontFamily: 'Lexend_600SemiBold', fontSize: 12, color: '#508DF7', minWidth: 32, textAlign: 'right' },
  ghostCard:        { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, padding: 14, borderWidth: 2, borderColor: '#C8D9FB', borderStyle: 'dashed', backgroundColor: '#F8FAFF' },
  ghostAvatar:      { width: 52, height: 52, borderRadius: 26, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  ghostPlus:        { fontSize: 26, color: '#508DF7', lineHeight: 30 },
  ghostLines:       { flex: 1, gap: 8 },
  ghostLine1:       { width: 100, height: 10, backgroundColor: '#E8EEFF', borderRadius: 6 },
  ghostLine2:       { width: 70, height: 8, backgroundColor: '#F0F3FF', borderRadius: 6 },
});
