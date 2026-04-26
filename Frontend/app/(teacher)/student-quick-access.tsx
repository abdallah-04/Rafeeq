// 





import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { apiGetStudent, StudentResponse } from '@/services/api';
import BackButton from '@/components/BackButton';
import { Ionicons } from '@expo/vector-icons';

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
    status: readParam(params.studentStatus) || '',
    assessedLevel: readNumberParam(params.studentAssessedLevel),
  };
}

const QUICK_ACCESS = [
  { id: 'roadmap',    labelKey: 'teacher.studentQuickAccess.roadMap',     label: 'Road Map',     icon: 'map-outline',  color: '#508DF7', bg: '#EEF4FF', route: '/(teacher)/road-map' },
  { id: 'exam',       labelKey: 'teacher.studentQuickAccess.monthlyExam', label: 'Monthly Exam', icon: 'create-outline',  color: '#BA6DE9', bg: '#F5EEFF', route: '/(teacher)/monthly-exam' },
  { id: 'reports',    labelKey: 'teacher.studentQuickAccess.reports',     label: 'Reports',      icon: 'bar-chart-outline📊',  color: '#9C6ADE', bg: '#F5EEFF', route: '/(teacher)/reports' },
  { id: 'dashboard',  labelKey: 'teacher.studentQuickAccess.dashboard',   label: 'Dashboard',    icon: 'grid-outline',  color: '#22C55E', bg: '#EDFAF3', route: '/(teacher)/Student_dashboard' },
];

