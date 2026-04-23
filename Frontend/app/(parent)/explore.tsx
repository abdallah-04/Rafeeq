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
import { mockArticles, CATEGORY_COLORS, CATEGORY_EMOJIS, Article, ArticleCategory } from '@/mock/articles';
import { apiGetArticles, apiSaveArticle, apiUnsaveArticle, ArticleResponse } from '@/services/api';

const { colors, spacing, typography, radius } = theme;

type Filter = 'All' | ArticleCategory;
const FILTERS: Filter[] = ['All', 'Speech', 'Learning', 'Behavior'];

const FILTER_I18N_KEYS: Record<Filter, string> = {
  All:      'explore.categories.all',
  Speech:   'explore.categories.speech',
  Learning: 'explore.categories.learning',
  Behavior: 'explore.categories.behavioral',
};

/** Convert a backend ArticleResponse into the frontend Article shape */
function backendToArticle(a: ArticleResponse): Article {
  const category: ArticleCategory =
    (a.tags?.find((tag: string) => ['Speech', 'Learning', 'Behavior'].includes(tag)) as ArticleCategory) ?? 'Learning';
  return {
    id:           a.id,
    title_en:     a.title ?? a.titleAr ?? '',
    title_ar:     a.titleAr ?? a.title ?? '',
    body_en:      a.body     ? [a.body]    : [],
    body_ar:      a.bodyAr   ? [a.bodyAr]  : [],
    category,
    readTime:     5,
    author:       'Rafeeq',
    authorInitial: 'R',
    views:        '—',
    likes:        0,
    saved:        a.isSaved ? 1 : 0,
    featured:     false,
  };
}

// ─── Featured Card ────────────────────────────────────────────────────────────

