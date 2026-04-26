import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/modal/shared/Text'
import { StudentListSkeleton } from '@/components/LoadingSkeleton';
import { apiGetStudents, StudentResponse } from '@/services/api';
import { useModal } from '@/components/modal/ModalProvider';

const AVATAR_COLORS = ['#BCD6FF', '#C8E6C9', '#BBDEFB', '#F8BBD0', '#E1BEE7'];
const LEVEL_PILL = '#B7CCFF';
const STATUS_BG = '#E7FAEE';
const STATUS_TEXT = '#49C77D';
const TRACK_COLOR = '#B8BEC8';
const FILL_COLOR = '#5E8FFF';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getProgress(student: StudentResponse) {
  const baseLevel = student.assessedLevel ?? student.level;
  if (baseLevel == null) return 0;
  return Math.max(0, Math.min(baseLevel * 20, 100));
}

function getStudentRouteParams(student: StudentResponse) {
  return {
    studentId: student.id,
    studentNameAr: student.fullNameAr,
    studentNameEn: student.fullNameEn ?? '',
    studentLevel: student.level != null ? String(student.level) : '',
    studentAssessedLevel: student.assessedLevel != null ? String(student.assessedLevel) : '',
    studentLearningDifficulty: student.learningDifficulty ?? '',
    studentStatus: student.status,
    studentDateOfBirth: student.dateOfBirth ?? '',
  };
}

function StudentCard({
  student,
  index,
  isRTL,
  onPress,
  t,
}: {
  student: StudentResponse;
  index: number;
  isRTL: boolean;
  onPress: () => void;
  t: any;
}) {
  const displayName = isRTL ? student.fullNameAr : (student.fullNameEn ?? student.fullNameAr);
  const initials = getInitials(student.fullNameAr || student.fullNameEn || '?');
  const avatarBg = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const progress = getProgress(student);
  const resolvedLevel = student.assessedLevel ?? student.level ?? 0;
  const difficultyLabel = student.learningDifficulty ?? t(
    'teacher.studentCard.notSpecified',
    isRTL ? 'غير محدد بعد' : 'not specified yet'
  );

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.78}>
      <View style={[styles.cardTop, isRTL && styles.rowReverse]}>
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.cardInfo}>
          <View style={[styles.nameRow, isRTL && styles.rowReverse]}>
            <Text style={[styles.studentName, isRTL && styles.textRight]} numberOfLines={1}>
              {displayName}
            </Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>
                {student.status === 'ACTIVE'
                  ? t('teacher.studentCard.active', isRTL ? 'نشط' : 'Active')
                  : t('teacher.studentCard.pending', isRTL ? 'قيد الانتظار' : 'Pending')}
              </Text>
            </View>
          </View>

          <View style={[styles.tagsRow, isRTL && styles.rowReverse]}>
            <View style={styles.levelPill}>
              <Text style={styles.levelPillText}>
                {t('teacher.studentCard.level', {
                  level: resolvedLevel,
                  defaultValue: isRTL ? `المستوى ${resolvedLevel}` : `Level ${resolvedLevel}`,
                })}
              </Text>
            </View>
            <View style={styles.difficultyPill}>
              <Text style={styles.difficultyText}>{difficultyLabel}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.progressRow, isRTL && styles.rowReverse]}>
        <Text style={styles.progressLabel}>{progress}%</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function AddStudentCard({
  onPress,
  t,
  isRTL,
}: {
  onPress: () => void;
  t: any;
  isRTL: boolean;
}) {
  return (
    <TouchableOpacity style={styles.addCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.addCircle}>
        <Text style={styles.addPlus}>+</Text>
      </View>
      <Text style={[styles.addText, isRTL && styles.textRight]}>
        {t('teacher.students.addFirst', isRTL ? 'أضف طالبك الآن' : 'Add your student now')}
      </Text>
    </TouchableOpacity>
  );
}

export default function StudentsScreen() {
  const router = useRouter();
  const { show } = useModal();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiGetStudents();
      setStudents(data);
    } catch {
      show('error', { variant: 'invalidInfo' });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [show]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (isLoading) return <StudentListSkeleton count={3} />;

  const handleAddStudent = () => router.push('/(teacher)/add-student');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={styles.headerTitle}>
          {t('teacher.students.title', isRTL ? 'طلابي' : 'My Students')}
        </Text>
        <View style={styles.headerSide} />
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item, index }) => (
          <StudentCard
            student={item}
            index={index}
            isRTL={isRTL}
            t={t}
            onPress={() => router.push({ pathname: '/(teacher)/Student_dashboard', params: getStudentRouteParams(item) } as any)}
          />
        )}
        ListEmptyComponent={
          <AddStudentCard onPress={handleAddStudent} t={t} isRTL={isRTL} />
        }
        ListFooterComponent={
          students.length > 0 ? <AddStudentCard onPress={handleAddStudent} t={t} isRTL={isRTL} /> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F9FE',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F7F9FE',
  },
  headerSide: {
    width: 42,
    height: 42,
  },
  headerTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: '#1a1a2e',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 34,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EEF9',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  studentName: {
    flex: 1,
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 15,
    color: '#1a1a2e',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: STATUS_BG,
  },
  statusText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: STATUS_TEXT,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  levelPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: LEVEL_PILL,
  },
  levelPillText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: '#5D84E8',
  },
  difficultyPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: '#E8F0FF',
  },
  difficultyText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: '#6D8FE6',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressLabel: {
    minWidth: 32,
    fontFamily: 'Lexend_500Medium',
    fontSize: 12,
    color: '#5E8FFF',
  },
  progressTrack: {
    flex: 1,
    height: 7,
    borderRadius: 99,
    backgroundColor: TRACK_COLOR,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: FILL_COLOR,
  },
  addCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D9E1F0',
    borderRadius: 18,
    minHeight: 122,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    backgroundColor: '#FFFFFF',
  },
  addCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#BCD6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  addPlus: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    lineHeight: 28,
  },
  addText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 15,
    color: '#B1B8C8',
  },
});
