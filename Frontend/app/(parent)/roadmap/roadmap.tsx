import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '@/theme'
import { useTranslation } from 'react-i18next'
import BackButton from '@/components/modal/shared/BackButton'
import {
  apiCompleteTreeItem,
  apiGenerateLearningTree,
  apiGetLearningTree,
  apiGetTreeItems,
  LearningTreeResponse,
  TreeItemResponse,
} from '@/services/api'
import { useActiveChildStore } from '@/store/activeChildStore'

const { colors, spacing, typography } = theme

function statusLabel(status: string, t: ReturnType<typeof useTranslation>['t']) {
  switch (status?.toLowerCase()) {
    case 'completed':
      return t('statusBadge.completed', 'Completed')
    case 'active':
      return t('tree.active', 'Active')
    default:
      return t('statusBadge.start', 'Start')
  }
}

export default function TreeScreen() {
  const { t } = useTranslation()
  const activeChild = useActiveChildStore((s) => s.activeChild)
  const [tree, setTree] = useState<LearningTreeResponse | null>(null)
  const [items, setItems] = useState<TreeItemResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTree = useCallback(async () => {
    if (!activeChild?.id) {
      setTree(null)
      setItems([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [treeResponse, itemResponse] = await Promise.all([
        apiGetLearningTree(activeChild.id),
        apiGetTreeItems(activeChild.id),
      ])
      setTree(treeResponse)
      setItems(itemResponse)
    } catch (err) {
      setTree(null)
      setItems([])
      setError(err instanceof Error ? err.message : t('common.error', 'Something went wrong'))
    } finally {
      setLoading(false)
    }
  }, [activeChild?.id, t])

  useEffect(() => {
    loadTree()
  }, [loadTree])

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/(parent)/Home-parent' as any)
  }

  const handleGenerate = async () => {
    if (!activeChild?.id) return
    setGenerating(true)
    setError(null)
    try {
      await apiGenerateLearningTree(activeChild.id)
      await loadTree()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error', 'Something went wrong'))
    } finally {
      setGenerating(false)
    }
  }

  const handleComplete = async (itemId: string) => {
    try {
      await apiCompleteTreeItem(itemId)
      await loadTree()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error', 'Something went wrong'))
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <BackButton onPress={handleBack} />
        <Text style={styles.headerTitle}>{t('tree.title', 'Learning Tree')}</Text>
        <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.8} onPress={handleGenerate} disabled={generating}>
          <Text style={styles.settingsIcon}>{generating ? '…' : '↻'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {tree?.topic ?? t('tree.noTopic', 'Learning Tree')}
          </Text>
          <Text style={styles.summaryBody}>
            {tree?.summary ?? t('tree.emptySummary', 'Generate a tree after placement to see the child learning path.')}
          </Text>
          <View style={styles.summaryMetaRow}>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>
                {t('common.level', 'Level')} {tree?.level ?? activeChild?.level ?? '--'}
              </Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>
                {statusLabel(tree?.status ?? 'pending', t)}
              </Text>
            </View>
          </View>
        </View>

        {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
        {!loading && error ? <Text style={styles.messageText}>{error}</Text> : null}

        {!loading && !tree ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{t('tree.emptyTitle', 'No learning tree yet')}</Text>
            <Text style={styles.emptyBody}>
              {t('tree.emptyBody', 'Generate the child learning tree after placement to unlock activities, homework, and quizzes.')}
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleGenerate} disabled={generating}>
              <Text style={styles.primaryBtnText}>
                {generating ? t('tree.generating', 'Generating...') : t('tree.generate', 'Generate Tree')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {items.map((item) => {
          const isCompleted = item.completed || item.status?.toLowerCase() === 'completed'
          const isLocked = item.locked && !isCompleted

          return (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemIcon}>
                  <Text style={styles.itemIconText}>
                    {item.itemType === 'activity' ? '🎨' : item.itemType === 'homework' ? '📘' : '📝'}
                  </Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.title ?? t('tree.item', 'Learning item')}</Text>
                  {item.description ? <Text style={styles.itemDescription}>{item.description}</Text> : null}
                </View>
              </View>

              <View style={styles.itemFooter}>
                <Text style={styles.itemStatus}>
                  {isCompleted
                    ? t('statusBadge.completed', 'Completed')
                    : isLocked
                      ? t('tree.locked', 'Locked')
                      : t('tree.ready', 'Ready')}
                </Text>
                {!isCompleted && !isLocked ? (
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => handleComplete(item.id)}>
                    <Text style={styles.secondaryBtnText}>{t('tree.complete', 'Mark Complete')}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  settingsBtn: {
    width: 40,
    alignItems: 'flex-end',
  },
  settingsIcon: {
    fontSize: 22,
    color: colors.primary,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  summaryCard: {
    backgroundColor: '#EEF4FF',
    borderRadius: theme.radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  summaryBody: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  metaChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
  },
  metaChipText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    color: '#1D4ED8',
  },
  loader: {
    marginTop: spacing.lg,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: theme.radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  emptyBody: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  primaryBtn: {
    marginTop: spacing.sm,
    borderRadius: theme.radius.lg,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.white,
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: theme.radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  itemIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconText: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  itemDescription: {
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemStatus: {
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  secondaryBtn: {
    borderRadius: theme.radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#DBEAFE',
  },
  secondaryBtnText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
    color: '#1D4ED8',
  },
  messageText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontFamily: typography.fontFamily.medium,
  },
})
