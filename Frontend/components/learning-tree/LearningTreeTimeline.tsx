import React from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

import { theme } from '@/theme'
import { LearningTreeItemType, LearningTreeStep } from '@/utils/learningTree'

type Props = {
  levelLabel: string | number
  steps: LearningTreeStep[]
  readOnly?: boolean
  busyStepId?: string | null
  onStepPress?: (step: LearningTreeStep) => void
}

const { colors, spacing, typography } = theme

function stepTypeLabel(type: LearningTreeItemType, t: ReturnType<typeof useTranslation>['t']) {
  switch (type) {
    case 'homework':
      return t('tree.typeHomework', 'Homework')
    case 'activity':
      return t('tree.typeActivity', 'Activity')
    case 'quiz':
      return t('tree.typeQuiz', 'Quiz')
  }
}

function currentActionLabel(type: LearningTreeItemType, t: ReturnType<typeof useTranslation>['t']) {
  switch (type) {
    case 'homework':
      return t('tree.submitHomework', 'Submit Homework')
    case 'activity':
      return t('tree.openActivity', 'Open Activity')
    case 'quiz':
      return t('tree.startQuiz', 'Start Quiz')
  }
}

function typeBadgeColor(type: LearningTreeItemType) {
  switch (type) {
    case 'homework':
      return {
        backgroundColor: '#DBEAFE',
        foregroundColor: '#1D4ED8',
        iconName: 'notebook-outline' as const,
      }
    case 'activity':
      return {
        backgroundColor: '#FEF3C7',
        foregroundColor: '#B45309',
        iconName: 'palette-outline' as const,
      }
    case 'quiz':
      return {
        backgroundColor: '#EDE9FE',
        foregroundColor: '#7C3AED',
        iconName: 'pencil-outline' as const,
      }
  }
}

