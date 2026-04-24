import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/modal/shared/Text';
import BottomNav from '@/components/modal/shared/BottomNav';
import ScreenWrapper from '@/components/modal/shared/ScreenWap';
import Avatar from '@/components/modal/shared/Avatar';
import { theme } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { performLogout } from '@/utils/logout';
import type { Language } from '@/types';

const { colors, spacing, typography, radius } = theme;


/* ─── Generic tappable row ─────────────────────────────────────────────────── */

interface RowProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function SettingsRow({ icon, label, onPress, danger }: RowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>{icon}</View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      <Text style={styles.rowChevron}>›</Text>
    </TouchableOpacity>
  );
}

/* ─── Screen ────────────────────────────────────────────────────────────────── */

export default function ProfileScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const language    = useAuthStore((s) => s.language);
  const setLanguage = useAuthStore((s) => s.setLanguage);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const displayName = useMemo(() => {
    const candidates = [user?.nameAr, user?.name, user?.phone, user?.nationalId];
    return candidates.find((value) => typeof value === 'string' && value.trim().length > 0)?.trim()
      ?? t('roleSelect.parentTitle');
  }, [t, user?.nameAr, user?.name, user?.phone, user?.nationalId]);

  const handleLogout = () => performLogout();

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setLangModalVisible(false);
  };

  const LANGUAGES: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: t('language.english'), native: 'English' },
    { code: 'ar', label: t('language.arabic'),  native: 'العربية' },
  ];

  return (
    <ScreenWrapper padded={false}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.topBar}>
        <View style={styles.side} />
        <Text style={styles.topTitle}>{t('profile.title')}</Text>
        <View style={styles.side} />
      </View>

      {/* Avatar + name */}
      <View style={styles.hero}>
        <Avatar name={displayName} size="lg" />
        <Text variant="body" style={styles.name}>{displayName}</Text>
        <Text variant="caption" style={styles.role}>{t('roleSelect.parentTitle')}</Text>
      </View>

      <View style={styles.divider} />

      {/* Settings list */}
      <View style={styles.list}>
        <SettingsRow
          icon={
            <Image
              source={require('@/assets/images/icons/account.png')}
              style={styles.rowIconImg}
            />
          }
          label={t('profile.myChildrenRow')}
          onPress={() => router.push('/(parent)/myChildren')}
        />
        <SettingsRow
          icon={
            <Image
              source={require('@/assets/images/icons/settings.png')}
              style={styles.rowIconImg}
            />
          }
          label={t('profile.language')}
          onPress={() => setLangModalVisible(true)}
        />

        <SettingsRow
          icon={<Text style={styles.logoutIcon}>⎋</Text>}
          label={t('profile.logout')}
          onPress={handleLogout}
          danger
        />
      </View>

      <BottomNav />

      {/* Language picker modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setLangModalVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>{t('language.select')}</Text>
            {LANGUAGES.map((lang) => {
              const selected = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langRow, selected && styles.langRowSelected]}
                  onPress={() => handleSelectLanguage(lang.code)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.langLabel, selected && styles.langLabelSelected]}>
                    {lang.native}
                  </Text>
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenWrapper>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
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

  /* Row */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
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
  rowChevron: {
    fontSize: 20,
    color: colors.textMuted,
  },
  logoutIcon: {
    fontSize: 18,
    color: colors.error,
  },
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
checkmark: {
  fontSize: 16,
  color: colors.primary,
  fontFamily: typography.fontFamily.bold,
},
});
