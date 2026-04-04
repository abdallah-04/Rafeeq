import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '@/theme';

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
        source={require('@/assets/images/mascot/rafeeq_clabbing.png')}
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
    backgroundColor: theme.colors.primaryLighter,
    borderRadius: theme.radius['2xl'],
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 28,
    alignItems: 'center',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 8,
  },
  penguin: {
    width: 130,
    height: 130,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: theme.typography.fontFamily.bold,
  },
  scoreLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.regular,
  },
  scoreBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    marginBottom: 28,
  },
  scoreText: {
    color: theme.colors.textWhite,
    fontSize: 22,
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily.bold,
  },
  btn: {
    backgroundColor: theme.colors.buttonPrimary,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.sm,
    width: '100%',
    alignItems: 'center',
    shadowColor: theme.colors.buttonPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnText: {
    color: theme.colors.textWhite,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily.bold,
  },
});