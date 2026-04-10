import React, { useState } from 'react';
import { View, Image, ImageBackground, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/modal/shared/Button';
import { Text } from '@/components/modal/shared/Text';
import { theme } from '@/theme';

const { colors, spacing, typography, radius } = theme;

const SLIDES = [
  {
    titleKey:   'onboarding.slide1.title',
    descKey:    'onboarding.slide1.subtitle',
    image:      require('@/assets/images/mascot/rafeeq_reading.png'),
    background: require('@/assets/images/background/onboarding1.png'),
  },
  {
    titleKey:   'onboarding.slide2.title',
    descKey:    'onboarding.slide2.subtitle',
    image:      require('@/assets/images/mascot/rafeeq_clabbing.png'),
    background: require('@/assets/images/background/onboarding2.png'),
  },
  {
    titleKey:   'onboarding.slide3.title',
    descKey:    'onboarding.slide3.subtitle',
    image:      require('@/assets/images/mascot/rafeeq_like.png'),
    background: require('@/assets/images/background/onboarding1.png'),
  },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;
  const slide  = SLIDES[index];

  const next = () => {
    if (isLast) router.replace('/(auth)/welcome');
    else setIndex(index + 1);
  };
  const skip = () => router.replace('/(auth)/welcome');

  return (
    <SafeAreaView style={styles.safe}>
      {/* Brand */}
      <View style={styles.brandRow}>
        <Text style={styles.brand}>RAFEEQ</Text>
        <Text style={styles.brandAr}> · رفيق</Text>
      </View>

      {/* Image */}
      <ImageBackground
        source={slide.background}
        style={styles.imageBox}
        imageStyle={styles.imageBg}
        resizeMode="cover"
      >
        <Image source={slide.image} style={styles.image} resizeMode="contain" />
      </ImageBackground>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      {/* Text */}
      <Text style={styles.title}>{t(slide.titleKey)}</Text>
      <Text style={styles.desc}>{t(slide.descKey)}</Text>

      {/* Buttons */}
      <View style={styles.actions}>
        <Button
          label={isLast ? t('common.getStarted') : t('common.next')}
          onPress={next}
          variant="primary"
          style={styles.btn}
        />
        {!isLast && (
          <Button label={t('common.skip')} onPress={skip} variant="ghost" />
        )}
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
    marginBottom: spacing.md,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginVertical: spacing.sm,
    width: '100%',
    height: '100%',
  },

  imageBg: {
    width: 340,
    height: 316,  
    flex: 1,
    alignSelf: 'stretch',
    //borderRadius: radius.sm,
  },

  image: {
    width: 140,
    height: 140,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginVertical: spacing.md,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },

  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },

  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: spacing.sm,
  },

  desc: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },

  actions: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },

  btn: {
    width: '100%',
  },
});