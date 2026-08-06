import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Text } from '@/components/modal/shared/Text'
import { theme } from '@/theme'

export type CompletionFilterValue = 'todo' | 'done'

type CompletionFilterProps = {
  value: CompletionFilterValue
  onChange: (value: CompletionFilterValue) => void
}

export default function CompletionFilter({ value, onChange }: CompletionFilterProps) {
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, value === 'todo' && styles.activeButton]}
        onPress={() => onChange('todo')}
      >
        <Text style={[styles.text, value === 'todo' && styles.activeText]}>
          {t('homework.todo', 'To do')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, value === 'done' && styles.activeButton]}
        onPress={() => onChange('done')}
      >
        <Text style={[styles.text, value === 'done' && styles.activeText]}>
          {t('homework.done', 'Done')}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.radius.lg,
    padding: 4,
    marginTop: theme.spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.radius.md,
  },
  activeButton: {
    backgroundColor: theme.colors.primary,
  },
  text: {
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.textSecondary,
  },
  activeText: {
    color: theme.colors.white,
  },
})
