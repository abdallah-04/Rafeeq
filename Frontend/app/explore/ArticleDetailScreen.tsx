import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const ARTICLE_DATA: Record<string, {
  id: string;
  category: string;
  readTime: string;
  title: string;
  author: string;
  views: string;
  likes: number;
  saved: number;
  body: string[];
}> = {
  '1': {
    id: '1',
    category: 'Speech',
    readTime: '8 min read',
    title: 'Understanding Delayed Speech in Toddlers',
    author: 'Dr. Sarah Ahmed',
    views: '13k',
    likes: 250,
    saved: 16,
    body: [
      'Speech delays are more common than many parents realize. Between 10–15% of children under 3 show some form of communication delay — and early identification makes all the difference.',
      '"Early intervention before age 3 can dramatically improve long-term outcomes. The brain\'s plasticity during this window is unmatched at any later stage."',
      'If your child isn\'t meeting speech milestones, it doesn\'t always mean something is wrong — but it does mean it\'s worth exploring with a qualified specialist.',
      'Signs to watch for include: not babbling by 12 months, not using single words by 16 months, not combining two words by 24 months, or losing previously acquired language skills at any age.',
      'Working with a speech-language pathologist early can open doors to communication your child may otherwise struggle to access independently.',
    ],
  },
  '2': {
    id: '2',
    category: 'Learning',
    readTime: '5 min read',
    title: 'How to Support Your Child\'s Reading Skills at Home',
    author: 'Ms. Lina Haddad',
    views: '8k',
    likes: 134,
    saved: 9,
    body: [
      'Reading is one of the most foundational skills a child can develop. Home support plays a critical role alongside formal schooling.',
      'Simple daily habits — reading aloud for 20 minutes, pointing to words as you read, and asking open questions about the story — can build strong literacy foundations.',
      'Children with learning differences benefit greatly from multi-sensory approaches: seeing, hearing, and tracing letters simultaneously.',
    ],
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  Speech: '#4A90E2',
  Learning: '#7B61FF',
  Behavior: '#FF6B6B',
};

function SavedModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.savedModal}>
          <Text style={styles.savedModalIcon}>🔖</Text>
          <Text style={styles.savedModalTitle}>SAVED!</Text>
          <Text style={styles.savedModalSub}>Article added to your saved list</Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function StatChip({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ArticleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = ARTICLE_DATA[id ?? '1'] ?? ARTICLE_DATA['1'];

  const [bookmarked, setBookmarked] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [following, setFollowing] = useState(false);

  const handleBookmark = () => {
    if (!bookmarked) {
      setBookmarked(true);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } else {
      setBookmarked(false);
    }
  };

  const color = CATEGORY_COLORS[article.category] ?? '#4A90E2';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />

      {/* Top nav */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Article</Text>
        <TouchableOpacity style={styles.bookmarkNavBtn} onPress={handleBookmark}>
          <Text style={[styles.bookmarkNavIcon, bookmarked && styles.bookmarkNavIconActive]}>
            {bookmarked ? '🔖' : '🔖'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header image */}
        <View style={styles.headerImage}>
          <Text style={styles.headerImagePlaceholder}>👨‍👩‍👧</Text>
        </View>

        <View style={styles.body}>
          {/* Category + read time */}
          <View style={styles.metaRow}>
            <View style={[styles.categoryTag, { backgroundColor: color + '22' }]}>
              <Text style={[styles.categoryTagText, { color }]}>
                {article.category.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.readTime}>{article.readTime}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{article.title}</Text>

          {/* Author row */}
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>{article.author.charAt(0)}</Text>
            </View>
            <Text style={styles.authorName}>{article.author}</Text>
            <TouchableOpacity
              style={[styles.followBtn, following && styles.followBtnActive]}
              onPress={() => setFollowing(!following)}
            >
              <Text style={[styles.followBtnText, following && styles.followBtnTextActive]}>
                {following ? '✓ following' : '+follow'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatChip value={article.views} label="views" />
            <StatChip value={article.likes} label="likes" />
            <StatChip value={article.saved} label="saved" />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Body title */}
          <Text style={styles.bodyTitle}>{article.title}</Text>

          {/* Body paragraphs */}
          {article.body.map((para, i) => (
            para.startsWith('"') ? (
              <View key={i} style={styles.quoteBlock}>
                <View style={styles.quoteLine} />
                <Text style={styles.quoteText}>{para}</Text>
              </View>
            ) : (
              <Text key={i} style={styles.bodyText}>{para}</Text>
            )
          ))}
        </View>
      </ScrollView>

      {/* Saved modal */}
      <SavedModal visible={showSaved} onClose={() => setShowSaved(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },

  // Top nav
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFF',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: '#1A2B4A',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 17,
    color: '#1A2B4A',
  },
  bookmarkNavBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkNavIcon: {
    fontSize: 20,
    opacity: 0.4,
  },
  bookmarkNavIconActive: {
    opacity: 1,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Header image
  headerImage: {
    marginHorizontal: 20,
    height: 200,
    backgroundColor: '#EEF3FF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerImagePlaceholder: { fontSize: 72 },

  body: { paddingHorizontal: 20 },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTag: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryTagText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
    letterSpacing: 0.4,
  },
  readTime: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#A0AEC0',
    marginLeft: 'auto',
  },

  title: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: '#1A2B4A',
    lineHeight: 28,
    marginBottom: 14,
  },

  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#BDD7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  authorAvatarText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: '#4A90E2',
  },
  authorName: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#6B7A99',
    flex: 1,
  },
  followBtn: {
    borderWidth: 1.5,
    borderColor: '#4A90E2',
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  followBtnActive: {
    backgroundColor: '#4A90E2',
  },
  followBtnText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 12,
    color: '#4A90E2',
  },
  followBtnTextActive: {
    color: '#fff',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statChip: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 16,
    color: '#1A2B4A',
  },
  statLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: '#A0AEC0',
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: '#E8EEF8',
    marginBottom: 20,
  },

  bodyTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: '#1A2B4A',
    lineHeight: 26,
    marginBottom: 14,
  },
  bodyText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
    marginBottom: 14,
  },
  quoteBlock: {
    flexDirection: 'row',
    backgroundColor: '#EEF3FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    gap: 10,
  },
  quoteLine: {
    width: 4,
    backgroundColor: '#4A90E2',
    borderRadius: 2,
  },
  quoteText: {
    flex: 1,
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#4A5568',
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // Saved modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedModal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  savedModalIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  savedModalTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 22,
    color: '#1A2B4A',
    marginBottom: 6,
  },
  savedModalSub: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#6B7A99',
    textAlign: 'center',
  },
});