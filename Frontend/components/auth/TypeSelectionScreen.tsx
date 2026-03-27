// src/screens/auth/TypeSelectionScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { PenguinMascot } from '../common/PenguinMascot';
import { UserRole } from '../../types/user';

interface UserTypeOption {
  role: UserRole;
  title: string;
  description: string;
  icon: string; // emoji or icon name
}

const userTypes: UserTypeOption[] = [
  {
    role: UserRole.PARENT,
    title: 'Parent',
    description: 'Monitor your child\'s progress and activities',
    icon: '👨‍👩‍👧',
  },
  {
    role: UserRole.TEACHER,
    title: 'Teacher',
    description: 'Manage students and assign learning tasks',
    icon: '👨‍🏫',
  },
  {
    role: UserRole.ADMIN,
    title: 'School',
    description: 'Oversee teachers and school operations',
    icon: '🏫',
  },
];

interface TypeSelectionScreenProps {
  onSelectType: (role: UserRole) => void;
}

export const TypeSelectionScreen: React.FC<TypeSelectionScreenProps> = ({
  onSelectType,
}) => {
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>RAFEEQ</Text>
        <Text style={styles.logoArabic}>رفيق</Text>
      </View>

      <View style={styles.mascotContainer}>
        <PenguinMascot variant="welcome" size="large" />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome to RAFEEQ</Text>
        <Text style={styles.subtitle}>
          Who are you? Choose your account type to get started with Rafeeq
        </Text>
      </View>

      <View style={styles.typesContainer}>
        <Text style={styles.typeLabel}>type</Text>
        
        {userTypes.map((type) => (
          <TouchableOpacity
            key={type.role}
            style={styles.typeCard}
            onPress={() => onSelectType(type.role)}
            activeOpacity={0.7}
          >
            <View style={styles.typeIconContainer}>
              <Text style={styles.typeIcon}>{type.icon}</Text>
            </View>
            <View style={styles.typeInfo}>
              <Text style={styles.typeTitle}>{type.title}</Text>
              <Text style={styles.typeDescription}>{type.description}</Text>
            </View>
            <View style={styles.typeArrow}>
              <Text style={styles.arrowIcon}>→</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.footerLink}>Log in</Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  logoArabic: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  mascotContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: typography.fontSize.base * 1.5,
  },
  typesContainer: {
    marginBottom: spacing.xl,
  },
  typeLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textMuted,
    marginBottom: spacing.md,
    textTransform: 'lowercase',
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  typeIcon: {
    fontSize: 24,
  },
  typeInfo: {
    flex: 1,
  },
  typeTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  typeDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  typeArrow: {
    marginLeft: spacing.sm,
  },
  arrowIcon: {
    fontSize: 20,
    color: colors.textMuted,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  footerLink: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
  },
});