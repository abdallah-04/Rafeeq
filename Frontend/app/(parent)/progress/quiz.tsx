import React, { useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity, ScrollView, StatusBar, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/theme';

import ScreenWrapper from '@/components/modal/shared/ScreenWap';
import Header from '@/components/modal/shared/Header';
import ChildSelector from '@/components/modal/parent/ChildSelector';
import TabBar from '@/components/modal/shared/TabBar';
import QuizCard from '@/components/modal/parent/quizcard';
import { useActiveChildStore } from '@/store/activeChildStore';
import { Text } from '@/components/modal/shared/Text';
import { useTranslation } from 'react-i18next';
import { apiGetQuizzes, QuizResponse } from '@/services/api';
import type { BadgeVariant } from '@/components/modal/parent/StatusBadge';

function toBadgeVariant(status: string): BadgeVariant {
  const normalized = status?.toLowerCase();
  if (normalized === 'completed') return 'completed';
  if (normalized === 'in_progress') return 'in_progress';
  return 'new';
}

export default function QuizzesScreen() {
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
  const [activeTab, setActiveTab] = useState(tabs[1]);
  const activeChild = useActiveChildStore((s) => s.activeChild);
  const [quizzes, setQuizzes] = useState<QuizResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const childName = activeChild?.fullNameAr ?? activeChild?.fullNameEn ?? 'Zaid';
  const childAge = activeChild?.dateOfBirth
    ? Math.floor((Date.now() - new Date(activeChild.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : 6;
  const childBadges = [
    ...(activeChild?.level ? [{ label: `${t('common.level', 'Level')} ${activeChild.level}`, color: '#A78BFA' }] : []),
    { label: t('myChildren.years', { age: childAge }), color: '#60A5FA' },
  ];

  useEffect(() => {
    let cancelled = false;

    if (!activeChild?.id) {
      setQuizzes([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    apiGetQuizzes(activeChild.id)
      .then((data) => {
        if (!cancelled) {
          setQuizzes(data);
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
    if (tab === tabs[0]) {
      router.replace('/(parent)/progress/progress-page' as any);
      return;
    }
    if (tab === tabs[2]) {
      router.replace('/(parent)/progress/activities' as any);
      return;
    }
    if (tab === tabs[3]) {
      router.replace('/(parent)/progress/homeworks' as any);
      return;
    }
    setActiveTab(tabs[1]);
  };

  return (
    <ScreenWrapper padded={false} scroll={false}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />

      <Header
        title={t('progress.tabs.quizzes', 'Quizzes')}
        onBack={handleBack}
        rightElement={<HeaderRightButton onPress={() => router.push('/(parent)/settings' as any)} />}
      />

      <ChildSelector
        name={childName}
        age={childAge}
        avatar={require('@/assets/images/boy.png')}
        badges={childBadges}
        onPress={() => {}}
      />

      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>✏️ {t('progress.tabs.quizzes', "This week's quizzes")}</Text>
        </View>

        {isLoading ? <ActivityIndicator color={theme.colors.primary} style={styles.centered} /> : null}
        {error ? <Text style={styles.messageText}>{error}</Text> : null}
        {!isLoading && !error && quizzes.length === 0 ? (
          <Text style={styles.messageText}>
            {t('quiz.emptyState', 'No quizzes available for this child yet.')}
          </Text>
        ) : null}

        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz.id}
            title={quiz.title}
            questionsCount={quiz.totalQuestions ?? quiz.questions.length}
            durationMinutes={5}
            metaText={
              quiz.level != null
                ? t('quiz.levelMeta', {
                    level: quiz.level,
                    count: quiz.totalQuestions ?? quiz.questions.length,
                    defaultValue: `Level ${quiz.level} · ${quiz.totalQuestions ?? quiz.questions.length} questions`,
                  })
                : undefined
            }
            status={toBadgeVariant(quiz.status)}
            icon={require('@/assets/images/icons/math.png')}
            iconBgColor="#FDE68A"
            iconTintColor="#D97706"
            onPress={() => router.push(`/(parent)/progress/quiz/${quiz.id}` as any)}
          />
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

function HeaderRightButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.settingsBtn}>
      <Text style={styles.settingsIcon}>⚙️</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textPrimary,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  settingsIcon: { fontSize: 20 },
  centered: { marginVertical: theme.spacing.md },
  messageText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.medium,
  },
});
