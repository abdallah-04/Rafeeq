import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, ScrollView, StatusBar, StyleSheet } from 'react-native';
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

interface Quiz {
  id: string;
  title: string;
  icon: any;
  iconBgColor: string;
  iconTintColor?: string;
  questionsCount: number;
  durationMinutes: number;
  status: 'completed' | 'in_progress' | 'new';
}

const MOCK_QUIZZES: Quiz[] = [
  {
    id: '1',
    title: "Color's quiz",
    icon: require('@/assets/images/icons/color.png'),
    iconBgColor: '#BBF7D0',
    iconTintColor: '#00C688',
    questionsCount: 10,
    durationMinutes: 5,
    status: 'completed',
  },
  {
    id: '2',
    title: 'Numbers (1-10)',
    icon: require('@/assets/images/icons/math.png'),
    iconBgColor: '#FDE68A',
    iconTintColor: '#D97706',
    questionsCount: 10,
    durationMinutes: 5,
    status: 'in_progress',
  },
  {
    id: '3',
    title: 'Animals sounds',
    icon: require('@/assets/images/icons/animal.png'),
    iconBgColor: '#DDD6FE',
    iconTintColor: '#7C3AED',
    questionsCount: 10,
    durationMinutes: 5,
    status: 'new',
  },
];

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
  const childName = activeChild?.fullNameAr ?? activeChild?.fullNameEn ?? 'Zaid';
  const childAge = activeChild?.dateOfBirth
    ? Math.floor((Date.now() - new Date(activeChild.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : 6;
  const childBadges = [
    ...(activeChild?.level ? [{ label: `${t('common.level', 'Level')} ${activeChild.level}`, color: '#A78BFA' }] : []),
    { label: t('myChildren.years', { age: childAge }), color: '#60A5FA' },
  ];

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
          <TouchableOpacity onPress={() => router.push('/(parent)/quizes-all' as any)}>
            <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
          </TouchableOpacity>
        </View>

        {MOCK_QUIZZES.map((quiz) => (
          <QuizCard
            key={quiz.id}
            {...quiz}
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
  seeAll: {
    fontSize: 13,
    fontFamily: 'Lexend_400Regular',
    color: theme.colors.primary,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  settingsIcon: { fontSize: 20 },
});
