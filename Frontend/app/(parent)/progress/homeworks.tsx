import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/theme';
import { useTranslation } from 'react-i18next';

import ScreenWrapper from '@/components/modal/shared/ScreenWap';
import Header from '@/components/modal/shared/Header';
import ProgressCard from '@/components/modal/parent/ProgressCard';
import TabBar from '@/components/modal/shared/TabBar';
import { Text } from '@/components/modal/shared/Text';
import QuizCard from '@/components/modal/parent/quizcard';

export default function HomeworksMain() {
  const { t } = useTranslation();
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

  return (
    <ScreenWrapper padded={false} scroll={false}>
      <Header title={t('homework.title')} onBack={handleBack} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ProgressCard
          childName="Zaid"
          monthLabel={t('homework.today')}
          description="2 of 5 tasks completed today"
          percentage={40}
          mascotImage={require('@/assets/images/mascot/rafeeq_reading.png')}
        />

        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, filter === 'todo' && styles.activeToggle]}
            onPress={() => setFilter('todo')}
          >
            <Text style={[styles.toggleText, filter === 'todo' && styles.activeText]}>
              {t('homework.todo')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, filter === 'done' && styles.activeToggle]}
            onPress={() => setFilter('done')}
          >
            <Text style={[styles.toggleText, filter === 'done' && styles.activeText]}>
              {t('homework.done')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listSection}>
          <Text variant="heading" style={styles.sectionTitle}>{t('homework.forToday')}</Text>
          <QuizCard
            title="Counting 1 to 10"
            questionsCount={5}
            durationMinutes={10}
            status={filter === 'todo' ? 'start' : 'repeat'}
            icon={require('@/assets/images/icons/math.png')}
            iconBgColor="#D1FAE5"
            iconTintColor="#059669"
            onPress={() => router.push('/(parent)/progress/HomeworkDetail' as any)}
          />

          {filter === 'todo' ? (
            <>
              <Text variant="heading" style={styles.sectionTitle}>{t('homework.notFinishedSince')}</Text>
              <QuizCard
                title="Counting 1 to 10"
                questionsCount={5}
                durationMinutes={10}
                status="start"
                icon={require('@/assets/images/icons/math.png')}
                iconBgColor="#D1FAE5"
                onPress={() => {}}
              />
            </>
          ) : null}
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
  sectionTitle: {
    fontSize: 14,
    marginVertical: theme.spacing.md,
    color: theme.colors.textPrimary,
  },
});
