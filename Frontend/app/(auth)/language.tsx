import React, { useState } from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants';
import PrimaryButton from '@/components/modal/shared/blueButton';
import ScreenWrapper from '@/components/modal/shared/ScreenWap';
import { useAuthStore } from '@/store/authStore';
import { changeLanguage } from '@/i18n';
import { I18nManager } from 'react-native';

export default function LanguageSelectionScreen() {
  const [selected, setSelected] = useState<'en' | 'ar' | null>(null);

  const setLanguage         = useAuthStore((s) => s.setLanguage);
  const setLanguageSelected = useAuthStore((s) => s.setLanguageSelected);

  const handleContinue = () => {
    if (!selected) return;

    setLanguage(selected);
    changeLanguage(selected);
    I18nManager.forceRTL(selected === 'ar');
    setLanguageSelected(true);
    router.replace('/(auth)/onboarding');
  };

  return (
    <ScreenWrapper style={styles.container}>
      <Image
        source={require('@/assets/images/mascot/rafeeq_like.png')}
        style={styles.pic}
        resizeMode="contain"
      />
      <Text style={styles.logoText}>رفيق</Text>
      <Text style={styles.logoText}>Rafeeq</Text>

      <Text style={styles.title}>Choose your language</Text>
      <Text style={styles.title}>اختر لغتك</Text>

      <View style={styles.options}>
        <TouchableOpacity
          style={[styles.card, selected === 'en' && styles.cardSelected]}
          onPress={() => setSelected('en')}
          accessibilityRole="button"
          accessibilityLabel="Select English"
        >
          <Text style={styles.flag}>🇬🇧</Text>
          <View>
            <Text style={styles.lang}>English</Text>
            <Text style={styles.sub}>الإنجليزية</Text>
          </View>
          {selected === 'en' && <Text style={styles.check}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, selected === 'ar' && styles.cardSelected]}
          onPress={() => setSelected('ar')}
          accessibilityRole="button"
          accessibilityLabel="Select Arabic"
        >
          <Text style={styles.flag}>🇯🇴</Text>
          <View>
            <Text style={styles.lang}>العربية</Text>
            <Text style={styles.sub}>Arabic</Text>
          </View>
          {selected === 'ar' && <Text style={styles.check}>✓</Text>}
        </TouchableOpacity>
      </View>

      <PrimaryButton
        title="Continue / متابعة"
        onPress={handleContinue}
        disabled={!selected}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  options: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
    marginTop: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 12,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundGray,
  },
  flag: {
    fontSize: 26,
  },
  lang: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  check: {
    marginLeft: 'auto',
    fontSize: 18,
    color: colors.primary,
    fontWeight: '700',
  },
  pic: {
    width: 114,
    height: 114,
    marginBottom: 8,
  },
});