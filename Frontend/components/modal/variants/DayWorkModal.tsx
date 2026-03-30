import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { DayWorkVariant } from '../ModalProvider';

interface Props {
  variant?: DayWorkVariant;
  onHide: () => void;
}

interface DayWorkContent {
  title: string;
  subtitle?: string;
  items?: string[];   // e.g. ['Task 7', 'H.W 5']
  btnPrimary: string;
  btnSecondary?: string; // only on whatTodayLetsGo
  penguinPose: 'waving' | 'celebrating' | 'reading' | 'thinking';
}

const VARIANT_MAP: Record<DayWorkVariant, DayWorkContent> = {
  whatTodayOkay: {
    title: 'modal.daywork.whatToday.title',
    subtitle: 'modal.daywork.whatToday.subtitle',
    btnPrimary: 'modal.daywork.btn.okay',
    penguinPose: 'waving',
  },
  whatTodayLetsGo: {
    title: 'modal.daywork.whatToday.title',
    subtitle: 'modal.daywork.whatToday.subtitle',
    btnPrimary: 'modal.daywork.btn.letsGo',
    penguinPose: 'waving',
  },
  day5work: {
    title: 'modal.daywork.day5.title',
    items: ['modal.daywork.day5.item1', 'modal.daywork.day5.item2'],
    btnPrimary: 'modal.daywork.btn.okay',
    penguinPose: 'reading',
  },
  day6work: {
    title: 'modal.daywork.day6.title',
    items: ['modal.daywork.day6.item1', 'modal.daywork.day6.item2'],
    btnPrimary: 'modal.daywork.btn.okay',
    penguinPose: 'reading',
  },
  day7work: {
    title: 'modal.daywork.day7.title',
    items: ['modal.daywork.day7.item1'],
    btnPrimary: 'modal.daywork.btn.okay',
    penguinPose: 'thinking',
  },
  todayQuiz: {
    title: 'modal.daywork.todayQuiz.title',
    subtitle: 'modal.daywork.todayQuiz.subtitle',
    btnPrimary: 'modal.daywork.btn.start',
    penguinPose: 'reading',
  },
  todayExam: {
    title: 'modal.daywork.todayExam.title',
    subtitle: 'modal.daywork.todayExam.subtitle',
    btnPrimary: 'modal.daywork.btn.start',
    penguinPose: 'thinking',
  },
  soproud: {
    title: 'modal.daywork.soproud.title',
    subtitle: 'modal.daywork.soproud.subtitle',
    btnPrimary: 'modal.daywork.btn.okay',
    penguinPose: 'celebrating',
  },
};

const PENGUIN_IMAGES: Record<DayWorkContent['penguinPose'], any> = {
  waving:     require('@/assets/images/penguin_waving.png'),
  celebrating:require('@/assets/images/penguin_celebrating.png'),
  reading:    require('@/assets/images/penguin_reading.png'),
  thinking:   require('@/assets/images/penguin_thinking.png'),
};

export default function DayWorkModal({ variant = 'whatTodayOkay', onHide }: Props) {
  const { t } = useTranslation();
  const content = VARIANT_MAP[variant];

  return (
    <View style={styles.card}>
      <Image
        source={PENGUIN_IMAGES[content.penguinPose]}
        style={styles.penguin}
        resizeMode="contain"
      />

      <Text style={styles.title}>{t(content.title)}</Text>

      {content.subtitle && (
        <Text style={styles.subtitle}>{t(content.subtitle)}</Text>
      )}

      {content.items && content.items.length > 0 && (
        <View style={styles.itemList}>
          {content.items.map((key, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={styles.itemDot} />
              <Text style={styles.itemText}>{t(key)}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.btnPrimary} onPress={onHide} activeOpacity={0.8}>
        <Text style={styles.btnPrimaryText}>{t(content.btnPrimary)}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  penguin: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Lexend',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
    fontFamily: 'Lexend',
  },
  itemList: {
    width: '100%',
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#508DF7',
  },
  itemText: {
    fontSize: 15,
    color: '#334155',
    fontFamily: 'Lexend',
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: '#508DF7',
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#508DF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Lexend',
  },
});