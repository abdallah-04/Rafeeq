import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/modal/shared/Text';
import BottomNav from '@/components/modal/shared/BottomNav';
import ScreenWrapper from '@/components/modal/shared/ScreenWap';
import Avatar from '@/components/modal/shared/Avatar';
import { theme } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/Appstore';

const { colors, spacing, typography, radius } = theme;

const PARENT_NAME = 'Ayoub';

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
  const authLogout = useAuthStore((s) => s.logout);
  const appLogout = useAppStore((s) => s.logout);

  const handleLogout = () => {
    authLogout();
    appLogout();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenWrapper padded={false}>
      <StatusBar style="dark" />

      {/* Header */}
    <View style={styles.topBar}>
      <View style={styles.side} />
    <Text style={styles.topTitle}>
    {t('profile.title').replace(' Assistant', '')}
     </Text>
   <View style={styles.side} />
  </View>

      {/* Avatar + name */}
      <View style={styles.hero}>
        <Avatar name={PARENT_NAME} size="lg" />
        <Text variant="body" style={styles.name}>{PARENT_NAME}</Text>
        <Text variant="caption" style={styles.role}>Parent</Text>
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
          icon={<Text style={styles.logoutIcon}>⎋</Text>}
          label={t('profile.logout')}
          onPress={handleLogout}
          danger
        />
      </View>

      <BottomNav />
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
});
