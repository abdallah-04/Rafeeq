import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Text } from '@/components/RNText';
import { useRouter } from 'expo-router';

type Category = 'All' | 'Speech' | 'Learning' | 'Behavior';

interface Article {
  id: string;
  category: Category | string;
  readTime: string;
  title: string;
  author: string;
  authorAvatar?: string;
  featured?: boolean;
  saved?: boolean;
}

const ARTICLES: Article[] = [
  {
    id: '1',
    category: 'Speech',
    readTime: '8 min read',
    title: 'Understanding Delayed Speech in Toddlers',
    author: 'Dr. Sarah Ahmed',
    featured: true,
    saved: false,
  },
  {
    id: '2',
    category: 'Learning',
    readTime: '5 min read',
    title: 'How to Support Your Child\'s Reading Skills at Home',
    author: 'Ms. Lina Haddad',
    featured: false,
    saved: false,
  },
  {
    id: '3',
    category: 'Behavior',
    readTime: '6 min read',
    title: 'Managing ADHD Symptoms: A Parent\'s Guide',
    author: 'Dr. Omar Nassar',
    featured: false,
    saved: false,
  },
  {
    id: '4',
    category: 'Speech',
    readTime: '4 min read',
    title: 'Early Intervention: Why It Matters for Speech Delays',
    author: 'Dr. Sarah Ahmed',
    featured: false,
    saved: true,
  },
  {
    id: '5',
    category: 'Learning',
    readTime: '7 min read',
    title: 'Building Focus: Activities for Children with ADD',
    author: 'Ms. Rania Khalil',
    featured: false,
    saved: false,
  },
];

const CATEGORIES: Category[] = ['All', 'Speech', 'Learning', 'Behavior'];

// ─── Category chip colors ──────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Speech: '#4A90E2',
  Learning: '#7B61FF',
  Behavior: '#FF6B6B',
  All: '#4A90E2',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.searchRow}>
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles..."
          placeholderTextColor="#A0AEC0"
          value={value}
          onChangeText={onChange}
        />
      </View>
      <TouchableOpacity style={styles.bookmarkBtn}>
        <Text style={styles.bookmarkIcon}>🔖</Text>
      </TouchableOpacity>
    </View>
  );
}

function FilterChips({
  selected,
  onSelect,
}: {
  selected: Category;
  onSelect: (c: Category) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsContainer}
    >
      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat}
          style={[styles.chip, selected === cat && styles.chipActive]}
          onPress={() => onSelect(cat)}
        >
          <Text style={[styles.chipText, selected === cat && styles.chipTextActive]}>
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function FeaturedCard({ article, onPress }: { article: Article; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.9}>
      {/* Placeholder illustration */}
      <View style={styles.featuredImageBg}>
        <Text style={styles.featuredImagePlaceholder}>👨‍👩‍👧</Text>
      </View>
      <View style={styles.featuredBadge}>
        <Text style={styles.featuredBadgeText}>FEATURED</Text>
      </View>
      <View style={styles.featuredMeta}>
        <View style={[styles.categoryTag, { backgroundColor: CATEGORY_COLORS[article.category] + '22' }]}>
          <Text style={[styles.categoryTagText, { color: CATEGORY_COLORS[article.category] }]}>
            {article.category.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.readTime}>{article.readTime}</Text>
      </View>
      <Text style={styles.featuredTitle}>{article.title}</Text>
      <View style={styles.authorRow}>
        <View style={styles.authorAvatar}>
          <Text style={styles.authorAvatarText}>
            {article.author.charAt(0)}
          </Text>
        </View>
        <Text style={styles.authorName}>{article.author}</Text>
        <TouchableOpacity style={styles.readBtn}>
          <Text style={styles.readBtnText}>Read</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function ArticleCard({ article, onPress }: { article: Article; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.articleCard} onPress={onPress} activeOpacity={0.85}>
      {/* Thumbnail */}
      <View style={styles.articleThumb}>
        <Text style={styles.articleThumbIcon}>📄</Text>
      </View>
      <View style={styles.articleContent}>
        <View style={styles.articleMeta}>
          <View style={[styles.categoryTag, { backgroundColor: CATEGORY_COLORS[article.category] + '22' }]}>
            <Text style={[styles.categoryTagText, { color: CATEGORY_COLORS[article.category] }]}>
              {article.category.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.readTime}>{article.readTime}</Text>
        </View>
        <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
        <View style={styles.authorRow}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorAvatarText}>{article.author.charAt(0)}</Text>
          </View>
          <Text style={styles.authorName} numberOfLines={1}>{article.author}</Text>
          <TouchableOpacity style={styles.readBtn} onPress={onPress}>
            <Text style={styles.readBtnText}>Read</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  const filtered = ARTICLES.filter((a) => {
    const matchCat = selectedCategory === 'All' || a.category === selectedCategory;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered.find((a) => a.featured);
  const rest = filtered.filter((a) => !a.featured);

  const handleArticlePress = (article: Article) => {
    router.push({ pathname: '/explore/ArticleDetailScreen', params: { id: article.id } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore</Text>
        </View>

        {/* Search */}
        <SearchBar value={search} onChange={setSearch} />

        {/* Filter chips */}
        <FilterChips selected={selectedCategory} onSelect={setSelectedCategory} />

        {/* Featured card */}
        {featured && (
          <>
            <Text style={styles.sectionLabel}>Featured</Text>
            <FeaturedCard article={featured} onPress={() => handleArticlePress(featured)} />
          </>
        )}

        {/* Article list */}
        {rest.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Articles</Text>
            {rest.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onPress={() => handleArticlePress(article)}
              />
            ))}
          </>
        )}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No articles found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 26,
    color: '#1A2B4A',
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginEnd: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#1A2B4A',
  },
  bookmarkBtn: {
    width: 49,
    height: 49,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  bookmarkIcon: {
    fontSize: 20,
  },

  // Chips
  chipsContainer: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 4,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: '#D0D9E8',
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  chipText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 13,
    color: '#6B7A99',
  },
  chipTextActive: {
    color: '#fff',
  },

  // Section label
  sectionLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 16,
    color: '#1A2B4A',
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 10,
  },

  // Featured card
  featuredCard: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 8,
  },
  featuredImageBg: {
    height: 180,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredImagePlaceholder: {
    fontSize: 64,
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#4A90E2',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  featuredBadgeText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
    color: '#fff',
    letterSpacing: 0.5,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 8,
  },
  featuredTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 15,
    color: '#1A2B4A',
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 12,
    lineHeight: 22,
  },

  // Article card
  articleCard: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'flex-start',
  },
  articleThumb: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  articleThumbIcon: {
    fontSize: 28,
  },
  articleContent: {
    flex: 1,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  articleTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: '#1A2B4A',
    lineHeight: 19,
    marginBottom: 8,
  },

  // Shared: category tag
  categoryTag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryTagText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 10,
    letterSpacing: 0.4,
  },
  readTime: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: '#A0AEC0',
    marginLeft: 'auto',
  },

  // Shared: author row
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#BDD7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
    color: '#4A90E2',
  },
  authorName: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#6B7A99',
    flex: 1,
  },
  readBtn: {
    backgroundColor: '#4A90E2',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginLeft: 'auto',
  },
  readBtnText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 12,
    color: '#fff',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#A0AEC0',
  },
});