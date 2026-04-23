import React from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/modal/shared/Text';
import Avatar from '@/components/modal/shared/Avatar';
import Badge from '@/components/modal/shared/Badge';
import Card from '@/components/modal/shared/Card';
import ProgressBar from '@/components/modal/shared/progressBar';
import { theme } from '@/theme';
import { TEACHER_STUDENTS, type TeacherStudent } from '../_students';

const { width } = Dimensions.get('window');
const CARD_MARGIN = theme.spacing.sm;
const CARD_WIDTH = (width - theme.spacing.lg * 2 - CARD_MARGIN) / 2;

function StudentCard({ student, onPress }: { student: TeacherStudent; onPress: (s: TeacherStudent) => void }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const levelNum = student.level.replace('Level ', '');

  return (
    <TouchableOpacity onPress={() => onPress(student)} activeOpacity={0.8} style={styles.cardWrapper}>
      <Card variant="elevated" style={styles.squareCard}>
        <View style={styles.cardContent}>
          <Avatar name={isRTL ? student.nameAr : student.name} size="sm" />
          <Text variant="label" numberOfLines={1} style={styles.studentName}>
            {isRTL ? student.nameAr : student.name}
          </Text>
          <Badge label={t('teacher.studentCard.level', { level: levelNum })} variant="blue" />
          <View style={styles.progressContainer}>
            <ProgressBar value={student.progress} showLabel={false} height={4} />
            <Text variant="caption" color="primary" style={styles.progressPercent}>
              {student.progress}%
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function CustomHeader() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const isRTL = i18n.language === 'ar';

  const handleNotificationPress = () => {
    console.log('handleNotificationPress');
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top || (Platform.OS === 'ios' ? 44 : 20) }]}>
      <View style={styles.headerInner}>
        <Text variant="body" style={[styles.welcomeText, isRTL && styles.textRight]}>
          {t('teacher.home.greeting', 'Hello,')}{' '}
          <Text variant="body" color="primary">
            {t('teacher.profile.name', 'Mr. Ahmad')}
          </Text>
        </Text>

        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={handleNotificationPress} style={styles.notificationButton}>
            <Image source={require('@/assets/images/icons/ringing.png')} style={styles.notificationIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function TeacherHomeScreen() {
  const router = useRouter();

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
        <CustomHeader />
        <View style={styles.grid}>
          {TEACHER_STUDENTS.map((student) => (
            <StudentCard key={student.id} student={student} onPress={handleStudentPress} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  headerContainer: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  welcomeText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  textRight: {
    textAlign: 'right',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  notificationButton: {
    padding: 4,
  },
  notificationIcon: {
    width: 24,
    height: 24,
    // إذا أردت تطبيق لون ثابت استخدم tintColor، لكن تأكد من أن الصورة قابلة للتلوين
    // tintColor: theme.colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: CARD_MARGIN,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: CARD_MARGIN,
  },
  squareCard: {
    aspectRatio: 1,
    padding: theme.spacing.sm,
    justifyContent: 'center',
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  studentName: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.xs,
    width: '100%',
  },
  progressContainer: {
    width: '58%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressPercent: {
    fontSize: theme.typography.fontSize.xs,
    minWidth: 28,
    textAlign: 'right',
  },
});