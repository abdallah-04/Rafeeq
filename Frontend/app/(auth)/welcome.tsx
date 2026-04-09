import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/modal/shared/Button';
import { Text } from '@/components/modal/shared/Text';
import { theme } from '@/theme';

const { colors, spacing, typography, radius } = theme;

export default function LandingScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Brand */}
      <View style={styles.brandRow}>
        <Text style={styles.brand}>RAFEEQ</Text>
        <Text style={styles.brandAr}> · رفيق</Text>
      </View>

      {/* Mascot card */}
      <View style={styles.imageBox}>
        <Image
          source={require('@/assets/images/mascot/rafeeq_waving.png')}
          style={styles.penguin}
          resizeMode="contain"
        />
      </View>

      {/* Copy */}
      <Text style={styles.heading}>{t('landing.tagline')}</Text>
      <Text style={styles.sub}>
        {t('landing.subtitle')}
      </Text>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          label={t('landing.getStarted')}
          variant="primary"
          onPress={() => router.push('/(auth)/role-select')}
          style={styles.btn}
        />
        <Button
          label={t('landing.login')}
          variant="outline"
          onPress={() => router.push('/(auth)/login')}
          style={styles.btn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  brandRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  brand: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    letterSpacing: 1,
  },

  brandAr: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.primary,
  },

  imageBox: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    maxHeight: 320,
  },

  penguin: {
    width: 220,
    height: 220,
  },

  heading: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    color: colors.textPrimary,
    lineHeight: 36,
    marginBottom: spacing.sm,
  },

  sub: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },

  actions: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },

  btn: {
    width: '100%',
  },
});