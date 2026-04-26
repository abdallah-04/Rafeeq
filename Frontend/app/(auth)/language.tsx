import React from 'react';
import {useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';

import { theme } from '@/theme';
import { Text } from '@/components/modal/shared/Text';
import { Button } from '@/components/modal/shared/Button';
import { useAuthStore } from '@/store/authStore';
import { changeLanguage } from '@/i18n';

export default function LanguageSelectionScreen() {
  const [selected, setSelected] = useState<'en' | 'ar' | null>(null);
  const setLanguage         = useAuthStore((s) => s.setLanguage);
  const setLanguageSelected = useAuthStore((s) => s.setLanguageSelected);

  const handleContinue = async () => {
    if (!selected) return;
    setLanguage(selected);
    changeLanguage(selected);
    setLanguageSelected(true);

    const needsRTLFlip = I18nManager.isRTL !== (selected === 'ar');
    I18nManager.forceRTL(selected === 'ar');

    if (needsRTLFlip && Updates.isEnabled) {
      // Restart required for RTL layout to take effect — only works in production/standalone builds
      try {
        await Updates.reloadAsync();
      } catch {
        // Expo Go / dev builds don't support reloadAsync; proceed normally
        router.replace('/(auth)/onboarding');
      }
    } else {
      router.replace('/(auth)/onboarding');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Mascot */}
      <View style={styles.mascotWrap}>
        <Image
          source={require('@/assets/images/mascot/rafeeq_like.png')}
          style={styles.mascot}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Choose your language</Text>
      <Text style={styles.titleAr}>اختر لغتك</Text>

      {/* Cards */}
      <View style={styles.cards}>
        {[
          { lang: 'en', flag: '🇬🇧', label: 'English', sub: 'الإنجليزية' },
          { lang: 'ar', flag: '🇯🇴', label: 'العربية', sub: 'Arabic' },
        ].map(({ lang, flag, label, sub }) => (
          <TouchableOpacity
            key={lang}
            style={[styles.card, selected === lang && styles.cardSelected]}
            onPress={() => setSelected(lang as 'en' | 'ar')}
            activeOpacity={0.8}
          >
            <Text style={styles.flag}>{flag}</Text>
            <View style={styles.cardText}>
              <Text style={styles.lang}>{label}</Text>
              <Text style={styles.sub}>{sub}</Text>
            </View>
            <View style={[styles.radio, selected === lang && styles.radioSelected]}>
              {selected === lang && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Button */}
      <View style={styles.footer}>
        <Button
          label="Continue / متابعة"
          onPress={handleContinue}
          disabled={!selected}
          style={styles.btn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
  },

  mascotWrap: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },

  mascot: {
    width: 130,
    height: 130,
  },

  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },

  titleAr: {
    fontSize: theme.typography.fontSize['2xl'],
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
      marginBottom: theme.spacing.lg,
  },

  cards: {
    gap: theme.spacing.md,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.xl,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },

  cardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EEF4FF',
  },

  flag: {
    fontSize: 28,
  },

  cardText: {
    flex: 1,
  },

  lang: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.textPrimary,
  },

  sub: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioSelected: {
    borderColor: theme.colors.primary,
  },

  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },

  footer: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },

  btn: {
    width: '100%',
  },
});
