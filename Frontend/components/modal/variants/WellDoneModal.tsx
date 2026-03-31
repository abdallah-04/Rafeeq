import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  score: number;
  total: number;
  onHide: () => void;
}

export default function WellDoneModal({ score, total, onHide }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <Image
        source={require('@/assets/images/penguin_celebrating.png')}
        style={styles.penguin}
        resizeMode="contain"
      />

      <Text style={styles.title}>{t('modal.wellDone.title')}</Text>

      <Text style={styles.scoreLabel}>{t('modal.wellDone.scoreLabel')}</Text>
      <View style={styles.scoreBadge}>
        <Text style={styles.scoreText}>
          {score}/{total}
        </Text>
      </View>

 
      <TouchableOpacity style={styles.btn} onPress={onHide} activeOpacity={0.8}>
        <Text style={styles.btnText}>{t('modal.wellDone.btn')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#EDF4FE',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 8,
  },
  penguin: {
    width: 130,
    height: 130,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: 'Lexend',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Lexend',
  },
  scoreBadge: {
    backgroundColor: '#508DF7',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginBottom: 28,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Lexend',
  },
  btn: {
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
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Lexend',
  },
});