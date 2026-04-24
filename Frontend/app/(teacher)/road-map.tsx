import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';

type DayStatus = 'done' | 'current' | 'pending' | 'crown';
type DayAlign = 'left' | 'center' | 'right';

const DAYS: Array<{
  day: number;
  status: DayStatus;
  align: DayAlign;
  mascot?: 'reading' | 'waving';
}> = [
  { day: 7, status: 'crown', align: 'center' },
  { day: 6, status: 'pending', align: 'right' },
  { day: 5, status: 'pending', align: 'left', mascot: 'reading' },
  { day: 4, status: 'current', align: 'center' },
  { day: 3, status: 'done', align: 'right' },
  { day: 2, status: 'done', align: 'left', mascot: 'waving' },
  { day: 1, status: 'done', align: 'center' },
];

const DAY_MODAL_CONFIGS: Record<number, {
  titleKey: string;
  titleDefault: string;
  contentKey: string;
  contentDefault: string;
  ctaKey: string;
  ctaDefault: string;
  type: string;
}> = {
  4: { titleKey: 'teacher.dayWorkModals.whatToDoToday', titleDefault: 'What to do today', contentKey: 'teacher.dayWorkModals.task7hw5', contentDefault: 'Task 7 & H.W 5', ctaKey: 'teacher.dayWorkModals.letsGo', ctaDefault: "Let's Go", type: 'info' },
  5: { titleKey: 'teacher.dayWorkModals.day5Work', titleDefault: 'Day 5 Work', contentKey: 'teacher.dayWorkModals.task7hw5', contentDefault: 'Task 7 & H.W 5', ctaKey: 'teacher.dayWorkModals.okay', ctaDefault: 'Okay', type: 'info' },
  6: { titleKey: 'teacher.dayWorkModals.day6Work', titleDefault: 'Day 6 Work', contentKey: 'teacher.dayWorkModals.quiz3hw5', contentDefault: 'Quiz 3 & H.W 5', ctaKey: 'teacher.dayWorkModals.okay', ctaDefault: 'Okay', type: 'quiz' },
  7: { titleKey: 'teacher.dayWorkModals.day7Work', titleDefault: 'Day 7 Work', contentKey: 'teacher.dayWorkModals.exam1', contentDefault: 'Exam 1', ctaKey: 'teacher.dayWorkModals.okay', ctaDefault: 'Okay', type: 'exam' },
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NODE_SIZE = 62;
const CURRENT_SIZE = 74;
const CROWN_SIZE = 70;
const ROW_HEIGHT = 118;
const PADDING_TOP = 18;
const MASCOT_SIZE = 88;

const ALIGN_X: Record<DayAlign, number> = {
  left: SCREEN_WIDTH * 0.23,
  center: SCREEN_WIDTH * 0.5,
  right: SCREEN_WIDTH * 0.77,
};

function CurvedPath({
  fromX,
  fromY,
  toX,
  toY,
  completed,
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  completed: boolean;
}) {
  const controlX = (fromX + toX) / 2 + (fromX < toX ? -44 : 44);
  const controlY = fromY + (toY - fromY) * 0.5;
  const d = `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Path
        d={d}
        stroke="rgba(70, 125, 183, 0.12)"
        strokeWidth={11}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d={d}
        stroke={completed ? '#5B9BE5' : '#A8C8F0'}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={completed ? undefined : '10 9'}
      />
    </Svg>
  );
}

function PulseRing({ anim }: { anim: Animated.Value }) {
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.58] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: CURRENT_SIZE + 18,
        height: CURRENT_SIZE + 18,
        borderRadius: (CURRENT_SIZE + 18) / 2,
        borderWidth: 3,
        borderColor: '#2B6FD4',
        top: -9,
        left: -9,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}

function DayNodeView({
  day,
  x,
  y,
  enterAnim,
  onPress,
}: {
  day: (typeof DAYS)[number];
  x: number;
  y: number;
  enterAnim: Animated.Value;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const isCurrent = day.status === 'current';
  const isDone = day.status === 'done';
  const isCrown = day.status === 'crown';
  const isPending = day.status === 'pending';
  const size = isCurrent ? CURRENT_SIZE : isCrown ? CROWN_SIZE : NODE_SIZE;

  useEffect(() => {
    if (!isCurrent) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 650, useNativeDriver: true }),
      ])
    ).start();
  }, [isCurrent, pulseAnim]);

  const scale = enterAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 1.1, 1] });
  const labelWidth = isCurrent || isCrown ? size * 1.8 : 70;
  const labelLeft = day.align === 'center'
    ? -(labelWidth - size) / 2
    : day.align === 'left'
      ? size + 8
      : -(labelWidth + 8);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        opacity: enterAnim,
        transform: [{ scale }],
      }}
    >
      {isCurrent && <PulseRing anim={pulseAnim} />}

      <TouchableOpacity
        activeOpacity={0.82}
        onPress={onPress}
        style={[
          styles.node,
          { width: size, height: size, borderRadius: size / 2 },
          isDone && styles.nodeDone,
          isCurrent && styles.nodeCurrent,
          isPending && styles.nodePending,
          isCrown && styles.nodeCrown,
        ]}
      >
        {isDone && <Text style={styles.doneIcon}>✓</Text>}
        {isCurrent && <Text style={styles.currentIcon}>📘</Text>}
        {isPending && <Text style={styles.pendingIcon}>🔒</Text>}
        {isCrown && (
          <Image
            source={require('@/assets/images/icons/crown.png')}
            style={styles.crownIcon}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>

      <View style={[styles.dayLabel, { width: labelWidth, left: labelLeft, top: size / 2 - 11 }]}>
        <Text
          style={[
            styles.dayText,
            isDone && styles.dayTextDone,
            isCurrent && styles.dayTextCurrent,
            isPending && styles.dayTextPending,
            isCrown && styles.dayTextCrown,
            (isCurrent || isCrown) && styles.dayTextCentered,
          ]}
        >
          {t('teacher.roadMap.day', { number: day.day })}
        </Text>
      </View>
    </Animated.View>
  );
}

function DayModal({
  visible,
  day,
  onClose,
  t,
}: {
  visible: boolean;
  day: number | null;
  onClose: () => void;
  t: any;
}) {
  const config = day !== null ? DAY_MODAL_CONFIGS[day] : null;
  if (!config) return null;

  const iconMap: Record<string, string> = { info: '📋', quiz: '📝', exam: '🎓' };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalIcon}>{iconMap[config.type]}</Text>
          <Text style={styles.modalTitle}>{t(config.titleKey, config.titleDefault)}</Text>
          <Text style={styles.modalContent}>{t(config.contentKey, config.contentDefault)}</Text>
          <TouchableOpacity style={styles.modalBtn} onPress={onClose}>
            <Text style={styles.modalBtnText}>{t(config.ctaKey, config.ctaDefault)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function TodayQuizModal({ visible, onClose, t }: { visible: boolean; onClose: () => void; t: any }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalIcon}>📝</Text>
          <Text style={styles.modalTitle}>{t('teacher.quiz.todayQuiz', 'Today Quiz')}</Text>
          <Text style={styles.quizMeta}>3 {t('teacher.quiz.questions', 'Questions')}</Text>
          <Text style={styles.quizMeta}>Quiz 2</Text>
          <Text style={styles.quizMeta}>10 {t('teacher.quiz.mins', 'mins')}</Text>
          <TouchableOpacity style={styles.modalBtn} onPress={onClose}>
            <Text style={styles.modalBtnText}>{t('teacher.quiz.start', 'Start')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function GreatJobModal({ visible, onClose, t }: { visible: boolean; onClose: () => void; t: any }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.greatJobIcon}>✅</Text>
          <Text style={styles.modalTitle}>{t('teacher.modal.greatJob', 'Great Job')}</Text>
          <Text style={styles.modalContent}>{t('teacher.modal.wellDone', 'You did a great job, well done!')}</Text>
          <Text style={styles.quizMeta}>Task 1 & H.W 2</Text>
          <Text style={styles.quizMeta}>21/10/2026</Text>
          <TouchableOpacity style={styles.modalBtn} onPress={onClose}>
            <Text style={styles.modalBtnText}>{t('teacher.modal.okay', 'Okay')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function TeacherRoadMapScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const isRTL = i18n.language === 'ar';
  const enterAnims = useRef(DAYS.map(() => new Animated.Value(0))).current;

  const [dayModal, setDayModal] = useState<number | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showGreatJob, setShowGreatJob] = useState(false);

  useEffect(() => {
    Animated.stagger(
      90,
      enterAnims.map((anim) => Animated.spring(anim, {
        toValue: 1,
        tension: 58,
        friction: 7,
        useNativeDriver: true,
      }))
    ).start();
  }, [enterAnims]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (studentId) {
      router.replace({ pathname: '/(teacher)/Student_dashboard', params: { studentId } } as any);
      return;
    }
    router.replace('/(teacher)/(tabs)/students');
  };

  const handleNodePress = (day: number) => {
    if (DAY_MODAL_CONFIGS[day]) {
      setDayModal(day);
    }
  };

  const canvasHeight = DAYS.length * ROW_HEIGHT + ROW_HEIGHT;
  const positions = DAYS.map((day, index) => ({
    x: ALIGN_X[day.align],
    y: PADDING_TOP + ROW_HEIGHT / 2 + index * ROW_HEIGHT,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.navBar, isRTL && styles.rowReverse]}>
        <BackButton onPress={handleBack} />
        <Text style={styles.navTitle}>{t('teacher.roadMap.title', 'Road Map')}</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.treeCanvas, { height: canvasHeight }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[StyleSheet.absoluteFill, { height: canvasHeight }]} pointerEvents="none">
          {positions.map((pos, index) => {
            if (index === positions.length - 1) return null;
            const next = positions[index + 1];
            const nextStatus = DAYS[index + 1].status;
            const completed = nextStatus === 'done' || nextStatus === 'current';
            return (
              <CurvedPath
                key={`path-${index}`}
                fromX={pos.x}
                fromY={pos.y}
                toX={next.x}
                toY={next.y}
                completed={completed}
              />
            );
          })}
        </View>

        {DAYS.map((day, index) => {
          const { x, y } = positions[index];
          const nodeSize = day.status === 'current' ? CURRENT_SIZE : day.status === 'crown' ? CROWN_SIZE : NODE_SIZE;
          const mascotX = day.align === 'left'
            ? x + nodeSize / 2 + 8
            : day.align === 'right'
              ? x - nodeSize / 2 - MASCOT_SIZE - 8
              : x + nodeSize / 2 + 12;
          const mascotY = y - MASCOT_SIZE / 2 + 6;

          return (
            <React.Fragment key={day.day}>
              <DayNodeView
                day={day}
                x={x}
                y={y}
                enterAnim={enterAnims[index]}
                onPress={() => handleNodePress(day.day)}
              />

              {day.mascot && (
                <Animated.View
                  style={{
                    position: 'absolute',
                    left: mascotX,
                    top: mascotY,
                    opacity: enterAnims[index],
                    transform: [{
                      scale: enterAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1],
                      }),
                    }],
                  }}
                >
                  <Image
                    source={
                      day.mascot === 'reading'
                        ? require('@/assets/images/mascot/rafeeq_reading.png')
                        : require('@/assets/images/mascot/rafeeq_waving.png')
                    }
                    style={styles.mascot}
                    resizeMode="contain"
                  />
                </Animated.View>
              )}
            </React.Fragment>
          );
        })}
      </ScrollView>

      <DayModal
        visible={dayModal !== null}
        day={dayModal}
        onClose={() => setDayModal(null)}
        t={t}
      />
      <TodayQuizModal visible={showQuizModal} onClose={() => setShowQuizModal(false)} t={t} />
      <GreatJobModal visible={showGreatJob} onClose={() => setShowGreatJob(false)} t={t} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#D6E8F8',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#D6E8F8',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  navTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: '#1A3F6F',
  },
  navSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  treeCanvas: {
    position: 'relative',
    width: SCREEN_WIDTH,
    paddingBottom: 48,
  },
  node: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDone: {
    backgroundColor: '#58A5E6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#29679F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },
  nodeCurrent: {
    backgroundColor: '#1F67C8',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#0E438F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  nodePending: {
    backgroundColor: '#A8CAE9',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#6E9EC3',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  nodeCrown: {
    backgroundColor: '#FFE39A',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#C59B2D',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  doneIcon: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 25,
    color: '#FFFFFF',
  },
  currentIcon: {
    fontSize: 28,
  },
  pendingIcon: {
    fontSize: 22,
  },
  crownIcon: {
    width: 32,
    height: 32,
  },
  dayLabel: {
    position: 'absolute',
  },
  dayText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
  },
  dayTextDone: {
    color: '#2A6FAF',
  },
  dayTextCurrent: {
    color: '#1A3F6F',
    fontSize: 15,
  },
  dayTextPending: {
    color: '#789BBB',
  },
  dayTextCrown: {
    color: '#946E0A',
    fontSize: 14,
  },
  dayTextCentered: {
    textAlign: 'center',
  },
  mascot: {
    width: MASCOT_SIZE,
    height: MASCOT_SIZE,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalIcon: {
    fontSize: 48,
  },
  greatJobIcon: {
    fontSize: 52,
  },
  modalTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: '#1a1a2e',
    textAlign: 'center',
  },
  modalContent: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  quizMeta: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
    color: '#374151',
  },
  modalBtn: {
    marginTop: 8,
    backgroundColor: '#508DF7',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 48,
    shadowColor: '#508DF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  modalBtnText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 16,
    color: '#fff',
  },
});
