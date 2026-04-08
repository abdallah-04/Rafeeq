import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

type Category = 'All' | 'Speech' | 'Learning' | 'Behavior';

interface SavedArticle {
  id: string;
  category: Category;
  readTime: string;
  title: string;
  author: string;
}

const SAVED: SavedArticle[] = [
  {
    id: '4',
    category: 'Speech',
    readTime: '4 min read',
    title: 'Early Intervention: Why It Matters for Speech Delays',
    author: 'Dr. Sarah Ahmed',
  },
  {
    id: '1',
    category: 'Speech',
    readTime: '8 min read',
    title: 'Understanding Delayed Speech in Toddlers',
    author: 'Dr. Sarah Ahmed',
  },
  {
    id: '2',
    category: 'Learning',
    readTime: '5 min read',
    title: 'How to Support Your Child\'s Reading Skills at Home',
    author: 'Ms. Lina Haddad',
  },
  {
    id: '3',
    category: 'Behavior',
    readTime: '6 min read',
    title: 'Managing ADHD Symptoms: A Parent\'s Guide',
    author: 'Dr. Omar Nassar',
  },
  {
    id: '5',
    category: 'Learning',
    readTime: '7 min read',
    title: 'Building Focus: Activities for Children with ADD',
    author: 'Ms. Rania Khalil',
  },
];

const CATEGORIES: Category[] = ['All', 'Speech', 'Learning', 'Behavior'];

const CATEGORY_COLORS: Record<string, string> = {
  Speech: '#4A90E2',
  Learning: '#7B61FF',
  Behavior: '#FF6B6B',
};

export default function SavedArticlesScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Category>('All');
  const [saved, setSaved] = useState<SavedArticle[]>(SAVED);

  const filtered =
    selected === 'All' ? saved : saved.filter((a) => a.category === selected);

  const handleRemove = (id: string) => {
    setSaved((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerIcon}>🔖</Text>
          <Text style={styles.headerTitle}>Saved artifact</Text>
        </View>
        <View style={styles.savedBadge}>
          <Text style={styles.savedBadgeText}>{saved.length} saved</Text>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={{ flexGrow: 0 }}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selected === cat && styles.chipActive]}
            onPress={() => setSelected(cat)}
          >
            <Text style={[styles.chipText, selected === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Article list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptyText}>
              Tap the bookmark icon on any article to save it here.
            </Text>
          </View>
        ) : (
          filtered.map((article) => {
            const color = CATEGORY_COLORS[article.category] ?? '#4A90E2';
            return (
              <TouchableOpacity
                key={article.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: '/explore/ArticleDetailScreen',
                    params: { id: article.id },
                  })
                }
              >
                {/* Thumbnail */}
                <View style={styles.thumb}>
                  <Text style={styles.thumbIcon}>📄</Text>
                </View>

                <View style={styles.cardContent}>
                  {/* Meta */}
                  <View style={styles.metaRow}>
                    <View
                      style={[
                        styles.categoryTag,
                        { backgroundColor: color + '22' },
                      ]}
                    >
                      <Text
                        style={[styles.categoryTagText, { color }]}
                      >
                        {article.category.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.readTime}>{article.readTime}</Text>
                  </View>

                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {article.title}
                  </Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.authorAvatar}>
                      <Text style={styles.authorAvatarText}>
                        {article.author.charAt(0)}
                      </Text>
                    </View>
                    <Text style={styles.authorName} numberOfLines={1}>
                      {article.author}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => handleRemove(article.id)}
                    >
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 22, color: '#1A2B4A' },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 4,
  },
  headerIcon: { fontSize: 20 },
  headerTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: '#1A2B4A',
  },
  savedBadge: {
    backgroundColor: '#4A90E2',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  savedBadgeText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 12,
    color: '#fff',
  },

  // Chips
  chips: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 12,
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
  chipTextActive: { color: '#fff' },

  // List
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32 },

  card: {
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
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  thumbIcon: { fontSize: 28 },
  cardContent: { flex: 1 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
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
  cardTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: '#1A2B4A',
    lineHeight: 19,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#BDD7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 10,
    color: '#4A90E2',
  },
  authorName: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#6B7A99',
    flex: 1,
  },
  removeBtn: {
    borderWidth: 1.5,
    borderColor: '#FF6B6B',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  removeBtnText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: '#FF6B6B',
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: '#1A2B4A',
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 20,
  },
});