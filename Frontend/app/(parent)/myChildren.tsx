/**
 * app/(parent)/myChildren.tsx
 *
 * "My Children — Populated List" screen.
 *
 * Entry points:
 *   1. Post-login router (index.tsx) when parent has ≥ 1 child.
 *   2. Profile tab → "My children" row.
 *
 * RTL notes:
 *   • All flex rows mirror automatically under I18nManager.isRTL.
 *   • ProgressBar already handles RTL via alignSelf.
 *   • BackButton is RTL-aware.
 *   • The progress percent label is placed with `marginStart` so it stays on
 *     the logical "end" side in both LTR and RTL.
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';

import { theme } from '@/theme';
import { Text } from '@/components/modal/shared/Text';
import { Button } from '@/components/modal/shared/Button';
import BackButton from '@/components/modal/shared/BackButton';
import Avatar from '@/components/modal/shared/Avatar';
import ProgressBar from '@/components/modal/shared/progressBar';
import Footer from '@/components/modal/shared/Footer';
import { useModal } from '@/components/modal/ModalProvider';
import { useAppStore } from '@/store/Appstore';
import { useActiveChildStore } from '@/store/activeChildStore';
import type { Child } from '@/store/Appstore';

const { colors, spacing, typography, radius } = theme;

/* ─── Child card ─────────────────────────────────────────────────────────── */

function ChildCard({ child }: { child: Child }) {
  const { t } = useTranslation();
  const setActiveChild = useActiveChildStore((s) => s.setActiveChild);

  const handlePress = () => {
    setActiveChild(child);
    router.push('/(parent)/Home-parent');
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={handlePress}
      accessibilityRole="button"
    >
      {/* Avatar */}
      <Avatar
        imageUri={child.avatarUrl}
        name={child.name}
        size="md"
      />

      {/* Info */}
      <View style={styles.cardInfo}>
        {/* Name + age */}
        <Text style={styles.cardName}>
          {child.name}
          {child.age ? `, ${t('myChildren.years', { age: child.age })}` : ''}
        </Text>

        {/* Progress row: label above bar */}
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            {child.progress}%
          </Text>
        </View>
        <ProgressBar value={child.progress} height={6} showLabel={false} />
      </View>
    </TouchableOpacity>
  );
}

/* ─── Ghost "add" slot ───────────────────────────────────────────────────── */

function AddSlot({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.slot}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={styles.slotCircle}>
        <Text style={styles.slotPlus}>+</Text>
      </View>

      <View style={styles.slotLines}>
        <View style={styles.slotLineWide} />
        <View style={styles.slotLineNarrow} />
      </View>
    </TouchableOpacity>
  );
}

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export default function MyChildrenListScreen() {
  const { t } = useTranslation();
  const { show } = useModal();
  const children = useAppStore((s) => s.children);

  const handleAdd = () => show('addChild');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>{t('myChildren.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Mascot */}
        <Image
          source={require('@/assets/images/mascot/rafeeq_like.png')}
          style={styles.mascot}
          resizeMode="contain"
        />

        {/* Heading */}
        <Text style={styles.listTitle}>{t('myChildren.manageHeading')}</Text>

        {/* Children list + ghost slot */}
        <View style={styles.list}>
          {children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}

          {/* Ghost "add more" slot */}
          <AddSlot onPress={handleAdd} />
        </View>

        {/* Add more button */}
        <Button
          label={t('myChildren.addMore')}
          onPress={handleAdd}
          style={styles.btn}
        />

        {/* Footer */}
        <Footer
          currentLanguage={t('language.current')}
          onLanguagePress={() => {}}
          onPrivacyPress={() => {}}
          onTermsPress={() => {}}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 36,
  },

  /* Scroll */
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },

  /* Mascot */
  mascot: {
    width: 100,
    height: 100,
  },

  /* Heading */
  listTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    textAlign: 'center',
  },

  /* Card list */
  list: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.sm,
  },

  /* Child card */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  progressLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    marginBottom: 2,
  },

  /* Ghost add slot */
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: radius.xl,
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
  },
  slotCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotPlus: {
    fontSize: 22,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  slotLines: {
    flex: 1,
    gap: spacing.xs,
  },
  slotLineWide: {
    height: 10,
    width: '75%',
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
  },
  slotLineNarrow: {
    height: 10,
    width: '50%',
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
  },

  /* CTA button */
  btn: {
    width: '100%',
    marginTop: spacing.sm,
  },
});
