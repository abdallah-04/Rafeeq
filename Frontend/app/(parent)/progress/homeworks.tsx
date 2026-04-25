import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import ScreenWrapper from '@/components/modal/shared/ScreenWap';
import Header from '@/components/modal/shared/Header';
import ProgressCard from '@/components/modal/parent/ProgressCard';
import TabBar from '@/components/modal/shared/TabBar';
import { Text } from '@/components/modal/shared/Text';
import QuizCard from '@/components/modal/parent/quizcard';
import { theme } from '@/theme';
import { apiGetHomeworkForParent, HomeworkResponse } from '@/services/api';
import { useActiveChildStore } from '@/store/activeChildStore';
import type { BadgeVariant } from '@/components/modal/parent/StatusBadge';

function toBadgeVariant(status: string): BadgeVariant {
  return status?.toLowerCase() === 'completed' ? 'completed' : 'start';
}

export default function HomeworksMain() {
  const { t, i18n } = useTranslation();
  const activeChild = useActiveChildStore((s) => s.activeChild);
  const tabs = useMemo(
    () => [
      t('progress.tabs.progress', 'Progress'),
      t('progress.tabs.quizzes', 'Quizzes'),
      t('activities.title', 'Activities'),
      t('homework.title', 'Homeworks'),
    ],
    [t]
  );

  const [activeTab, setActiveTab] = useState(tabs[3]);
  const [filter, setFilter] = useState<'todo' | 'done'>('todo');
  const [homeworks, setHomeworks] = useState<HomeworkResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(tabs[3]);
  }, [tabs]);

  useEffect(() => {
    let cancelled = false;

    if (!activeChild?.id) {
      setHomeworks([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    apiGetHomeworkForParent(activeChild.id)
      .then((data) => {
        if (!cancelled) {
          setHomeworks(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('common.error', 'Something went wrong'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeChild?.id, t]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(parent)/progress/progress-page' as any);
  };

  const handleTabChange = (tab: string) => {
    if (tab === tabs[0]) router.replace('/(parent)/progress/progress-page' as any);
    else if (tab === tabs[1]) router.replace('/(parent)/progress/quiz' as any);
    else if (tab === tabs[2]) router.replace('/(parent)/progress/activities' as any);
    else setActiveTab(tabs[3]);
  };

  const filteredHomeworks = homeworks.filter((item) =>
    filter === 'done'
      ? item.status?.toLowerCase() === 'completed'
      : item.status?.toLowerCase() !== 'completed'
  );

  const completedCount = homeworks.filter((item) => item.status?.toLowerCase() === 'completed').length;
  const percentage = homeworks.length ? Math.round((completedCount / homeworks.length) * 100) : 0;

  return (
    <ScreenWrapper padded={false} scroll={false}>
      <Header title={t('homework.title')} onBack={handleBack} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ProgressCard
          childName={activeChild?.fullNameAr ?? activeChild?.fullNameEn ?? t('homework.title')}
          monthLabel={t('homework.today', 'Today')}
          description={
            homeworks.length
              ? t('homework.progressSummary', {
                  completed: completedCount,
                  total: homeworks.length,
                  defaultValue: `${completedCount} of ${homeworks.length} tasks completed`,
                })
              : t('homework.noHomeworkYet', 'No homework yet')
          }
          percentage={percentage}
          mascotImage={require('@/assets/images/mascot/rafeeq_reading.png')}
        />

        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, filter === 'todo' && styles.activeToggle]}
            onPress={() => setFilter('todo')}
          >
            <Text style={[styles.toggleText, filter === 'todo' && styles.activeText]}>
              {t('homework.todo', 'To do')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, filter === 'done' && styles.activeToggle]}
            onPress={() => setFilter('done')}
          >
            <Text style={[styles.toggleText, filter === 'done' && styles.activeText]}>
              {t('homework.done', 'Done')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listSection}>
          {isLoading ? <ActivityIndicator color={theme.colors.primary} style={styles.centered} /> : null}
          {error ? <Text style={styles.messageText}>{error}</Text> : null}
          {!isLoading && !error && filteredHomeworks.length === 0 ? (
            <Text style={styles.messageText}>
              {t('homework.emptyState', 'No homework available for this child yet.')}
            </Text>
          ) : null}

          {filteredHomeworks.map((homework) => (
            <QuizCard
              key={homework.id}
              title={homework.title}
              questionsCount={homework.groupNumber ?? 1}
              durationMinutes={0}
              metaText={
                homework.dueDate
                  ? t('homework.dueDateLabel', {
                      date: new Date(homework.dueDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-JO' : 'en-GB'),
                      defaultValue: `Due ${new Date(homework.dueDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-JO' : 'en-GB')}`,
                    })
                  : t('homework.noDueDate', 'No due date')
              }
              status={toBadgeVariant(homework.status)}
              icon={require('@/assets/images/icons/math.png')}
              iconBgColor="#D1FAE5"
              iconTintColor="#059669"
              onPress={() =>
                router.push({
                  pathname: '/(parent)/progress/HomeworkDetail' as any,
                  params: { homeworkId: homework.id },
                })
              }
            />
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.radius.lg,
    padding: 4,
    marginTop: theme.spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.radius.md,
  },
  activeToggle: { backgroundColor: theme.colors.primary },
  toggleText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.textSecondary,
  },
  activeText: { color: theme.colors.white },
  listSection: { paddingBottom: 24, marginTop: theme.spacing.md },
  centered: { marginVertical: theme.spacing.md },
  messageText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.medium,
  },
});
