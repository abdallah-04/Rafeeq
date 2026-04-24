/**
 * app/(parent)/MyChildrenEmpty.tsx
 *
 * "My Children — Empty State" screen.
 * Shown when a parent has logged in but has not yet added any children.
 *
 * RTL: every flex layout uses `row` direction which automatically mirrors in
 * RTL.  The BackButton component is already RTL-aware.  The progress bar is
 * not rendered here.  Text is center-aligned so no special mirroring is
 * needed.
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  BackHandler,
  Platform,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';

import { theme } from '@/theme';
import { Text } from '@/components/modal/shared/Text';
import { Button } from '@/components/modal/shared/Button';
import BackButton from '@/components/modal/shared/BackButton';
import Footer from '@/components/modal/shared/Footer';
import { useModal } from '@/components/modal/ModalProvider';
import { performLogout } from '@/utils/logout';

const { colors, spacing, typography, radius } = theme;

/* ─── Ghost slot (dashed placeholder card) ──────────────────────────────── */

function GhostSlot({ faded }: { faded?: boolean }) {
  return (
    <View style={[styles.slot, faded && styles.slotFaded]}>
      {/* Plus circle */}
      <View style={styles.slotCircle}>
        <Text style={styles.slotPlus}>+</Text>
      </View>

      {/* Placeholder bars */}
      <View style={styles.slotLines}>
        <View style={styles.slotLineWide} />
        <View style={styles.slotLineNarrow} />
      </View>
    </View>
  );
}

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export default function MyChildrenEmptyScreen() {
  const { t } = useTranslation();
  const { show } = useModal();
  const lastBackPressRef = React.useRef(0);
  const isLoggingOutRef = React.useRef(false);

  const handleAdd = () => show('addChild');

  const handleLogoutBackPress = React.useCallback(() => {
    if (isLoggingOutRef.current) return true;

    const now = Date.now();
    if (now - lastBackPressRef.current < 2000) {
      isLoggingOutRef.current = true;
      void performLogout();
      return true;
    }

    lastBackPressRef.current = now;
    if (Platform.OS === 'android') {
      ToastAndroid.show('Press again to logout', ToastAndroid.SHORT);
    }
    return true;
  }, []);

  React.useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleLogoutBackPress();
      return true;
    });

    return () => subscription.remove();
  }, [handleLogoutBackPress]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={handleLogoutBackPress} />
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
          source={require('@/assets/images/mascot/rafeeq_waving.png')}
          style={styles.mascot}
          resizeMode="contain"
        />

        {/* Heading */}
        <Text style={styles.emptyHeading}>{t('myChildren.emptyHeading')}</Text>

        {/* Body */}
        <Text style={styles.emptyBody}>{t('myChildren.emptyBody')}</Text>

        {/* Ghost slots */}
        <View style={styles.slots}>
          <GhostSlot />
          <GhostSlot faded />
        </View>

        {/* CTA */}
        <Button
          label={t('myChildren.addFirst')}
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

  /* Scroll content */
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },

  /* Mascot */
  mascot: {
    width: 110,
    height: 110,
  },

  /* Heading */
  emptyHeading: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    textAlign: 'center',
  },

  /* Body */
  emptyBody: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },

  /* Ghost slots container */
  slots: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.sm,
  },

  /* Ghost slot — dashed blue border, light-blue fill */
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
  slotFaded: {
    opacity: 0.45,
  },

  /* Plus circle inside slot */
  slotCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotPlus: {
    fontSize: 22,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },

  /* Placeholder bars */
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
