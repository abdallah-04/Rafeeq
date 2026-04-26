import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/modal/shared/Text';
import BottomNav from '@/components/modal/shared/BottomNav';
import BackButton from '@/components/modal/shared/BackButton';
import { theme } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { mockArticles, CATEGORY_COLORS, Article, ArticleCategory } from '@/mock/articles';
import { apiGetArticles, apiSaveArticle, apiUnsaveArticle, ArticleResponse } from '@/services/api';

const { colors, spacing, typography, radius } = theme;

type Filter = 'All' | ArticleCategory;
const FILTERS: Filter[] = ['All', 'Speech', 'Learning', 'Behavior'];

const FILTER_I18N_KEYS: Record<Filter, string> = {
  All: 'explore.categories.all',
  Speech: 'explore.categories.speech',
  Learning: 'explore.categories.learning',
  Behavior: 'explore.categories.behavioral',
};

function backendToArticle(a: ArticleResponse): Article {
  const category: ArticleCategory =
    (a.tags?.find((tag: string) => ['Speech', 'Learning', 'Behavior'].includes(tag)) as ArticleCategory) ??
    'Learning';

  return {
    id: a.id,
    title_en: a.title ?? a.titleAr ?? '',
    title_ar: a.titleAr ?? a.title ?? '',
    body_en: a.body ? [a.body] : [],
    body_ar: a.bodyAr ? [a.bodyAr] : [],
    category,
    readTime: 5,
    author: 'Rafeeq',
    authorInitial: 'R',
    views: '—',
    likes: 0,
    saved: a.isSaved ? 1 : 0,
    featured: false,
  };
}

function FeaturedCard({ article, isRTL }: { article: Article; isRTL: boolean }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'ar';
  const title = lang === 'ar' ? article.title_ar : article.title_en;
  const color = CATEGORY_COLORS[article.category];

  return (
    <TouchableOpacity
      style={styles.featuredCard}
      activeOpacity={0.88}
      onPress={() => router.push({ pathname: '/explore/ArticleDetailScreen', params: { id: article.id } })}
    >
      <View style={styles.featuredBg}>
        <View style={[styles.featuredBgShape, { backgroundColor: color + '33' }]} />
      </View>
      <View style={styles.featuredOverlay} />

      <View style={[styles.featuredBadge, isRTL && styles.featuredBadgeRTL]}>
        <Text style={styles.featuredBadgeText}>{t('explore.featured')}</Text>
      </View>

      <View style={[styles.featuredBottom, isRTL && styles.rowReverse]}>
        <Text style={[styles.featuredTitle, isRTL && styles.textRight]} numberOfLines={2}>
          {title}
        </Text>
        <View style={[styles.categoryChip, { backgroundColor: color + '33' }]}>
          <Text style={[styles.categoryChipText, { color }]}>{article.category.toUpperCase()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ArticleCard({
  article,
  isRTL,
  onToggleSave,
}: {
  article: Article;
  isRTL: boolean;
  onToggleSave: (id: string, isSaved: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'ar';
  const title = lang === 'ar' ? article.title_ar : article.title_en;
  const color = CATEGORY_COLORS[article.category];
  const isSaved = article.saved > 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => router.push({ pathname: '/explore/ArticleDetailScreen', params: { id: article.id } })}
    >
      <View style={[styles.cardThumb, { backgroundColor: color + '18' }]}>
        <View style={[styles.cardThumbShape, { backgroundColor: color + '33' }]} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
          <View style={[styles.categoryChip, { backgroundColor: color + '22' }]}>
            <Text style={[styles.categoryChipText, { color }]}>{article.category.toUpperCase()}</Text>
          </View>
          <TouchableOpacity
            style={styles.saveBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={(event) => {
              event.stopPropagation();
              onToggleSave(article.id, isSaved);
            }}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isSaved ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.cardTitle, isRTL && styles.textRight]} numberOfLines={2}>
          {title}
        </Text>

        <View style={[styles.authorRow, isRTL && styles.rowReverse]}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorAvatarText}>{article.authorInitial}</Text>
          </View>
          <Text style={[styles.authorName, { flex: 1 }]} numberOfLines={1}>
            {article.author}
          </Text>
          <Text style={styles.readTime}>
            {article.readTime} {t('explore.readTime')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function ExploreScreen() {
  const { t } = useTranslation();
  const isRTL = useAuthStore((s) => s.isRTL);

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [articles, setArticles] = useState<Article[]>(mockArticles);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGetArticles();
        if (data && data.length > 0) {
          setArticles(data.map(backendToArticle));
        }
      } catch {
        // keep mock fallback
      }
    })();
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(parent)/Home-parent' as any);
  };

  const handleToggleSave = async (id: string, currentlySaved: boolean) => {
    try {
      if (currentlySaved) {
        await apiUnsaveArticle(id);
      } else {
        await apiSaveArticle(id);
      }
      setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, saved: currentlySaved ? 0 : 1 } : a)));
    } catch {
      // keep current state if request fails
    }
  };

  const featured = articles.find((a) => a.featured) ?? articles[0];

  const filtered = useMemo(() => {
    if (!featured) return [];

    let list = articles.filter((a) => a.id !== featured.id);
    if (activeFilter !== 'All') {
      list = list.filter((a) => a.category === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title_en.toLowerCase().includes(q) ||
          a.title_ar.includes(q) ||
          a.author.toLowerCase().includes(q)
      );
    }
    return list;
  }, [articles, activeFilter, search, featured?.id]);

  if (!featured) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <BackButton onPress={handleBack} />
        <Text style={styles.headerTitle}>{t('explore.title')}</Text>
        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={() => router.push('/explore/SavedArticlesScreen')}
          accessibilityLabel={t('explore.saved')}
        >
          <Ionicons name="bookmark-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchRow, isRTL && styles.rowReverse]}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, isRTL && styles.textRight]}
          placeholder={t('explore.search_placeholder')}
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.chips, isRTL && { flexDirection: 'row-reverse' }]}
        style={{ flexGrow: 0 }}
      >
        {FILTERS.map((f) => (
          <FilterChip
            key={f}
            label={t(FILTER_I18N_KEYS[f])}
            active={activeFilter === f}
            onPress={() => setActiveFilter(f)}
          />
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
        ListHeaderComponent={<FeaturedCard article={featured} isRTL={isRTL} />}
        renderItem={({ item }) => (
          <ArticleCard article={item} isRTL={isRTL} onToggleSave={handleToggleSave} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },
  header: {
    flexDirection: 'row',
    direction: 'ltr',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  bookmarkBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.backgroundLight,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
  },
  chips: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.textWhite,
  },
  feedContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl + 70,
    gap: 12,
  },
  featuredCard: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 4,
    position: 'relative',
  },
  featuredBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D6E4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBgShape: {
    width: 112,
    height: 112,
    borderRadius: 32,
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 40, 90, 0.52)',
  },
  featuredBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  featuredBadgeRTL: {
    left: undefined,
    right: 14,
  },
  featuredBadgeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.textWhite,
    letterSpacing: 0.8,
  },
  featuredBottom: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  featuredTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textWhite,
    lineHeight: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardThumb: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardThumbShape: {
    width: 64,
    height: 64,
    borderRadius: 20,
  },
  cardBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    direction: 'ltr',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  categoryChip: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryChipText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.4,
  },
  saveBtn: {
    marginLeft: 'auto',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  authorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#BDD7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  authorName: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  readTime: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
  },
});
