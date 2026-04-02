import { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '@/components/modal/shared/blueButton';
import SecondaryButton from '@/components/modal/shared/otherbutton';
import { colors } from '@/constants';
import ScreenWrapper from '@/components/modal/shared/ScreenWap';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  const SLIDES = [
    {
      titleKey: 'onboarding.slide1.title',
      descKey:  'onboarding.slide1.subtitle',
      image:    require('@/assets/images/mascot/rafeeq_reading.png'),
    },
    {
      titleKey: 'onboarding.slide2.title',
      descKey:  'onboarding.slide2.subtitle',
      image:    require('@/assets/images/mascot/rafeeq_reading.png'),
    },
    {
      titleKey: 'onboarding.slide3.title',
      descKey:  'onboarding.slide3.subtitle',
      image:    require('@/assets/images/mascot/rafeeq_reading.png'),
    },
  ];

  const isLast = index === SLIDES.length - 1;
  const slide  = SLIDES[index];

  const next = () => {
    if (isLast) router.replace('/(auth)/welcome');
    else setIndex(index + 1);
  };

  const skip = () => router.replace('/(auth)/welcome');

  return (
    <ScreenWrapper style={styles.container}>
      {/* Brand */}
      <Text style={styles.brand}>RAFEEQ</Text>
      <Text style={styles.brandAr}>رفيق</Text>

      {/* Slide text */}
      <Text style={styles.title}>{t(slide.titleKey)}</Text>
      <Text style={styles.desc}>{t(slide.descKey)}</Text>

      {/* Illustration */}
      <View style={styles.imageBox}>
        <Image source={slide.image} style={styles.image} resizeMode="contain" />
      </View>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      {/* Buttons */}
      <PrimaryButton
        title={isLast ? t('common.getStarted') : t('common.next')}
        onPress={next}
      />
      {!isLast && (
        <SecondaryButton title={t('common.skip')} onPress={skip} />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  brand: {
    fontSize: 18,
    fontFamily: 'Lexend_700Bold',
    fontWeight: '700',
    color: colors.buttonPrimary,
    letterSpacing: 1,
  },
  brandAr: {
    fontSize: 16,
    fontFamily: 'Lexend_400Regular',
    color: colors.buttonPrimary,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Lexend_700Bold',
    fontWeight: '700',
    textAlign: 'center',
    color: colors.textPrimary,
    lineHeight: 36,
  },
  desc: {
    fontSize: 14,
    fontFamily: 'Lexend_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  imageBox: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  image: { width: '90%', height: '90%' },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: colors.buttonPrimary,
    width: 24,
  },
});