import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import ScreenWrapper from '@/components/modal/shared/ScreenWap';
import Header from '@/components/modal/shared/Header';
import TabBar from '@/components/modal/shared/TabBar';
import Card from '@/components/modal/shared/Card';
import { Text } from '@/components/modal/shared/Text';
import SchoolCard from '@/components/modal/parent/schoolCard';
import { useActiveChildStore } from '@/store/activeChildStore';
import { apiGetHomeworkForParent, HomeworkResponse } from '@/services/api';

export default function HWTasksScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('');
  const [hwList, setHwList] = useState<HomeworkResponse[]>([]);
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
    setActiveTab(tabs[1]);
  }, [tabs]);

  const load = useCallback(async () => {
    if (!activeChild) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await apiGetHomeworkForParent(activeChild.id, 'teacher');
      setHwList(data.filter((hw) => !hw.treeItemId && !hw.treeId));
    } catch {
      // show empty state
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
    else if (tab === tabs[2]) router.replace('/(parent)/school/school-progress' as any);
    else if (tab === tabs[3]) router.replace('/(parent)/school/school-reports' as any);
    else setActiveTab(tabs[1]);
  };

  const childName = activeChild?.fullNameAr ?? activeChild?.fullNameEn ?? '—';
  const statusColor = (status: string) => ((status === 'SUBMITTED' || status === 'GRADED') ? '#22C55E' : '#F97316');

  return (
    <ScreenWrapper padded={false} scroll={false}>
      <Header title={t('schoolPage.tabs.homework')} subtitle={childName} onBack={handleBack} />

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
        ) : hwList.length === 0 ? (
          <Text variant="caption" color="textSecondary" style={{ textAlign: 'center', marginTop: 40 }}>
            {t('schoolPage.hw.empty', 'No homework assigned yet')}
          </Text>
        ) : (
          <View style={styles.list}>
            {hwList.map((hw) => (
              <Card
                key={hw.id}
                variant="default"
                style={isRTL ? { ...styles.hwCard, ...styles.hwCardRTL } : styles.hwCard}
              >
                <View style={styles.hwInfo}>
                  <View style={[styles.hwTop, isRTL && styles.hwTopRTL]}>
                    <Text style={[styles.hwTitle, isRTL && styles.textRTL]}>{hw.title}</Text>
                    <View style={[styles.statusDot, { backgroundColor: statusColor(hw.status) }]} />
                  </View>
                  <Text style={[styles.hwDesc, isRTL && styles.textRTL]}>{hw.description}</Text>
                  <Text style={[styles.hwDue, isRTL && styles.textRTL]}>
                    {t('schoolPage.hw.due', 'Due')}: {hw.dueDate ? new Date(hw.dueDate).toLocaleDateString(isRTL ? 'ar-JO' : 'en-GB') : '—'}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}
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
  list: { gap: theme.spacing.md, paddingTop: theme.spacing.lg },
  hwCard: { padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
  hwCardRTL: { flexDirection: 'row-reverse' },
  hwInfo: { flex: 1 },
  hwTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hwTopRTL: { flexDirection: 'row-reverse' },
  hwTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: theme.colors.textPrimary,
    flex: 1,
    textAlign: 'left',
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginStart: 8 },
  hwDesc: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18, marginBottom: 6, textAlign: 'left' },
  hwDue: { color: theme.colors.textMuted, fontSize: 11, fontFamily: theme.typography.fontFamily.medium, textAlign: 'left' },
  textRTL: { textAlign: 'right' },
});
