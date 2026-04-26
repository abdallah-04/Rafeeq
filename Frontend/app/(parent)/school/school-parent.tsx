import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { theme } from '@/theme';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import ScreenWrapper from '@/components/modal/shared/ScreenWap';
import Header from '@/components/modal/shared/Header';
import TabBar from '@/components/modal/shared/TabBar';
import Card from '@/components/modal/shared/Card';
import { Text } from '@/components/modal/shared/Text';
import SchoolCard from '@/components/modal/parent/schoolCard';
import { useActiveChildStore } from '@/store/activeChildStore';

export default function SchoolScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('');
  const activeChild = useActiveChildStore((s) => s.activeChild);

  const tabs = useMemo(
    () => [
      t('schoolPage.tabs.grades', 'Grades'),
      t('schoolPage.tabs.homework', 'HW & Tasks'),
      t('schoolPage.tabs.progress', 'Progress'),
      t('schoolPage.tabs.reports', 'Reports'),
    ],
    [t]
  );

  useEffect(() => {
    setActiveTab(tabs[0]);
  }, [tabs]);

  useEffect(() => {
    if (!activeChild) {
      router.replace('/(parent)/myChildren' as any);
    }
  }, [activeChild]);

  if (!activeChild) return null;

  const childName = activeChild.fullNameAr ?? activeChild.fullNameEn ?? '—';
  const childLevel = activeChild.level ?? activeChild.assessedLevel;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(parent)/Home-parent' as any);
  };

  const handleTabChange = (tab: string) => {
    if (tab === tabs[2]) router.replace('/(parent)/school/school-progress' as any);
    else if (tab === tabs[3]) router.replace('/(parent)/school/school-reports' as any);
    else if (tab === tabs[1]) router.replace('/(parent)/school/school-hw-tasks' as any);
    else setActiveTab(tabs[0]);
  };

  return (
    <ScreenWrapper padded={false} scroll={false}>
      <Header
        title={t('schoolPage.title')}
        subtitle={childName}
        onBack={handleBack}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SchoolCard
          schoolName={t('school.home.title')}
          grade={childLevel != null ? t('schoolPage.gradeLabel', { grade: childLevel }) : childName}
          location="Amman"
        />

        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

        <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
          <Text variant="heading">{t('schoolPage.grades.comingUp')}</Text>
          <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
        </View>

        <View style={styles.gradesGrid}>
          {['Arabic', 'Math', 'Science'].map((subject, i) => (
            <Card key={i} variant="outlined" padded={false} style={styles.gradeCard}>
              <Text variant="caption" style={styles.gradeSubject}>{subject}</Text>
              <Text variant="heading" style={styles.gradeScore}>
                92<Text style={styles.gradeTotal}>/100</Text>
              </Text>
            </Card>
          ))}
        </View>

        <Text variant="heading" style={[styles.upcomingTitle, isRTL && styles.textRTL]}>
          {t('schoolPage.upcoming')}
        </Text>
        <Card
          variant="default"
          style={isRTL ? { ...styles.upcomingCard, ...styles.upcomingCardRTL } : styles.upcomingCard}
        >
          <View style={styles.upcomingIconBox} />
          <View style={styles.upcomingBody}>
            <Text style={[styles.upcomingTitleText, isRTL && styles.textRTL]}>
              {t('schoolPage.hwTasks.readingHw')}
            </Text>
            <Text variant="caption" style={[styles.upcomingSubtitle, isRTL && styles.textRTL]}>
              {t('schoolPage.hwTasks.lesson', { number: 7 })}
            </Text>
          </View>
          <View style={styles.tomorrowBadge}>
            <Text style={styles.tomorrowText}>{t('schoolPage.tomorrow')}</Text>
          </View>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  sectionHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  seeAll: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
  },
  gradesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  gradeCard: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  gradeSubject: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  gradeScore: {
    fontSize: 20,
    color: theme.colors.primary,
  },
  gradeTotal: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontFamily.regular,
  },
  upcomingTitle: { marginTop: theme.spacing.xl, textAlign: 'left' },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    padding: theme.spacing.md,
  },
  upcomingCardRTL: {
    flexDirection: 'row-reverse',
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderRightColor: theme.colors.primary,
  },
  upcomingIconBox: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.primaryLighter,
    borderRadius: theme.radius.md,
    flexShrink: 0,
  },
  upcomingBody: {
    flex: 1,
  },
  upcomingTitleText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.textPrimary,
    textAlign: 'left',
  },
  upcomingSubtitle: { color: theme.colors.textSecondary, textAlign: 'left' },
  tomorrowBadge: {
    backgroundColor: theme.colors.primaryLighter,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.lg,
    flexShrink: 0,
  },
  tomorrowText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
  },
  textRTL: {
    textAlign: 'right',
  },
});
