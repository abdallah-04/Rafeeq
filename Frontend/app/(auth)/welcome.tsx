import { View, Text, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '@/components/modal/shared/blueButton';
import SecondaryButton from '@/components/modal/shared/otherbutton';
import { colors } from '@/constants';

export default function LandingScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Brand header */}
      <Text style={styles.brand}>RAFEEQ</Text>
      <Text style={styles.brandAr}>رفيق</Text>

      {/* Mascot */}
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
        The companion for your child's educational journey and personalised growth.
      </Text>

      {/* Actions */}
      <PrimaryButton
        title={t('landing.getStarted')}
        onPress={() => router.push('/(auth)/role-select')}
      />
      <SecondaryButton
        title={t('landing.login')}
        onPress={() => router.push('/(auth)/login')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  brand: {
    fontSize: 18,
    fontFamily: 'Lexend_700Bold',
    fontWeight: '900',
    color: colors.buttonPrimary,
    letterSpacing: 1,
  },
  brandAr: {
    fontSize: 16,
    fontFamily: 'Lexend_400Regular',
    color: colors.buttonPrimary,
    marginBottom: 16,
  },
  imageBox: {
    flex: 1,
    width: '100%',
    backgroundColor: '#EEF4FF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  penguin: {
    width: '70%',
    height: '70%',
  },
  heading: {
    fontSize: 22,
    fontFamily: 'Lexend_700Bold',
    fontWeight: '700',
    textAlign: 'center',
    color: colors.textPrimary,
    lineHeight: 30,
    marginBottom: 8,
  },
  sub: {
    fontSize: 13,
    fontFamily: 'Lexend_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
});