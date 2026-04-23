import React, { useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Image, Modal, Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';

import { Text } from '@/components/modal/shared/Text';
import ScreenWrapper from '@/components/modal/shared/ScreenWap';
import Avatar from '@/components/modal/shared/Avatar';
import { theme } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/Appstore';
import type { Language } from '@/store/Appstore';

const { colors, spacing, typography, radius } = theme;

const TEACHER_NAME = 'Mr. Ahmad';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function SettingsRow({ icon, label, onPress, danger }: SettingsRowProps) {
  const isRTL = useAppStore((state) => state.isRTL);

  return (
    <TouchableOpacity
      style={[styles.row, isRTL && styles.rowRTL]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>{icon}</View>
      <Text
        style={[
          styles.rowLabel,
          danger && styles.rowLabelDanger,
          isRTL && styles.rowLabelRTL,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Ionicons
        name={isRTL ? 'chevron-back' : 'chevron-forward'}
        size={18}
        color={colors.textMuted}
      />
    </TouchableOpacity>
  );
}

export default function TeacherProfileScreen() {
  const { t } = useTranslation();
  const logout = useAuthStore((s) => s.logout);
  const language = useAppStore((s) => s.language);
  const isRTL = useAppStore((s) => s.isRTL);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setLangModalVisible(false);
  };

  const languages: { code: Language; native: string }[] = [
    { code: 'en', native: t('language.english') },
    { code: 'ar', native: t('language.arabic') },
  ];

  return (
    <ScreenWrapper padded={false}>
      <StatusBar style="dark" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.side} />
        <Text style={styles.topTitle}>{t('teacher.profile.title', 'Profile')}</Text>
        <View style={styles.side} />
      </View>

      {/* Hero Section with Avatar, Name, Role */}
      <View style={styles.hero}>
        <Avatar name={TEACHER_NAME} size="lg" />
        <Text variant="body" style={styles.name} numberOfLines={1}>
          {t('teacher.profile.name', TEACHER_NAME)}
        </Text>
        <Text variant="caption" style={styles.role} numberOfLines={1}>
          {t('teacher.profile.role', 'Special Education Teacher')}
        </Text>

        {/* Stats Row */}
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>{t('teacher.profile.students', 'Students')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>62%</Text>
            <Text style={styles.statLabel}>{t('teacher.profile.avgProgress', 'Avg Progress')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Grade 2</Text>
            <Text style={styles.statLabel}>{t('teacher.profile.grade', 'Grade')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Settings List */}
      <View style={styles.list}>
        <SettingsRow
          icon={
            <Image
              source={require('@/assets/images/icons/account.png')}
              style={styles.rowIconImg}
            />
          }
          label={t('teacher.profile.account', 'Account Info')}
          onPress={() => {}} 
        />
        <SettingsRow
          icon={
            <Image
              source={require('@/assets/images/icons/settings.png')}
              style={styles.rowIconImg}
            />
          }
          label={t('teacher.profile.language', 'Language')}
          onPress={() => setLangModalVisible(true)}
        />
        <SettingsRow
          icon={
            <Image
              source={require('@/assets/images/icons/forgot.png')}
              style={styles.rowIconImg}
            />
          }
          label={t('teacher.profile.privacy', 'Privacy Policy')}
          onPress={() => {}} 
        />
        <SettingsRow
          icon={<Ionicons name="log-out-outline" size={18} color={colors.error} />}
          label={t('teacher.profile.logout', 'Log Out')}
          onPress={handleLogout}
          danger
        />
      </View>

      {/* Language Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setLangModalVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>{t('language.select')}</Text>
            {languages.map((lang) => {
              const selected = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.langRow,
                    isRTL && styles.langRowRTL,
                    selected && styles.langRowSelected,
                  ]}
                  onPress={() => handleSelectLanguage(lang.code)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.langLabel,
                      selected && styles.langLabelSelected,
                      isRTL && styles.rowLabelRTL,
                    ]}
                  >
                    {lang.native}
                  </Text>
                  {selected ? (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  side: {
    width: 44,
    height: 44,
  },
  hero: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  name: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  role: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderLight,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  list: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDanger: {
    backgroundColor: colors.errorLight,
  },
  rowIconImg: {
    width: 20,
    height: 20,
    tintColor: colors.primary,
  },
  rowLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  rowLabelDanger: {
    color: colors.error,
  },
  rowLabelRTL: {
    textAlign: 'right',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sheetTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  langRowRTL: {
    flexDirection: 'row-reverse',
  },
  langRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundLight,
  },
  langLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  langLabelSelected: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
  },
});