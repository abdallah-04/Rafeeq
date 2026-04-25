import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/theme';
import { useTranslation } from 'react-i18next';

import ScreenWrapper from '@/components/modal/shared/ScreenWap';
import Header from '@/components/modal/shared/Header';
import ChildSelector from '@/components/modal/parent/ChildSelector';
import TabBar from '@/components/modal/shared/TabBar';
import { Text } from '@/components/modal/shared/Text';
import StatusBadge, { BadgeVariant } from '@/components/modal/parent/StatusBadge';
import { useActiveChildStore } from '@/store/activeChildStore';
import { ActivityResponse, apiGetActivities } from '@/services/api';

function toBadgeVariant(status: string): BadgeVariant {
  if (status?.toLowerCase() === 'completed') return 'completed';
  if (status?.toLowerCase() === 'in_progress') return 'in_progress';
  return 'later';
}

export default function ActivitiesScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const activeChild = useActiveChildStore((s) => s.activeChild);
  const childName = activeChild?.fullNameAr ?? activeChild?.fullNameEn ?? 'Zaid';
  const childAge = activeChild?.dateOfBirth
    ? Math.floor((Date.now() - new Date(activeChild.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : 6;
  const childBadges = [
    ...(activeChild?.level ? [{ label: `${t('common.level', 'Level')} ${activeChild.level}`, color: '#A78BFA' }] : []),
    { label: t('myChildren.years', { age: childAge }), color: '#60A5FA' },
  ];

  const tabs = useMemo(
    () => [
      t('progress.tabs.progress', 'Progress'),
      t('progress.tabs.quizzes', 'Quizzes'),
      t('activities.title', 'Activities'),
      t('homework.title', 'Homeworks'),
    ],
    [t]
  );
  const [activeTab, setActiveTab] = useState(tabs[2]);
  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!activeChild?.id) {
      setActivities([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    apiGetActivities(activeChild.id)
      .then((data) => {
        if (!cancelled) {
          setActivities(data);
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

  const recommended = activities.filter((item) => item.status?.toLowerCase() !== 'completed').slice(0, 2);

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
    if (tab === tabs[1]) {
      router.replace('/(parent)/progress/quiz' as any);
      return;
    }
    if (tab === tabs[3]) {
      router.replace('/(parent)/progress/homeworks' as any);
      return;
    }
    setActiveTab(tabs[2]);
  };

  return (
    <ScreenWrapper padded={false} scroll={false}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />

      <Header
        title={t('activities.title')}
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
        <Text variant="heading" style={[styles.sectionTitle, isRTL && styles.textRight]}>
          ☆ {t('activities.recommendedFor', { name: childName })}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendedList}>
          {recommended.map((item) => (
            <RecommendedCard
              key={item.id}
              title={item.title}
              description={item.description ?? t('activities.title')}
              onPress={() => router.push(`/(parent)/activity/${item.id}` as any)}
            />
          ))}
        </ScrollView>

        <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
          <Text variant="heading" style={[styles.sectionTitle, isRTL && styles.textRight]}>
            🏃 {t('activities.daily', 'Daily activities')}
          </Text>
        </View>

        {isLoading ? <ActivityIndicator color={theme.colors.primary} style={styles.centered} /> : null}
        {error ? <Text style={styles.messageText}>{error}</Text> : null}
        {!isLoading && !error && activities.length === 0 ? (
          <Text style={styles.messageText}>
            {t('activities.emptyState', 'No activities available for this child yet.')}
          </Text>
        ) : null}

        {activities.map((item) => (
          <DailyCard
            key={item.id}
            title={item.title}
            subtitle={item.instructions ?? item.description ?? t('activities.title')}
            status={toBadgeVariant(item.status)}
            isRTL={isRTL}
            onPress={() => router.push(`/(parent)/activity/${item.id}` as any)}
          />
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

function RecommendedCard({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.recommendedCard} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.recommendedEmoji}>🎨</Text>
      <Text style={styles.recommendedTitle}>{title}</Text>
      <Text style={styles.recommendedMeta} numberOfLines={3}>{description}</Text>
    </TouchableOpacity>
  );
}

function DailyCard({
  title,
  subtitle,
  status,
  onPress,
  isRTL,
}: {
  title: string;
  subtitle: string;
  status: BadgeVariant;
  onPress: () => void;
  isRTL: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.dailyCard, isRTL && styles.dailyCardRTL]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.dailyIconBox}>
        <Text style={styles.dailyIcon}>🧩</Text>
      </View>
      <View style={styles.dailyInfo}>
        <Text style={[styles.dailyTitle, isRTL && styles.textRight]}>{title}</Text>
        <Text style={[styles.dailySubtitle, isRTL && styles.textRight]} numberOfLines={2}>{subtitle}</Text>
      </View>
      <StatusBadge variant={status} />
    </TouchableOpacity>
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
    gap: theme.spacing.lg,
  },
  textRight: {
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textPrimary,
  },
  recommendedList: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  recommendedCard: {
    width: 180,
    backgroundColor: '#EDE9FE',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    minHeight: 160,
  },
  recommendedEmoji: {
    fontSize: 28,
  },
  recommendedTitle: {
    fontSize: 15,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textPrimary,
  },
  recommendedMeta: {
    fontSize: 12,
    fontFamily: 'Lexend_400Regular',
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  dailyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dailyCardRTL: {
    flexDirection: 'row-reverse',
  },
  dailyIconBox: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF4FF',
  },
  dailyIcon: {
    fontSize: 24,
  },
  dailyInfo: {
    flex: 1,
    gap: 4,
  },
  dailyTitle: {
    fontSize: 15,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textPrimary,
  },
  dailySubtitle: {
    fontSize: 12,
    fontFamily: 'Lexend_400Regular',
    color: theme.colors.textSecondary,
    lineHeight: 18,
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
