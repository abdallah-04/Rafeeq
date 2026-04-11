import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from './Text';
import { theme } from '@/theme';
import { useAuthStore } from '@/store/authStore';

type Props = {
    completed: number;
    total: number;
    unit: string;
    period: string;
};

export default function KeepGoingBanner({ completed, total, unit, period }: Props) {
  const { t } = useTranslation();
  const isRTL = useAuthStore((s) => s.isRTL);
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <Text style={[styles.text, isRTL && styles.textRight]}>
        {t('banner.keepGoing', { completed, total, unit, period })}
      </Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${percentage}%` },
            isRTL && { transform: [{ scaleX: -1 }] },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.primaryLighter,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        marginVertical: theme.spacing.sm,
    },
    text: {
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.sm,
    },
    textRight: {
        textAlign: 'right',
    },
    progressBar: {
        width: '100%',
        height: 10,
        backgroundColor: theme.colors.progressNotStarted,
        borderRadius: theme.radius.full,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.progressComplete,
        borderRadius: theme.radius.full,
    },
});
