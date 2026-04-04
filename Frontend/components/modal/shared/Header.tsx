import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import BackButton from './BackButton';
import { Text } from './Text';
import { theme } from '@/theme';

interface Props {
  title: string;
  onBack?: () => void;
  rightElement?: ReactNode;
}

export default function Header({ title, onBack, rightElement }: Props) {
  return (
    <View style={styles.container}>
      <BackButton onPress={onBack} />

      <Text variant="heading" style={styles.title}>
        {title}
      </Text>

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
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: theme.colors.textPrimary,
  },
  right: {
    width: 36,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 36,
  },
});