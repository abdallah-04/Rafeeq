import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { theme } from '@/theme';
import { useActiveChildStore } from '@/store/activeChildStore';
import { apiGetChildSummary } from '@/services/api';
import { Text } from '@/components/modal/shared/Text';
import ScreenWrapper from '@/components/modal/shared/ScreenWap';
import Header from '@/components/modal/shared/Header';
import ChildSelector from '@/components/modal/parent/ChildSelector';
import TabBar from '@/components/modal/shared/TabBar';
import ProgressCard from '@/components/modal/parent/ProgressCard';
import ProgressSummary, { SkillItem } from '@/components/modal/parent/ProgressSummary';
import { pickLocalizedName } from '@/utils/localizedName';

type SummaryLevelResponse = {
  assessedLevel?: number | null;
  level?: number | null;
};

export default function ProgressScreen() {
  const { t, i18n } = useTranslation();
  const activeChild = useActiveChildStore((s) => s.activeChild);
  const [activeTab, setActiveTab] = useState('');
  const [summaryLevel, setSummaryLevel] = useState<number | null>(null);

  const tabs = useMemo(
    () => [
      t('progress.tabs.progress', 'Progress'),
      t('progress.tabs.quizzes', 'Quizzes'),
      t('activities.title', 'Activities'),
      t('homework.title', 'Homeworks'),
    ],
    [t]
  );

  useEffect(() => {
    setActiveTab(tabs[0]);
  }, [tabs]);

  const childLevel = activeChild?.assessedLevel ?? activeChild?.level ?? null;

  useEffect(() => {
    if (!activeChild) {
      setSummaryLevel(null);
      return;
    }

    if (childLevel !== null) {
      setSummaryLevel(null);
      return;
    }

    let cancelled = false;

    apiGetChildSummary(activeChild.id)
      .then((s) => {
        if (!cancelled) {
          const fetchedLevel =
            (s as SummaryLevelResponse).assessedLevel ??
            (s as SummaryLevelResponse).level ??
            null;
          setSummaryLevel(fetchedLevel);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSummaryLevel(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeChild?.id, childLevel]);

  const childName = pickLocalizedName(i18n.language === 'ar', activeChild?.fullNameAr, activeChild?.fullNameEn);
  const childAge = activeChild?.dateOfBirth
    ? Math.floor((Date.now() - new Date(activeChild.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : 0;
  const level = childLevel ?? summaryLevel;
  const levelPct = level ? Math.min(level * 20, 100) : 0;
  const skills: SkillItem[] = level
    ? [{ label: t('progress.assessedLevel', 'Assessed Level'), percentage: levelPct, color: '#5B8DEF' }]
    : [];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(parent)/Home-parent' as any);
  };

  const handleTabChange = (tab: string) => {
    if (tab === tabs[1]) {
      router.replace('/(parent)/progress/quiz' as any);
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
    setActiveTab(tabs[0]);
  };

  return (
    <ScreenWrapper padded={false} scroll={false}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />

      <Header
        title={t('progress.title')}
        onBack={handleBack}
        rightElement={<HeaderRightButton onPress={() => router.push('/(parent)/settings' as any)} />}
      />

      <ChildSelector
        name={childName}
        age={childAge}
        avatar={require('@/assets/images/boy.png')}
        badges={level ? [{ label: `${t('common.level', 'Level')} ${level}`, color: '#A78BFA' }] : []}
        onPress={() => {}}
      />

      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      <View style={styles.content}>
        <ProgressCard
          childName={childName}
          monthLabel={t('progress.thisMonth', 'This Month')}
          description={t('progress.description', 'Keep going!')}
          percentage={levelPct}
          mascotImage={require('@/assets/images/mascot/rafeeq_reading.png')}
        />
        <ProgressSummary
          title={t('progress.summary')}
          items={skills}
          onViewDetails={() => router.push('/(parent)/progress-details' as any)}
        />
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  settingsIcon: {
    fontSize: 20,
  },
});
