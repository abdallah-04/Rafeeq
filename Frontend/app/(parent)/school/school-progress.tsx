import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import ScreenWrapper from '@/components/modal/shared/ScreenWap';
import Header from '@/components/modal/shared/Header';
import TabBar from '@/components/modal/shared/TabBar';
import ProgressSummary from '@/components/modal/parent/ProgressSummary';
import Card from '@/components/modal/shared/Card';
import { Text } from '@/components/modal/shared/Text';
import SchoolCard from '@/components/modal/parent/schoolCard';
import { useActiveChildStore } from '@/store/activeChildStore';
import { apiGetChildSummary, apiGetNotesForParent, ChildSummaryResponse, NoteResponse } from '@/services/api';

export default function ProgressReport() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('');
  const [summary, setSummary] = useState<ChildSummaryResponse | null>(null);
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    setActiveTab(tabs[2]);
  }, [tabs]);

  const load = useCallback(async () => {
    if (!activeChild) {
      setIsLoading(false);
      return;
    }
    try {
      const [s, n] = await Promise.all([apiGetChildSummary(activeChild.id), apiGetNotesForParent(activeChild.id)]);
      setSummary(s);
      setNotes(n);
    } catch {
      // show empty states instead
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [activeChild?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(parent)/school/school-parent' as any);
  };

  const handleTabChange = (tab: string) => {
    if (tab === tabs[0]) router.replace('/(parent)/school/school-parent' as any);
    else if (tab === tabs[1]) router.replace('/(parent)/school/school-hw-tasks' as any);
    else if (tab === tabs[3]) router.replace('/(parent)/school/school-reports' as any);
    else setActiveTab(tabs[2]);
  };

  const childName = activeChild?.fullNameAr ?? activeChild?.fullNameEn ?? '—';
  const level = activeChild?.assessedLevel ?? summary?.level ?? activeChild?.level ?? null;
  const levelPct = level ? Math.min(level * 20, 100) : 0;
  const skills = level
    ? [{ label: t('schoolPage.progress.assessedLevel', 'Assessed Level'), percentage: levelPct, color: '#3B82F6' }]
    : [];
  const bannerSubtitle = summary
    ? t('schoolPage.progress.progressValue', { defaultValue: 'Progress {{value}}%', value: summary.progressPercentage })
    : t('schoolPage.progress.semester');

  return (
    <ScreenWrapper padded={false} scroll={false}>
      <Header
        title={t('schoolPage.tabs.progress')}
        subtitle={t('schoolPage.progress.trackingSubtitle')}
        onBack={handleBack}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <SchoolCard schoolName={t('school.home.title')} grade={childName} location="" />
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />
        ) : (
          <>
            <Card
              variant="elevated"
              style={isRTL ? { ...styles.banner, ...styles.bannerRTL } : styles.banner}
            >
              <View style={styles.bannerBody}>
                <Text style={[styles.bannerTitle, isRTL && styles.textRTL]}>{t('schoolPage.progress.overall')}</Text>
                <Text style={[styles.bannerSub, isRTL && styles.textRTL]}>
                  {bannerSubtitle}
                </Text>
              </View>
              <Text style={styles.percentageText}>{level ? `L${level}` : '—'}</Text>
            </Card>

            {skills.length > 0 ? <ProgressSummary title={t('schoolPage.progress.homeworkCompletion')} items={skills} /> : null}

            {notes.length > 0 ? (
              <>
                <Text variant="heading" style={[styles.notesTitle, isRTL && styles.textRTL]}>
                  {t('schoolPage.progress.teacherNote')}
                </Text>
                {notes.slice(0, 3).map((note) => (
                  <Card key={note.id} variant="outlined" style={styles.noteCard}>
                    <Text style={[styles.noteTitle, isRTL && styles.textRTL]}>💬 {note.title}</Text>
                    <Text style={[styles.noteBody, isRTL && styles.textRTL]}>{note.content}</Text>
                    <Text style={[styles.noteAuthor, isRTL && styles.textRTL]}>
                      {note.createdAt ? new Date(note.createdAt).toLocaleDateString(isRTL ? 'ar-JO' : 'en-GB') : ''}
                    </Text>
                  </Card>
                ))}
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  banner: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 0,
  },
  bannerRTL: {
    flexDirection: 'row-reverse',
  },
  bannerBody: {
    flex: 1,
  },
  bannerTitle: {
    color: theme.colors.textWhite,
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.bold,
    textAlign: 'left',
  },
  bannerSub: {
    color: theme.colors.textWhite,
    opacity: 0.8,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'left',
  },
  percentageText: {
    color: theme.colors.textWhite,
    fontSize: 32,
    fontFamily: theme.typography.fontFamily.bold,
  },
  notesTitle: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
    textAlign: 'left',
  },
  noteCard: {
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  noteTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    marginBottom: theme.spacing.xs,
    textAlign: 'left',
  },
  noteBody: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 18,
    textAlign: 'left',
  },
  noteAuthor: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.md,
    textAlign: 'right',
  },
  textRTL: {
    textAlign: 'right',
  },
});