function FeaturedCard({ article, isRTL }: { article: Article; isRTL: boolean }) {
  const { t, i18n } = useTranslation();
  const lang  = i18n.language as 'en' | 'ar';
  const title = lang === 'ar' ? article.title_ar : article.title_en;
  const color = CATEGORY_COLORS[article.category];
  const emoji = CATEGORY_EMOJIS[article.category];

  return (
    <TouchableOpacity
      style={styles.featuredCard}
      activeOpacity={0.88}
      onPress={() => router.push({ pathname: '/explore/ArticleDetailScreen', params: { id: article.id } })}
    >
      <View style={[styles.featuredBadge, { backgroundColor: color }]}>
        <Text style={styles.featuredBadgeText}>{emoji} {t(FILTER_I18N_KEYS[article.category])}</Text>
      </View>
      <Text style={[styles.featuredTitle, isRTL && styles.textRight]} numberOfLines={2}>{title}</Text>
      <View style={[styles.featuredMeta, isRTL && styles.rowReverse]}>
        <View style={styles.featuredAuthorDot}>
          <Text style={styles.featuredAuthorInitial}>{article.authorInitial}</Text>
        </View>
        <Text style={styles.featuredAuthorName}>{article.author}</Text>
        <Text style={styles.featuredDot}>·</Text>
        <Text style={styles.featuredReadTime}>{article.readTime} {t('explore.minRead', 'min read')}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Article Card ─────────────────────────────────────────────────────────────

function ArticleCard({ article, isRTL, onToggleSave }: {
  article: Article; isRTL: boolean; onToggleSave: (id: string, isSaved: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  const lang  = i18n.language as 'en' | 'ar';
  const title = lang === 'ar' ? article.title_ar : article.title_en;
  const color = CATEGORY_COLORS[article.category];
  const emoji = CATEGORY_EMOJIS[article.category];
  const isSaved = article.saved > 0;

  return (
    <TouchableOpacity
      style={styles.articleCard}
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/explore/ArticleDetailScreen', params: { id: article.id } })}
    >
      <View style={[styles.articleTop, isRTL && styles.rowReverse]}>
        <View style={[styles.articleCategoryDot, { backgroundColor: color + '22' }]}>
          <Text style={{ fontSize: 14 }}>{emoji}</Text>
        </View>
        <View style={styles.articleInfo}>
          <Text style={[styles.articleTitle, isRTL && styles.textRight]} numberOfLines={2}>{title}</Text>
          <View style={[styles.articleMeta, isRTL && styles.rowReverse]}>
            <Text style={styles.articleAuthor}>{article.author}</Text>
            <Text style={styles.articleDot}>·</Text>
            <Text style={styles.articleReadTime}>{article.readTime} {t('explore.minRead', 'min read')}</Text>
          </View>
        </View>
        <TouchableOpacity
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          onPress={(event) => {
            event.stopPropagation();
            onToggleSave(article.id, isSaved);
          }}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress} activeOpacity={0.8}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ExploreScreen() {
  const { t } = useTranslation();
  const isRTL = useAuthStore((s) => s.isRTL);

  const [search,       setSearch]       = useState('');
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [articles,     setArticles]     = useState<Article[]>(mockArticles);
  const [loadedFromApi, setLoadedFromApi] = useState(false);

  // Try loading from backend; fall back silently to mock data
  useEffect(() => {
    (async () => {
      try {
        const data = await apiGetArticles();
        if (data && data.length > 0) {
          setArticles(data.map(backendToArticle));
          setLoadedFromApi(true);
        }
        // else: keep mock articles
      } catch {
        // backend unavailable or empty — stay on mock
      }
    })();
  }, []);

  const handleToggleSave = async (id: string, currentlySaved: boolean) => {
    try {
      if (currentlySaved) {
        await apiUnsaveArticle(id);
      } else {
        await apiSaveArticle(id);
      }
      setArticles((prev) =>
        prev.map((a) => a.id === id ? { ...a, saved: currentlySaved ? 0 : 1 } : a)
      );
    } catch {
      // silent fail — toggle visually anyway (optimistic)
    }
  };

  const featured = articles.find((a) => a.featured) ?? articles[0];

  const filtered = useMemo(() => {
    if (!featured) return [];
    let list = articles.filter((a) => a.id !== featured.id);
    if (activeFilter !== 'All') list = list.filter((a) => a.category === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) => a.title_en.toLowerCase().includes(q) || a.title_ar.includes(q) || a.author.toLowerCase().includes(q)
      );
    }
    return list;
  }, [articles, activeFilter, search, featured?.id]);

  if (!featured) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>{t('explore.title')}</Text>
        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={() => router.push('/explore/SavedArticlesScreen')}
          accessibilityLabel={t('explore.saved')}
        >
          <Ionicons name="bookmark-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
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

      {/* Filter chips */}
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

      {/* Article feed */}
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
  safe:       { flex: 1, backgroundColor: colors.background },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight:  { textAlign: 'right' },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: typography.fontSize.lg, fontFamily: typography.fontFamily.bold, color: colors.textPrimary },
  bookmarkBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  searchRow:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginBottom: spacing.sm, backgroundColor: colors.backgroundLight, borderRadius: radius.xl, paddingHorizontal: spacing.md, height: 44, gap: spacing.xs },
  searchInput: { flex: 1, fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.regular, color: colors.textPrimary },

  chips: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: spacing.xs, flexDirection: 'row' },
  chip:  { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: colors.backgroundLight, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText:   { fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.medium, color: colors.textSecondary },
  chipTextActive: { color: colors.textWhite },

  feedContent: { paddingHorizontal: spacing.lg, paddingBottom: 80 },

  featuredCard:        { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  featuredBadge:       { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full, marginBottom: spacing.sm },
  featuredBadgeText:   { fontSize: typography.fontSize.xs, fontFamily: typography.fontFamily.semiBold, color: colors.textWhite },
  featuredTitle:       { fontSize: typography.fontSize.lg, fontFamily: typography.fontFamily.bold, color: colors.textPrimary, marginBottom: spacing.sm, lineHeight: 28 },
  featuredMeta:        { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  featuredAuthorDot:   { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primaryLighter, alignItems: 'center', justifyContent: 'center' },
  featuredAuthorInitial: { fontSize: 10, fontFamily: typography.fontFamily.bold, color: colors.primary },
  featuredAuthorName:  { fontSize: typography.fontSize.xs, fontFamily: typography.fontFamily.medium, color: colors.textSecondary },
  featuredDot:         { color: colors.textMuted },
  featuredReadTime:    { fontSize: typography.fontSize.xs, color: colors.textMuted },

  articleCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  articleTop:  { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  articleCategoryDot: { width: 44, height: 44, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  articleInfo:    { flex: 1 },
  articleTitle:   { fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.semiBold, color: colors.textPrimary, marginBottom: 4, lineHeight: 20 },
  articleMeta:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  articleAuthor:  { fontSize: typography.fontSize.xs, color: colors.textMuted },
  articleDot:     { color: colors.textMuted, fontSize: 10 },
  articleReadTime:{ fontSize: typography.fontSize.xs, color: colors.textMuted },
});