export default function StudentQuickAccessScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
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
  const skipInitialFetchRef = React.useRef(Boolean(initialStudent));

  const [student,      setStudent]      = useState<StudentResponse | null>(initialStudent);
  const [modalVisible, setModalVisible] = useState(false);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(teacher)/(tabs)/students');
  }, [router]);

  const loadStudent = useCallback(() => {
    if (!studentId) return;
    apiGetStudent(studentId)
      .then((data) => {
        setStudent(data);
        if (data.assessedLevel != null) {
          setModalVisible(false);
        }
      })
      .catch(() => {});
  }, [studentId]);

  useFocusEffect(
    useCallback(() => {
      if (skipInitialFetchRef.current && initialStudent) {
        skipInitialFetchRef.current = false;
        return;
      }
      loadStudent();
    }, [initialStudent, loadStudent])
  );

  const isUnplaced = student ? (student.assessedLevel == null) : false;

  const handleGridPress = (route: string) => {
    if (isUnplaced) {
      setModalVisible(true);
    } else {
      router.push({
        pathname: route as any,
        params: {
          studentId: studentId ?? '',
          studentNameAr: student?.fullNameAr ?? '',
          studentNameEn: student?.fullNameEn ?? '',
          studentLevel: student?.level != null ? String(student.level) : '',
          studentAssessedLevel: student?.assessedLevel != null ? String(student.assessedLevel) : '',
          studentLearningDifficulty: student?.learningDifficulty ?? '',
          studentStatus: student?.status ?? '',
          studentDateOfBirth: student?.dateOfBirth ?? '',
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={[styles.navBar, isRTL && styles.rowReverse]}>
        <BackButton onPress={handleBack} />
        <Text style={styles.navTitle}>
          {t('teacher.quickAccess.title', 'Student Profile')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Profile Card ── */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: '#BBDEFB' }]}>
            <Text style={styles.avatarText}>{(student?.fullNameAr ?? '?').split(' ').map((w:string)=>w[0]).slice(0,2).join('').toUpperCase()}</Text>
          </View>

          <Text style={styles.studentName}>{student?.fullNameAr ?? student?.fullNameEn ?? ''}</Text>

          <View style={styles.pillsRow}>
            <View style={[styles.pill, isUnplaced && styles.pillWarning]}>
              <Text style={[styles.pillText, isUnplaced && styles.pillTextWarning]}>
                {isUnplaced
                  ? t('teacher.placementExam.levelNotSet', 'Level Not Set')
                  : student?.learningDifficulty ? String(student.learningDifficulty) : '—'}
              </Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {t('teacher.studentQuickAccess.age', { age: student?.dateOfBirth ? Math.floor((Date.now()-new Date(student.dateOfBirth).getTime())/(1000*60*60*24*365)) : '—' })}
              </Text>
            </View>
            {!isUnplaced && (
              <View style={styles.pill}>
                <Text style={styles.pillText}>
                  {t('teacher.studentCard.level', { level: student?.assessedLevel ?? student?.level ?? '--' })}
                </Text>
              </View>
            )}
          </View>

          {/* Progress أو Banner */}
          {isUnplaced ? (
            <TouchableOpacity
              style={styles.placementBanner}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="clipboard-outline" size={24} color="#F59E0B" />
              <View style={{ flex: 1 }}>
                <Text style={styles.placementBannerTitle}>
                  {t('teacher.placementExam.bannerTitle', 'Placement Exam Required')}
                </Text>
                <Text style={styles.placementBannerSub}>
                  {t('teacher.placementExam.bannerSub', 'Tap here to start the exam')}
                </Text>
              </View>
              <Text style={styles.placementBannerArrow}>{isRTL ? '←' : '→'}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.progressBlock}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>
                  {t('teacher.quickAccess.progress', 'Progress')}
                </Text>
                <Text style={styles.progressValue}>{student?.assessedLevel ? Math.min(student.assessedLevel*20,100) : 0}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${student?.assessedLevel ? Math.min(student.assessedLevel*20,100) : 0}%` }]} />
              </View>
            </View>
          )}
        </View>

        {/* ── Quick Access Grid ── */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>
          {t('teacher.quickAccess.quickAccess', 'Quick Access')}
        </Text>

        <View style={styles.grid}>
          {QUICK_ACCESS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.gridItem,
                { backgroundColor: item.bg },
                isUnplaced && styles.gridItemLocked,
              ]}
              onPress={() => handleGridPress(item.route)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isUnplaced ? 'lock-closed-outline' : item.icon as any}
                size={32}
                color={isUnplaced ? '#9CA3AF' : item.color}
              />
              <Text style={[styles.gridLabel, { color: isUnplaced ? '#9CA3AF' : item.color }]}>
                {t(item.labelKey, item.label)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ── Placement Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalIconWrap}>
                <Ionicons name="clipboard-outline" size={36} color="#508DF7" />
            </View>

            <Text style={styles.modalTitle}>
              {t('teacher.placementExam.modalTitle', 'Placement Required')}
            </Text>
            <Text style={styles.modalBody}>
              {t('teacher.placementExam.modalBody', {
                name: student?.fullNameAr ?? student?.fullNameEn ?? '',
                defaultValue: `${student?.fullNameAr ?? student?.fullNameEn ?? ''} hasn't taken the placement exam yet.`,
              })}
            </Text>

            <TouchableOpacity
              style={styles.modalBtnPrimary}
              onPress={() => {
                setModalVisible(false);
                router.push({
                  pathname: '/(teacher)/placement-exam' as any,
                  params: {
                    studentId: studentId ?? '',
                    studentName: student?.fullNameAr ?? student?.fullNameEn ?? '',
                  },
                });
              }}
            >
              <Text style={styles.modalBtnPrimaryText}>
                {t('teacher.placementExam.startBtn', '🚀 Start Exam')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalBtnSecondary}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalBtnSecondaryText}>
                {t('teacher.placementExam.notNow', 'Not Now')}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  rowReverse: { flexDirection: 'row-reverse' },
  scrollContent: { paddingBottom: 32 },

  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#F5F7FF',
  },
  navTitle: { fontFamily: 'Lexend_700Bold', fontSize: 17, color: '#1a1a2e' },

  profileCard: {
    marginHorizontal: 16, marginTop: 8, backgroundColor: '#fff',
    borderRadius: 28, padding: 24, alignItems: 'center',
    shadowColor: '#508DF7', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 4,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    borderWidth: 3, borderColor: 'rgba(80,141,247,0.15)',
  },
  avatarText: { fontFamily: 'Lexend_700Bold', fontSize: 24, color: '#1a1a2e' },
  studentName: { fontFamily: 'Lexend_700Bold', fontSize: 20, color: '#1a1a2e', marginBottom: 10 },

  pillsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 },
  pill: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99 },
  pillWarning: { backgroundColor: '#FFF3E0' },
  pillText: { fontFamily: 'Lexend_600SemiBold', fontSize: 12, color: '#508DF7' },
  pillTextWarning: { color: '#F59E0B' },

  progressBlock: { width: '100%' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontFamily: 'Lexend_500Medium', fontSize: 13, color: '#6b7280' },
  progressValue: { fontFamily: 'Lexend_700Bold', fontSize: 13, color: '#508DF7' },
  progressTrack: { height: 8, backgroundColor: '#EEF2FF', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#508DF7', borderRadius: 99 },

  placementBanner: {
    width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFF8E6', borderRadius: 16, padding: 14,
    borderWidth: 1.5, borderColor: '#FDE68A',
  },
  placementBannerIcon: { fontSize: 24 },
  placementBannerTitle: { fontFamily: 'Lexend_700Bold', fontSize: 13, color: '#92400E' },
  placementBannerSub: { fontFamily: 'Lexend_400Regular', fontSize: 11, color: '#B45309', marginTop: 2 },
  placementBannerArrow: { fontFamily: 'Lexend_700Bold', fontSize: 18, color: '#F59E0B' },

  sectionLabel: {
    fontFamily: 'Lexend_700Bold', fontSize: 15, color: '#1a1a2e',
    marginTop: 24, marginBottom: 12, paddingHorizontal: 20,
  },
  textRight: { textAlign: 'right' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  gridItem: {
    width: '47%', borderRadius: 20, padding: 20,
    alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 110,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  gridItemLocked: { opacity: 0.55 },
  gridIcon: { fontSize: 32 },
  gridLabel: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, textAlign: 'center' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 28, padding: 28,
    width: '100%', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 10,
  },
  modalIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  modalIcon: { fontSize: 36 },
  modalTitle: {
    fontFamily: 'Lexend_700Bold', fontSize: 18, color: '#1a1a2e',
    marginBottom: 10, textAlign: 'center',
  },
  modalBody: {
    fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#6b7280',
    textAlign: 'center', lineHeight: 22, marginBottom: 24,
  },
  modalBtnPrimary: {
    backgroundColor: '#508DF7', borderRadius: 16, paddingVertical: 14,
    paddingHorizontal: 32, width: '100%', alignItems: 'center', marginBottom: 10,
  },
  modalBtnPrimaryText: { fontFamily: 'Lexend_700Bold', fontSize: 15, color: '#fff' },
  modalBtnSecondary: { paddingVertical: 10, width: '100%', alignItems: 'center' },
  modalBtnSecondaryText: { fontFamily: 'Lexend_500Medium', fontSize: 14, color: '#9CA3AF' },
});
