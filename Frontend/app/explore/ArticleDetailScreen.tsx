import React, { useState } from 'react';
import {
  View,
  Text,
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
import { useAuthStore } from '@/store/authStore';
import { useModal } from '@/components/modal/ModalProvider';
import { theme } from '@/theme';

const { colors, spacing, typography, radius } = theme;

// ─── Article data ─────────────────────────────────────────────────────────────

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
      '"Children with learning differences benefit greatly from multi-sensory approaches: seeing, hearing, and tracing letters simultaneously."',
    ],
  },
  '3': {
    id: '3',
    category: 'Behavior',
    readTime: '6 min read',
    title: "Managing ADHD Symptoms: A Parent's Guide",
    author: 'Dr. Omar Nassar',
    views: '11k',
    likes: 198,
    saved: 22,
    body: [
      'ADHD is one of the most commonly diagnosed neurodevelopmental disorders in children. Understanding it is the first step toward effective management.',
      '"Structure and routine are not restrictions — they are the scaffolding that allows children with ADHD to thrive within predictable boundaries."',
      'Break tasks into small, achievable steps. Children with ADHD often feel overwhelmed by large tasks; chunking creates momentum.',
      'Positive reinforcement works far better than punishment. Reward the effort, not just the result.',
    ],
  },
  '4': {
    id: '4',
    category: 'Speech',
    readTime: '4 min read',
    title: 'Early Intervention: Why It Matters for Speech Delays',
    author: 'Dr. Sarah Ahmed',
    views: '9k',
    likes: 176,
    saved: 14,
    body: [
      'The first three years of life are a critical window for language development. During this time, the brain creates neural pathways at an extraordinary rate.',
      '"Every interaction — reading, singing, talking — is building the architecture for language. This is why early speech therapy is so powerful."',
      'Many parents wait too long before seeking help. But assessment is just assessment — it opens options, not closes them.',
    ],
  },
  '5': {
    id: '5',
    category: 'Learning',
    readTime: '7 min read',
    title: 'Building Focus: Activities for Children with ADD',
    author: 'Ms. Rania Khalil',
    views: '6k',
    likes: 112,
    saved: 8,
    body: [
      'Attention Deficit Disorder (ADD) without hyperactivity is often overlooked because the child may seem quiet or daydreamy rather than disruptive.',
      '"The challenge is not attention itself — children with ADD can hyperfocus on things they love. The challenge is directing attention on demand."',
      'Structured play, puzzles, and short timed tasks help train the attention muscle. Start with 5-minute focus sessions and build gradually.',
    ],
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  Speech:   '#4A90E2',
  Learning: '#7B61FF',
  Behavior: '#FF6B6B',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Speech:   '🗣️',
  Learning: '📚',
  Behavior: '🧠',
};

// ─── Stat chip ────────────────────────────────────────────────────────────────

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
  const router  = useRouter();
  const { t }   = useTranslation();
  const isRTL   = useAuthStore((s) => s.isRTL);
  const { show } = useModal();

  const { id } = useLocalSearchParams<{ id: string }>();
  const article = ARTICLE_DATA[id ?? '1'] ?? ARTICLE_DATA['1'];

  const [bookmarked, setBookmarked] = useState(false);
  const [following,  setFollowing]  = useState(false);

  const handleBookmark = () => {
    if (!bookmarked) {
      setBookmarked(true);
      show('success', { variant: 'saved' });
    } else {
      setBookmarked(false);
    }
  };

  const color = CATEGORY_COLORS[article.category] ?? '#4A90E2';
  const emoji = CATEGORY_EMOJIS[article.category] ?? '📄';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* Top nav: back | title | bookmark */}
      <View style={[styles.topNav, isRTL && styles.rowReverse]}>
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
        {/* Hero image */}
        <View style={styles.heroImage}>
          <Text style={styles.heroEmoji}>{emoji}</Text>
        </View>

        <View style={styles.body}>
          {/* Category + read time */}
          <View style={[styles.metaRow, isRTL && styles.rowReverse]}>
            <View style={[styles.categoryTag, { backgroundColor: color + '22' }]}>
              <Text style={[styles.categoryTagText, { color }]}>
                {article.category.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.readTime}>
              {article.readTime}
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, isRTL && styles.textRight]}>
            {article.title}
          </Text>

          {/* Author row */}
          <View style={[styles.authorRow, isRTL && styles.rowReverse]}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>{article.author.charAt(0)}</Text>
            </View>
            <Text style={[styles.authorName, { flex: 1 }]}>{article.author}</Text>
            <TouchableOpacity
              style={[styles.followBtn, following && styles.followBtnActive]}
              onPress={() => setFollowing(!following)}
              accessibilityLabel={following ? t('explore.following') : t('explore.follow')}
            >
              <Text style={[styles.followBtnText, following && styles.followBtnTextActive]}>
                {following ? `✓ ${t('explore.following')}` : t('explore.follow')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={[styles.statsRow, isRTL && styles.rowReverse]}>
            <StatChip value={article.views} label={t('explore.views')} />
            <StatChip value={article.likes} label={t('explore.likes')} />
            <StatChip value={article.saved} label={t('explore.savedBadge')} />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Body paragraphs */}
          {article.body.map((para, i) =>
            para.startsWith('"') ? (
              <View key={i} style={[styles.quoteBlock, isRTL && styles.rowReverse]}>
                <View style={styles.quoteLine} />
                <Text style={[styles.quoteText, isRTL && styles.textRight]}>{para}</Text>
              </View>
            ) : (
              <Text key={i} style={[styles.bodyText, isRTL && styles.textRight]}>
                {para}
              </Text>
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  rowReverse: { flexDirection: 'row-reverse' },
  textRight:  { textAlign: 'right' },

  // ── Top nav ─────────────────────────────────────
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

  // ── Scroll ──────────────────────────────────────
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },

  // ── Hero image ──────────────────────────────────
  heroImage: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    height: 200,
    backgroundColor: '#EEF3FF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroEmoji: { fontSize: 72 },

  // ── Body ────────────────────────────────────────
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
  },

  // ── Author ──────────────────────────────────────
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

  // ── Stats ────────────────────────────────────────
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

  // ── Content ──────────────────────────────────────
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
  },
});
