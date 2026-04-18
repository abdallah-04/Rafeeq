
import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Image, ImageSourcePropType, I18nManager } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Text } from '@/components/modal/shared/Text';
import BackButton from '@/components/modal/shared/BackButton';
import Footer from '@/components/modal/shared/Footer';
import { theme } from '@/theme';

const { colors, spacing, typography, radius } = theme;

type Role = 'parent' | 'school' | 'teacher';

interface RoleOption {
  key: Role;
  icon: ImageSourcePropType;
  titleKey: string;
  descKey: string;
  route: string;
}

const ROLES: RoleOption[] = [
  {
    key: 'parent',
    icon: require('@/assets/images/icons/family.png'),
    titleKey: 'roleSelect.parentTitle',
    descKey: 'roleSelect.parentDesc',
    route: '/(auth)/signUp-parent',
  },
  {
    key: 'school',
    icon: require('@/assets/images/icons/school-icon.png'),
    titleKey: 'roleSelect.schoolTitle',
    descKey: 'roleSelect.schoolDesc',
    route: '/(auth)/signup-school',
  },
  {
    key: 'teacher',
    icon: require('@/assets/images/icons/influencer.png'),
    titleKey: 'roleSelect.teacherTitle',
    descKey: 'roleSelect.teacherDesc',
    route: '/(teacher)/students',
  },
];

function RoleCard({ option, onPress }: { option: RoleOption; onPress: (r: string) => void }) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => (scale.value = withSpring(0.97))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={() => onPress(option.route)}
        style={styles.card}
      >
        <View style={styles.iconCircle}>
          <Image source={option.icon} style={styles.icon} resizeMode="contain" />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{t(option.titleKey)}</Text>
          <Text style={styles.cardDesc}>{t(option.descKey)}</Text>
        </View>
        <Text style={styles.arrow}>{I18nManager.isRTL ? '‹' : '›'}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RoleSelectionScreen() {
  const { t, i18n } = useTranslation();

  // const handleLanguagePress = () => {
  //   // TODO: open language selector modal
  //   console.log('Language selector pressed');
  // };

  // const handlePrivacyPress = () => {
  //   // TODO: navigate to privacy policy screen
  //   router.push('/(auth)/privacy-policy');
  // };

  // const handleTermsPress = () => {
  //   // TODO: navigate to terms of service screen
  //   router.push('/(auth)/terms-of-service');
  // };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.topBar}>
        <BackButton onPress={router.back} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{t('roleSelect.title')}</Text>
        <Text style={styles.subtitle}>{t('roleSelect.subtitle')}</Text>

        <View style={styles.cards}>
          {ROLES.map((role) => (
            <RoleCard
              key={role.key}
              option={role}
              onPress={(route) => router.push(route as any)}
            />
          ))}
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>{t('roleSelect.alreadyHaveAccount')} </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>{t('roleSelect.logIn')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Footer
        onPrivacyPress={() => {}}
        onTermsPress={() => {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },

  topBar: {
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },

  body: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  subtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },

  cards: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    minHeight: 84,
  },

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    width: 30,
    height: 30,
    tintColor: colors.primary,
  },

  cardText: {
    flex: 1,
  },

  cardTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },

  cardDesc: {
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 19,
  },

  arrow: {
    fontSize: 26,
    color: colors.textMuted,
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loginText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },

  loginLink: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
});