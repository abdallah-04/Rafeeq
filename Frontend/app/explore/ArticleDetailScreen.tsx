import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import BackButton from '@/components/modal/shared/BackButton';
import { Text } from '@/components/modal/shared/Text';
import { useAuthStore } from '@/store/authStore';
import { useModal } from '@/components/modal/ModalProvider';
import { theme } from '@/theme';
import { mockArticles, CATEGORY_COLORS, type Article } from '@/mock/articles';

const { colors, spacing, typography, radius } = theme;

function StatChip({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ArticleDetailScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = useAuthStore((s) => s.isRTL);
  const { show } = useModal();

  const { id } = useLocalSearchParams<{ id: string }>();
  const article = useMemo<Article>(() => {
    return mockArticles.find((item) => item.id === (id ?? '1')) ?? mockArticles[0];
  }, [id]);

  const isArabic = i18n.language === 'ar';
  const title = isArabic ? article.title_ar : article.title_en;
  const body = isArabic ? article.body_ar : article.body_en;
  const color = CATEGORY_COLORS[article.category] ?? '#4A90E2';

  const [bookmarked, setBookmarked] = useState(false);
  const [following, setFollowing] = useState(false);

  const handleBookmark = () => {
    if (!bookmarked) {
      setBookmarked(true);
      show('success', { variant: 'saved' });
    } else {
      setBookmarked(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={[styles.topNav]}>
        <BackButton onPress={() => router.back()} />

        <Text style={styles.navTitle}>{t('explore.title')}</Text>

        <TouchableOpacity
          style={[styles.bookmarkBtn, bookmarked && styles.bookmarkBtnActive]}
          onPress={handleBookmark}
          accessibilityLabel={t('explore.saved')}
        >
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={bookmarked ? colors.textWhite : colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroImage, { backgroundColor: `${color}18` }]}>
          <View style={[styles.heroShape, { backgroundColor: `${color}30` }]} />
        </View>

        <View style={styles.body}>
          <View style={[styles.metaRow, isRTL && styles.rowReverse]}>
            <View style={[styles.categoryTag, { backgroundColor: `${color}22` }]}>
              <Text style={[styles.categoryTagText, { color }]}>
                {t(`explore.categories.${article.category.toLowerCase()}`)}
              </Text>
            </View>
            <Text style={styles.readTime}>
              {article.readTime} {t('explore.readTime')}
            </Text>
          </View>

          <Text style={[styles.title, isRTL && styles.textRight]}>
            {title}
          </Text>

          <View style={[styles.authorRow, isRTL && styles.rowReverse]}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>{article.authorInitial}</Text>
            </View>
            <Text style={[styles.authorName, styles.authorFlex, isRTL && styles.textRight]}>
              {article.author}
            </Text>
            <TouchableOpacity
              style={[styles.followBtn, following && styles.followBtnActive]}
              onPress={() => setFollowing(!following)}
              accessibilityLabel={following ? t('explore.following') : t('explore.follow')}
            >
              <Text style={[styles.followBtnText, following && styles.followBtnTextActive]}>
                {following ? t('explore.following') : t('explore.follow')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.statsRow, isRTL && styles.rowReverse]}>
            <StatChip value={article.views} label={t('explore.views')} />
            <StatChip value={article.likes} label={t('explore.likes')} />
            <StatChip value={article.saved} label={t('explore.savedBadge')} />
          </View>

          <View style={styles.divider} />

          {body.map((para, index) =>
            para.startsWith('"') ? (
              <View key={index} style={[styles.quoteBlock, isRTL && styles.rowReverse]}>
                <View style={styles.quoteLine} />
                <Text style={[styles.quoteText, isRTL && styles.textRight]}>{para}</Text>
              </View>
            ) : (
              <Text key={index} style={[styles.bodyText, isRTL && styles.textRight]}>
                {para}
              </Text>
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
  },
  bookmarkBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkBtnActive: {
    backgroundColor: colors.primary,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  heroImage: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    height: 200,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroShape: {
    width: 96,
    height: 96,
    borderRadius: 28,
  },
  body: { paddingHorizontal: spacing.lg },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryTag: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryTagText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  readTime: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginLeft: 'auto',
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.textPrimary,
    lineHeight: 28,
    marginBottom: spacing.md,
    textAlign: 'left',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  authorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#BDD7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    color: colors.primary,
  },
  authorName: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  authorFlex: {
    flex: 1,
  },
  followBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
    minHeight: 32,
    justifyContent: 'center',
  },
  followBtnActive: { backgroundColor: colors.primary },
  followBtnText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 12,
    color: colors.primary,
  },
  followBtnTextActive: { color: colors.textWhite },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statChip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  bodyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: '#4A5568',
    lineHeight: 22,
    marginBottom: spacing.md,
    textAlign: 'left',
  },
  quoteBlock: {
    flexDirection: 'row',
    backgroundColor: '#EEF3FF',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  quoteLine: {
    width: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  quoteText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: '#4A5568',
    fontStyle: 'italic',
    lineHeight: 20,
    textAlign: 'left',
  },
});
