import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '@/components/modal/shared/BackButton';
import { useAuthStore } from '@/store/authStore';
import { theme } from '@/theme';
import { apiGetArticles, apiUnsaveArticle, ArticleResponse } from '@/services/api';

const { colors, spacing, typography, radius } = theme;
type Category = 'All' | 'Speech' | 'Learning' | 'Behavior';
const CATEGORIES: Category[] = ['All', 'Speech', 'Learning', 'Behavior'];
const CATEGORY_COLORS: Record<string, string> = { Speech: '#4A90E2', Learning: '#7B61FF', Behavior: '#FF6B6B' };
const CATEGORY_EMOJIS: Record<string, string> = { Speech: '🗣️', Learning: '📚', Behavior: '🧠' };
const CATEGORY_I18N: Record<Category, string> = { All: 'explore.categories.all', Speech: 'explore.categories.speech', Learning: 'explore.categories.learning', Behavior: 'explore.categories.behavioral' };

function getCategory(article: ArticleResponse): string {
  return article.tags?.find((t) => ['Speech', 'Learning', 'Behavior'].includes(t)) ?? 'Learning';
}

export default function SavedArticlesScreen() {
  const router = useRouter();
  const { t }  = useTranslation();
  const isRTL  = useAuthStore((s) => s.isRTL);
  const [selected,   setSelected]   = useState<Category>('All');
  const [articles,   setArticles]   = useState<ArticleResponse[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removing,   setRemoving]   = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setArticles((await apiGetArticles()).filter((a) => a.isSaved)); }
    catch { /* silently show empty */ }
    finally { setIsLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(parent)/explore' as any);
  };

  const handleRemove = async (id: string) => {
    setRemoving(id);
    try { await apiUnsaveArticle(id); setArticles((prev) => prev.filter((a) => a.id !== id)); }
    catch { /* silent */ }
    finally { setRemoving(null); }
  };

  const filtered = selected === 'All' ? articles : articles.filter((a) => getCategory(a) === selected);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <BackButton onPress={handleBack} />
        <View style={[styles.headerCenter, isRTL && styles.rowReverse]}>
          <Ionicons name="bookmark" size={20} color={colors.primary} />
          <Text style={styles.headerTitle}>{t('explore.saved_title')}</Text>
        </View>
        <View style={styles.countBadge}><Text style={styles.countBadgeText}>{articles.length} {t('explore.savedBadge')}</Text></View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chips, isRTL && { flexDirection: 'row-reverse' }]} style={{ flexGrow: 0 }}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat} style={[styles.chip, selected === cat && styles.chipActive]} onPress={() => setSelected(cat)}>
            <Text style={[styles.chipText, selected === cat && styles.chipTextActive]}>{t(CATEGORY_I18N[cat])}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {isLoading ? <ActivityIndicator style={{ marginTop: 60 }} size="large" color={colors.primary} /> :
       filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={[styles.emptyTitle, isRTL && styles.textRight]}>{t('explore.empty')}</Text>
          <TouchableOpacity style={styles.exploreBtn} onPress={() => router.replace('/(parent)/explore' as any)}><Text style={styles.exploreBtnText}>{t('explore.explore_btn')}</Text></TouchableOpacity>
        </View>
      ) : (
        <FlatList data={filtered} keyExtractor={(item) => item.id} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          renderItem={({ item }) => {
            const cat   = getCategory(item);
            const color = CATEGORY_COLORS[cat] ?? '#4A90E2';
            const emoji = CATEGORY_EMOJIS[cat] ?? '📄';
            const title = (isRTL ? item.titleAr : item.title) ?? item.title ?? item.titleAr ?? '';
            return (
              <TouchableOpacity style={styles.card} activeOpacity={0.85}
                onPress={() => router.push({ pathname: '/explore/ArticleDetailScreen', params: { id: item.id } })}>
                <View style={styles.thumb}><Text style={styles.thumbEmoji}>{emoji}</Text></View>
                <View style={styles.cardContent}>
                  <View style={[styles.metaRow, isRTL && styles.rowReverse]}>
                    <View style={[styles.categoryTag, { backgroundColor: color + '22' }]}><Text style={[styles.categoryTagText, { color }]}>{cat.toUpperCase()}</Text></View>
                    <Text style={styles.readTime}>{new Date(item.createdAt).toLocaleDateString(isRTL ? 'ar-JO' : 'en-GB')}</Text>
                  </View>
                  <Text style={[styles.cardTitle, isRTL && styles.textRight]} numberOfLines={2}>{title}</Text>
                  <View style={[styles.cardFooter, isRTL && styles.rowReverse]}>
                    <View style={styles.authorAvatar}><Text style={styles.authorAvatarText}>R</Text></View>
                    <Text style={styles.authorName} numberOfLines={1}>Rafeeq</Text>
                    <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.id)} disabled={removing === item.id}>
                      {removing === item.id ? <ActivityIndicator size={12} color="#FF6B6B" /> : <Ionicons name="bookmark" size={14} color="#FF6B6B" />}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  rowReverse: { flexDirection: 'row-reverse' }, textRight: { textAlign: 'right' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  headerTitle: { fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.lg, color: colors.textPrimary },
  countBadge: { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5, minHeight: 30, justifyContent: 'center' },
  countBadgeText: { fontFamily: typography.fontFamily.semiBold, fontSize: 12, color: colors.textWhite },
  chips: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm, flexDirection: 'row' },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface, minHeight: 36, justifyContent: 'center' },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: colors.textWhite },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl, gap: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: 20, flexDirection: 'row', padding: spacing.md, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2, alignItems: 'flex-start', gap: spacing.sm },
  thumb: { width: 64, height: 64, borderRadius: 14, backgroundColor: '#EEF3FF', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  thumbEmoji: { fontSize: 28 }, cardContent: { flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  categoryTag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  categoryTagText: { fontFamily: typography.fontFamily.bold, fontSize: 10, letterSpacing: 0.4 },
  readTime: { fontFamily: typography.fontFamily.regular, fontSize: 11, color: colors.textMuted, marginLeft: 'auto' },
  cardTitle: { fontFamily: typography.fontFamily.semiBold, fontSize: typography.fontSize.sm, color: colors.textPrimary, lineHeight: 19, marginBottom: spacing.xs },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  authorAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#BDD7FF', alignItems: 'center', justifyContent: 'center' },
  authorAvatarText: { fontFamily: typography.fontFamily.bold, fontSize: 10, color: colors.primary },
  authorName: { fontFamily: typography.fontFamily.regular, fontSize: 12, color: colors.textSecondary, flex: 1 },
  removeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.md },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.lg, color: colors.textPrimary, textAlign: 'center' },
  exploreBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, minHeight: 48, justifyContent: 'center' },
  exploreBtnText: { fontFamily: typography.fontFamily.semiBold, fontSize: typography.fontSize.base, color: colors.textWhite },
});
