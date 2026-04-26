import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
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
import { apiGetReportsForParent, ReportResponse } from '@/services/api';
import { pickLocalizedName } from '@/utils/localizedName';

export default function TeacherReports() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('');
  const [filter, setFilter] = useState<'unread' | 'read'>('unread');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportResponse[]>([]);
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
    setActiveTab(tabs[3]);
  }, [tabs]);

  const load = useCallback(async () => {
    if (!activeChild) {
      setIsLoading(false);
      return;
    }
    try {
      setReports(await apiGetReportsForParent(activeChild.id));
    } catch {
      // empty list is acceptable
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
    else if (tab === tabs[2]) router.replace('/(parent)/school/school-progress' as any);
    else setActiveTab(tabs[3]);
  };

  const childName = pickLocalizedName(isRTL, activeChild?.fullNameAr, activeChild?.fullNameEn);

  return (
    <ScreenWrapper padded={false} scroll={false}>
      <Header
        title={t('schoolPage.reports.title')}
        subtitle={t('schoolPage.reports.unreadCount', { count: reports.length })}
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

        <View style={[styles.toggleContainer, isRTL && styles.toggleContainerRTL]}>
          <TouchableOpacity style={[styles.toggleBtn, filter === 'unread' && styles.activeToggle]} onPress={() => setFilter('unread')}>
            <Text style={[styles.toggleText, filter === 'unread' && styles.activeText]}>{t('schoolPage.reports.unread')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleBtn, filter === 'read' && styles.activeToggle]} onPress={() => setFilter('read')}>
            <Text style={[styles.toggleText, filter === 'read' && styles.activeText]}>{t('schoolPage.reports.read')}</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />
        ) : reports.length === 0 ? (
          <Text variant="caption" color="textSecondary" style={{ textAlign: 'center', marginTop: 40 }}>
            {t('schoolPage.reports.empty', 'No reports yet')}
          </Text>
        ) : (
          <>
            <Text variant="heading" style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {t('common.new', 'Reports')}
            </Text>
            {reports.map((report) => (
              <TouchableOpacity key={report.id} onPress={() => setSelectedReport(report.id)} activeOpacity={0.8}>
                <Card
                  variant="default"
                  style={
                    selectedReport === report.id
                      ? { ...styles.reportCard, backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                      : styles.reportCard
                  }
                >
                  <View style={[styles.reportRow, isRTL && styles.reportRowRTL]}>
                    <View style={[styles.avatarCircle, selectedReport === report.id && { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                    <View style={styles.reportBody}>
                      <Text style={[styles.teacherName, isRTL && styles.textRTL, selectedReport === report.id && { color: theme.colors.textWhite }]}>
                        {report.title}
                      </Text>
                      <Text style={[styles.reportPreview, isRTL && styles.textRTL, selectedReport === report.id && { color: 'rgba(255,255,255,0.85)' }]}>
                        {report.content?.slice(0, 80)}{report.content?.length > 80 ? '…' : ''}
                      </Text>
                      <Text style={[styles.timestamp, isRTL && styles.textRTL, selectedReport === report.id && { color: 'rgba(255,255,255,0.7)' }]}>
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString(isRTL ? 'ar-JO' : 'en-GB') : ''}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
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
    paddingBottom: theme.spacing.xl,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.radius.lg,
    padding: 4,
    marginTop: theme.spacing.lg,
  },
  toggleContainerRTL: {
    flexDirection: 'row-reverse',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.radius.md,
  },
  activeToggle: { backgroundColor: theme.colors.primary },
  activeText: { color: theme.colors.textWhite },
  toggleText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
  },
  sectionTitle: { marginVertical: theme.spacing.md, textAlign: 'left' },
  reportCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primaryLighter,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  reportRow: {
    flexDirection: 'row',
  },
  reportRowRTL: {
    flexDirection: 'row-reverse',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.full,
    marginEnd: theme.spacing.sm,
  },
  reportBody: {
    flex: 1,
  },
  teacherName: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primaryDark,
    fontSize: 14,
    textAlign: 'left',
  },
  reportPreview: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'left',
  },
  timestamp: {
    color: theme.colors.textMuted,
    fontSize: 10,
    marginTop: theme.spacing.xs,
    textAlign: 'left',
  },
  textRTL: {
    textAlign: 'right',
  },
});
