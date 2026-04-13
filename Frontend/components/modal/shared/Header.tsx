import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import BackButton from './BackButton';
import { Text } from './Text';
import { theme } from '@/theme';

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightElement?: ReactNode;
}

export default function Header({ title, subtitle, onBack, rightElement }: Props) {
  return (
    <View style={styles.container}>
      <BackButton onPress={onBack} />

      <View style={styles.titleContainer}>
        <Text variant="heading" style={styles.title}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.right}>
        {rightElement ?? <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  right: {
    width: 36,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 36,
  },
});