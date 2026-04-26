import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { apiGetStudent, apiGetNotesForTeacher, StudentResponse, NoteResponse } from '@/services/api';
import { useModal } from '@/components/modal/ModalProvider';
import AnimatedProgressCircle from '@/components/AnimatedProgressCircle';
import BackButton from '@/components/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/modal/shared/Text';
import { Theme } from '@/theme';


function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function readNumberParam(value?: string | string[]) {
  const raw = readParam(value);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildStudentFromParams(params: {
  studentId?: string;
  studentNameAr?: string | string[];
  studentNameEn?: string | string[];
  studentLevel?: string | string[];
  studentAssessedLevel?: string | string[];
  studentLearningDifficulty?: string | string[];
  studentStatus?: string | string[];
  studentDateOfBirth?: string | string[];
}): StudentResponse | null {
  if (!params.studentId) return null;

  const fullNameAr = readParam(params.studentNameAr);
  const fullNameEn = readParam(params.studentNameEn);
  const status = readParam(params.studentStatus);

  if (!fullNameAr && !fullNameEn) {
    return null;
  }

  return {
    id: params.studentId,
    userId: null,
    fullNameAr: fullNameAr ?? '',
    fullNameEn: fullNameEn || null,
    className: null,
    level: readNumberParam(params.studentLevel),
    gender: null,
    dateOfBirth: readParam(params.studentDateOfBirth) || null,
    learningDifficulty: readParam(params.studentLearningDifficulty) || null,
    nationalId: '',
    status: status || '',
    assessedLevel: readNumberParam(params.studentAssessedLevel),
  };
}


export default function TeacherStudentDashboard() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { show } = useModal();
  const params = useLocalSearchParams<{
    studentId: string;
    studentNameAr?: string;
    studentNameEn?: string;
    studentLevel?: string;
    studentAssessedLevel?: string;
    studentLearningDifficulty?: string;
    studentStatus?: string;
    studentDateOfBirth?: string;
  }>();
  const { studentId } = params;
  const isRTL = i18n.language === 'ar';
  const initialStudent = React.useMemo(() => buildStudentFromParams(params), [params]);
  const skipInitialStudentFetchRef = React.useRef(Boolean(initialStudent));

  const [student,    setStudent]    = React.useState<StudentResponse | null>(initialStudent);
  const [notes,      setNotes]      = React.useState<NoteResponse[]>([]);
  const [isLoading,  setIsLoading]  = React.useState(true);

  const load = React.useCallback((skipStudentFetch = false) => {
    if (!studentId) return;
    Promise.all([
      skipStudentFetch && initialStudent ? Promise.resolve(initialStudent) : apiGetStudent(studentId),
      apiGetNotesForTeacher(studentId).catch(() => [] as NoteResponse[]),
    ]).then(([s, n]) => { setStudent(s); setNotes(n); })
      .catch(() => show('error', { variant: 'invalidInfo' }))
      .finally(() => setIsLoading(false));
  }, [initialStudent, studentId, show]);

  useFocusEffect(
    React.useCallback(() => {
      const skipStudentFetch = skipInitialStudentFetchRef.current && Boolean(initialStudent);
      skipInitialStudentFetchRef.current = false;
      load(skipStudentFetch);
    }, [load])
  );

  const handleBack = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(teacher)/(tabs)/students');
  }, [router]);

  const ACTION_BUTTONS = [
    { id: 'notes',   label: t('teacher.dashboard.notes',   'Notes'),       icon: '📝', color: '#FFB84C', bg: '#FFF8ED', route: '/(teacher)/notes' },
    { id: 'hw',      label: t('teacher.dashboard.addHW',   'Add H.W'),     icon: '📚', color: '#508DF7', bg: '#EEF4FF', route: '/(teacher)/homework' },
    { id: 'reports', label: t('teacher.dashboard.reports', 'Add Reports'),  icon: '📋', color: '#BA6DE9', bg: '#F5EEFF', route: '/(teacher)/reports' },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <ActivityIndicator size="large" color="#508DF7" />
      </SafeAreaView>
    );
  }

  if (!student) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <TouchableOpacity style={styles.fallbackBtn} onPress={handleBack}>
          <Text style={styles.fallbackBtnText}>{t('teacher.dashboard.backToStudents', 'Back to Students')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const displayName = isRTL ? student.fullNameAr : (student.fullNameEn ?? student.fullNameAr);
  const initials    = (displayName ?? '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  const level       = student.assessedLevel ?? student.level ?? 0;
  const avatarBg    = ['#FFD9B3','#C8E6C9','#BBDEFB','#F8BBD0','#E1BEE7'][(displayName?.charCodeAt(0) ?? 0) % 5];
  const needsPlacementAssessment = student.assessedLevel == null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.navBar, isRTL && styles.rowReverse]}>
        <BackButton onPress={handleBack} />
        <Text style={styles.navTitle}>{displayName}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {needsPlacementAssessment ? (
          <TouchableOpacity
            style={[styles.placementCard, isRTL && styles.rowReverse]}
            activeOpacity={0.82}
            onPress={() => router.push({
              pathname: '/(teacher)/placement-exam' as any,
              params: {
                studentId: studentId ?? '',
                studentName: student?.fullNameAr ?? student?.fullNameEn ?? '',
              },
            })}
          >
            <View style={styles.placementIconWrap}>
              <Ionicons name="clipboard-outline" size={26} color="#F59E0B" />
            </View>
            <View style={styles.placementBody}>
              <Text style={[styles.placementTitle, isRTL && styles.textRight]}>
                {t('teacher.placementExam.startPrimary', isRTL ? 'بدء اختبار تحديد المستوى' : 'Start Placement Assessment')}
              </Text>
              <Text style={[styles.placementSubtitle, isRTL && styles.textRight]}>
                {t(
                  'teacher.placementExam.startHint',
                  isRTL ? 'تابع من هنا لتحديد مستوى الطالب باستخدام المسار الحالي.' : 'Use the current placement flow to assess this student.'
                )}
              </Text>
            </View>
            <View style={styles.placementCta}>
              <Text style={styles.placementCtaText}>{isRTL ? 'ابدأ' : 'Start'}</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        <View style={[styles.actionsRow, isRTL && styles.rowReverse]}>
          {ACTION_BUTTONS.map((btn) => (
            <TouchableOpacity key={btn.id} style={[styles.actionBtn, { backgroundColor: btn.bg }]}
              onPress={() => router.push({
                pathname: btn.route as any,
                params: {
                  studentId,
                  studentName: student?.fullNameAr ?? student?.fullNameEn ?? '',
                },
              })} activeOpacity={0.75}>
              <Text style={styles.actionIcon}>{btn.icon}</Text>
              <Text style={[styles.actionLabel, { color: btn.color }]}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.progressCard}>
          <View style={[styles.progressCardInner, isRTL && styles.rowReverse]}>
            <View style={styles.progressLeft}>
              <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressName}>{displayName} - {t('teacher.dashboard.progressOf','Progress')}</Text>
                <View style={styles.tagsRow}>
                  {student.level != null && <View style={styles.tagBlue}><Text style={styles.tagBlueText}>Level {student.level}</Text></View>}
                  {student.learningDifficulty && <View style={styles.tagOrange}><Text style={styles.tagOrangeText}>{String(student.learningDifficulty)}</Text></View>}
                </View>
              </View>
            </View>
            <AnimatedProgressCircle progress={level ? Math.min(level*20,100) : 0} size={88} color="#508DF7" />
          </View>
          <View style={[styles.statsRow, isRTL && styles.rowReverse]}>
            {[
              { icon: '📋', value: String(notes.length), label: t('teacher.dashboard.notes','Notes') },
              { icon: '🎯', value: level ? `L${level}` : '—', label: t('teacher.dashboard.level','Level') },
              { icon: '⭐', value: student.status === 'ACTIVE' ? '✓' : '…', label: t('teacher.dashboard.status','Status') },
            ].map((stat, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={styles.statValue}>{stat.value} {stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>{t('teacher.dashboard.recentNotes','Recent Notes')}</Text>
        {notes.length === 0 ? (
          <Text style={[styles.sectionTitle, { fontSize: 13, color: '#9CA3AF', paddingHorizontal: 20 }]}>{t('teacher.dashboard.noNotes','No notes yet')}</Text>
        ) : notes.slice(0,3).map((note) => (
          <View key={note.id} style={styles.noteCard}>
            <View style={[styles.noteHeader, isRTL && styles.rowReverse]}>
              <View style={[styles.noteAvatar, { backgroundColor: '#BBDEFB' }]}><Text style={styles.noteAvatarText}>T</Text></View>
              <View style={styles.noteAuthorBlock}>
                <Text style={[styles.noteAuthor, isRTL && styles.textRight]}>{note.title}</Text>
                <Text style={[styles.noteTime, isRTL && styles.textRight]}>
                  {note.createdAt ? new Date(note.createdAt).toLocaleDateString(isRTL ? 'ar-JO' : 'en-GB') : ''}
                </Text>
              </View>
            </View>
            <Text style={[styles.noteText, isRTL && styles.textRight]}>{note.content}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  centered: { alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 32 },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },

  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  navTitle: { fontFamily: 'Lexend_700Bold', fontSize: 17, color: '#1a1a2e' },
  fallbackBtn: { backgroundColor: '#508DF7', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14 },
  fallbackBtnText: { fontFamily: 'Lexend_700Bold', fontSize: 15, color: '#fff' },

  placementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E4FF',
    shadowColor: '#508DF7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  placementIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placementIcon: {
    fontSize: 24,
  },
  placementBody: {
    flex: 1,
    paddingHorizontal: 12,
  },
  placementTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: '#1a1a2e',
    marginBottom: 4,
  },
  placementSubtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  placementCta: {
    minWidth: 72,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#508DF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placementCtaText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },

  actionsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  actionBtn: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  actionIcon: { fontSize: 26 },
  actionLabel: { fontFamily: 'Lexend_600SemiBold', fontSize: 11, textAlign: 'center' },

  progressCard: { marginHorizontal: 16, backgroundColor: '#EEF4FF', borderRadius: 24, padding: 16, marginBottom: 20, shadowColor: '#508DF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3 },
  progressCardInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  progressLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(80,141,247,0.15)' },
  avatarText: { fontFamily: 'Lexend_700Bold', fontSize: 14, color: '#1a1a2e' },
  progressInfo: { flex: 1 },
  progressName: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#1a1a2e', marginBottom: 5 },
  tagsRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
  tagBlue:   { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  tagOrange: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  tagPurple: { backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  tagBlueText:   { fontFamily: 'Lexend_600SemiBold', fontSize: 10, color: '#1D4ED8' },
  tagOrangeText: { fontFamily: 'Lexend_600SemiBold', fontSize: 10, color: '#D97706' },
  tagPurpleText: { fontFamily: 'Lexend_600SemiBold', fontSize: 10, color: '#7C3AED' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: 'rgba(80,141,247,0.12)', paddingTop: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statIcon: { fontSize: 14 },
  statValue: { fontFamily: 'Lexend_500Medium', fontSize: 11, color: '#374151' },

  sectionTitle: { fontFamily: 'Lexend_700Bold', fontSize: 16, color: '#1a1a2e', paddingHorizontal: 20, marginBottom: 10 },

  noteCard: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  noteAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  noteAvatarText: { fontFamily: 'Lexend_600SemiBold', fontSize: 12, color: '#1a1a2e' },
  noteAuthorBlock: { flex: 1 },
  noteAuthor: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#1a1a2e' },
  noteTime: { fontFamily: 'Lexend_400Regular', fontSize: 11, color: '#9CA3AF' },
  noteText: { fontFamily: 'Lexend_400Regular', fontSize: 13, color: '#374151', lineHeight: 20 },
});