export default function LearningTreeTimeline({
  levelLabel,
  steps,
  readOnly = false,
  busyStepId = null,
  onStepPress,
}: Props) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const fonts = isRTL ? typography.fontFamilyAr : typography.fontFamily

  return (
    <View style={styles.timeline}>
      <View style={[styles.timelineLine, isRTL ? styles.timelineLineRTL : styles.timelineLineLTR]} />

      {steps.map((step) => {
        const stepTypeColors = typeBadgeColor(step.normalizedType)
        const statusLabel = step.isCompleted
          ? t('tree.completed', 'Completed')
          : step.isLocked
            ? t('tree.locked', 'Locked')
            : step.isCurrent
              ? t('tree.currentStep', 'Current')
              : t('tree.ready', 'Ready')
        const helperText = readOnly
          ? step.isLocked
            ? t('tree.teacherLockedHint', 'Locked until earlier steps are completed.')
            : step.isCurrent
              ? t('tree.teacherCurrentHint', 'This is the student current step.')
              : t('tree.teacherCompletedHint', 'This step has already been completed.')
          : step.isLocked
            ? t('tree.unlockPrevious', 'Complete the previous step to unlock this one.')
            : step.isCompleted
              ? t('tree.tapToReview', 'Tap to review details.')
              : step.isCurrent
                ? t('tree.tapToContinue', 'Tap to continue this step.')
                : t('tree.tapToOpen', 'Tap to open details.')
        const canPress = Boolean(onStepPress) && !readOnly && !step.isLocked
        const isBusy = busyStepId === step.id

        return (
          <View
            key={step.id}
            style={[styles.stepRow, isRTL && styles.stepRowRTL]}
          >
            <View style={styles.nodeColumn}>
              {step.isCurrent ? <View style={styles.currentHalo} /> : null}

              <TouchableOpacity
                activeOpacity={canPress ? 0.85 : 1}
                disabled={!canPress}
                onPress={() => onStepPress?.(step)}
                style={[
                  styles.node,
                  step.isCompleted && styles.nodeCompleted,
                  step.isCurrent && styles.nodeCurrent,
                  step.isLocked && styles.nodeLocked,
                ]}
              >
                {step.isCompleted ? (
                  <Ionicons name="checkmark" size={26} color={colors.white} />
                ) : step.isLocked ? (
                  <Ionicons name="lock-closed" size={18} color={colors.textMuted} />
                ) : (
                  <MaterialCommunityIcons
                    name={stepTypeColors.iconName}
                    size={26}
                    color={step.isCurrent ? colors.primary : colors.textPrimary}
                  />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={canPress ? 0.88 : 1}
              disabled={!canPress}
              onPress={() => onStepPress?.(step)}
              style={[
                styles.card,
                step.isCompleted && styles.cardCompleted,
                step.isCurrent && styles.cardCurrent,
                step.isLocked && styles.cardLocked,
              ]}
            >
              <View style={[styles.cardTopRow, isRTL && styles.rowReverse]}>
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: stepTypeColors.backgroundColor },
                    isRTL && styles.rowReverse,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={stepTypeColors.iconName}
                    size={16}
                    color={stepTypeColors.foregroundColor}
                  />
                  <Text
                    style={[
                      styles.typeBadgeText,
                      { color: stepTypeColors.foregroundColor, fontFamily: fonts.medium },
                    ]}
                  >
                    {stepTypeLabel(step.normalizedType, t)}
                  </Text>
                </View>

                <View style={styles.stepChip}>
                  <Text style={[styles.stepChipText, { fontFamily: fonts.bold }]}>
                    {t('tree.step', 'Step')} {step.stepNumber}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.title,
                  { fontFamily: fonts.bold, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {step.title ?? t('tree.item', 'Learning item')}
              </Text>

              {step.description ? (
                <Text
                  style={[
                    styles.description,
                    { fontFamily: fonts.regular, textAlign: isRTL ? 'right' : 'left' },
                  ]}
                  numberOfLines={2}
                >
                  {step.description}
                </Text>
              ) : null}

              <View style={[styles.metaRow, isRTL && styles.rowReverseWrap]}>
                <View style={styles.metaChip}>
                  <Text style={[styles.metaChipText, { fontFamily: fonts.medium }]}>
                    {t('tree.day', 'Day')} {step.dayNumber}
                  </Text>
                </View>
                <View style={styles.metaChip}>
                  <Text style={[styles.metaChipText, { fontFamily: fonts.medium }]}>
                    {t('common.level', 'Level')} {levelLabel}
                  </Text>
                </View>
              </View>

              <View style={[styles.footer, isRTL && styles.rowReverse]}>
                <View
                  style={[
                    styles.statusChip,
                    step.isCompleted && styles.statusChipCompleted,
                    step.isCurrent && styles.statusChipCurrent,
                    step.isLocked && styles.statusChipLocked,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      step.isCompleted && styles.statusChipTextCompleted,
                      step.isCurrent && styles.statusChipTextCurrent,
                      step.isLocked && styles.statusChipTextLocked,
                      { fontFamily: fonts.medium },
                    ]}
                  >
                    {statusLabel}
                  </Text>
                </View>

                {!readOnly && step.isCurrent ? (
                  <View style={styles.actionButton}>
                    {isBusy ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={[styles.actionButtonText, { fontFamily: fonts.bold }]}>
                        {currentActionLabel(step.normalizedType, t)}
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.helperText,
                      { fontFamily: fonts.medium, textAlign: isRTL ? 'right' : 'left' },
                    ]}
                  >
                    {helperText}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  timeline: {
    position: 'relative',
    gap: spacing.md,
  },
  timelineLine: {
    position: 'absolute',
    top: 12,
    bottom: 12,
    width: 4,
    borderRadius: 999,
    backgroundColor: '#D9E8FF',
  },
  timelineLineLTR: {
    left: 34,
  },
  timelineLineRTL: {
    right: 34,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepRowRTL: {
    flexDirection: 'row-reverse',
  },
  nodeColumn: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  currentHalo: {
    position: 'absolute',
    top: 0,
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(91, 141, 239, 0.24)',
    backgroundColor: 'rgba(219, 234, 254, 0.42)',
  },
  node: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#D0DFF8',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5B8DEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  nodeCompleted: {
    backgroundColor: colors.primary,
    borderColor: '#BFD6FF',
  },
  nodeCurrent: {
    borderColor: colors.primary,
  },
  nodeLocked: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
    shadowOpacity: 0,
    elevation: 0,
  },
  card: {
    flex: 1,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardCompleted: {
    borderColor: '#CFE0FF',
    backgroundColor: '#F8FBFF',
  },
  cardCurrent: {
    borderColor: colors.primary,
    backgroundColor: '#EEF4FF',
  },
  cardLocked: {
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFBFD',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  typeBadgeText: {
    fontSize: 12,
  },
  stepChip: {
    borderRadius: 999,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stepChipText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metaChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
  },
  metaChipText: {
    fontSize: 12,
    color: '#1D4ED8',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#E5E7EB',
  },
  statusChipCompleted: {
    backgroundColor: '#D1FAE5',
  },
  statusChipCurrent: {
    backgroundColor: '#DBEAFE',
  },
  statusChipLocked: {
    backgroundColor: '#F3F4F6',
  },
  statusChipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusChipTextCompleted: {
    color: '#047857',
  },
  statusChipTextCurrent: {
    color: '#1D4ED8',
  },
  statusChipTextLocked: {
    color: '#9CA3AF',
  },
  actionButton: {
    minWidth: 120,
    borderRadius: theme.radius.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: colors.white,
    textAlign: 'center',
  },
  helperText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  rowReverseWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
  },
})
