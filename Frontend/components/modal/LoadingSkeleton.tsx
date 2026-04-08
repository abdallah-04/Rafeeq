/**
 * LoadingSkeleton.tsx
 * Reusable shimmer skeleton components for all teacher list screens.
 * Usage:
 *   <StudentListSkeleton />   — for students.tsx / index.tsx
 *   <NotesFeedSkeleton />     — for notes.tsx
 *   <HWHistorySkeleton />     — for homework.tsx
 *   <ReportsListSkeleton />   — for reports.tsx
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

// ─── Base shimmer hook ─────────────────────────────────────────
function useShimmer() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.75],
  });

  return opacity;
}

// ─── Base bone (single shimmer block) ─────────────────────────
function Bone({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const opacity = useShimmer();
  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: '#D1D9EF' },
        { opacity },
        style,
      ]}
    />
  );
}

// ─── 1. Student card skeleton ──────────────────────────────────
function StudentCardSkeleton() {
  return (
    <View style={styles.studentCard}>
      <View style={styles.cardTop}>
        {/* Avatar */}
        <Bone width={52} height={52} borderRadius={26} />
        <View style={styles.cardInfo}>
          {/* Name row */}
          <View style={styles.nameRow}>
            <Bone width={120} height={14} borderRadius={6} />
            <Bone width={50} height={20} borderRadius={99} />
          </View>
          {/* Tags */}
          <View style={styles.tagsRow}>
            <Bone width={60} height={18} borderRadius={99} />
            <Bone width={44} height={18} borderRadius={99} />
          </View>
        </View>
      </View>
      {/* Progress bar */}
      <View style={styles.progressRow}>
        <Bone width="85%" height={7} borderRadius={99} />
        <Bone width={32} height={12} borderRadius={4} />
      </View>
    </View>
  );
}

export function StudentListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <StudentCardSkeleton key={i} />
      ))}
    </View>
  );
}

// ─── 2. Notes feed skeleton ────────────────────────────────────
function NoteCardSkeleton() {
  return (
    <View style={styles.noteCard}>
      {/* Header: avatar + author + date */}
      <View style={styles.noteHeader}>
        <Bone width={38} height={38} borderRadius={19} />
        <View style={styles.noteAuthorBlock}>
          <Bone width={100} height={13} borderRadius={5} />
          <Bone width={60} height={10} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
      </View>
      {/* Text lines */}
      <Bone width="100%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
      <Bone width="75%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
    </View>
  );
}

export function NotesFeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </View>
  );
}

// ─── 3. H.W history skeleton ───────────────────────────────────
function HWCardSkeleton() {
  return (
    <View style={styles.hwCard}>
      <View style={styles.hwRow}>
        <View>
          <Bone width={60} height={14} borderRadius={5} />
          <Bone width={40} height={11} borderRadius={4} style={{ marginTop: 5 }} />
        </View>
        <View style={styles.hwRight}>
          <Bone width={44} height={22} borderRadius={99} />
          <Bone width={64} height={22} borderRadius={99} />
          <Bone width={54} height={28} borderRadius={99} />
        </View>
      </View>
    </View>
  );
}

export function HWHistorySkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.listContainer}>
      {/* Form placeholder */}
      <View style={styles.formPlaceholder}>
        <Bone width="100%" height={14} borderRadius={5} />
        <Bone width="100%" height={90} borderRadius={14} style={{ marginTop: 12 }} />
        <Bone width="100%" height={50} borderRadius={14} style={{ marginTop: 12 }} />
        <Bone width="100%" height={50} borderRadius={14} style={{ marginTop: 12 }} />
        <Bone width="100%" height={50} borderRadius={14} style={{ marginTop: 12 }} />
      </View>
      {/* History */}
      <Bone width={100} height={16} borderRadius={6} style={{ marginBottom: 10 }} />
      {Array.from({ length: count }).map((_, i) => (
        <HWCardSkeleton key={i} />
      ))}
    </View>
  );
}

// ─── 4. Reports list skeleton ──────────────────────────────────
function ReportCardSkeleton() {
  return (
    <View style={styles.reportCard}>
      <View style={styles.reportRow}>
        {/* Icon */}
        <Bone width={44} height={44} borderRadius={12} />
        <View style={styles.reportInfo}>
          <Bone width={130} height={14} borderRadius={5} />
          <Bone width={60} height={11} borderRadius={4} style={{ marginTop: 5 }} />
        </View>
        {/* Download btn */}
        <Bone width={36} height={36} borderRadius={18} />
      </View>
    </View>
  );
}

export function ReportsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.listContainer}>
      {/* Form placeholder */}
      <View style={styles.formPlaceholder}>
        <Bone width="100%" height={14} borderRadius={5} />
        <Bone width="100%" height={50} borderRadius={14} style={{ marginTop: 12 }} />
        <Bone width="100%" height={90} borderRadius={14} style={{ marginTop: 12 }} />
        <Bone width="100%" height={50} borderRadius={14} style={{ marginTop: 12 }} />
        <Bone width="100%" height={50} borderRadius={14} style={{ marginTop: 12 }} />
      </View>
      {/* List */}
      <Bone width={130} height={16} borderRadius={6} style={{ marginBottom: 10 }} />
      {Array.from({ length: count }).map((_, i) => (
        <ReportCardSkeleton key={i} />
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },

  // Student card
  studentCard: {
    backgroundColor: '#F8FAFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(80,141,247,0.06)',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  cardInfo: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Note card
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noteAuthorBlock: {
    flex: 1,
  },

  // HW card
  hwCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  hwRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hwRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Report card
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reportInfo: { flex: 1 },

  // Form placeholder
  formPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
});
