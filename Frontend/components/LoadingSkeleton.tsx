import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, StyleProp, ViewStyle } from 'react-native';

function SkeletonBox({ style }: { style?: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return <Animated.View style={[s.box, style, { opacity }]} />;
}

// ── Student list skeleton ──────────────────────────────────────
function StudentCard() {
  return (
    <View style={s.card}>
      <View style={s.row}>
        <SkeletonBox style={s.avatar} />
        <View style={{ flex: 1, gap: 8 }}>
          <SkeletonBox style={s.line80} />
          <SkeletonBox style={s.line50} />
        </View>
      </View>
      <SkeletonBox style={s.progressBar} />
    </View>
  );
}

export function StudentListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={s.wrap}>
      {Array.from({ length: count }).map((_, i) => <StudentCard key={i} />)}
    </View>
  );
}

// ── Notes feed skeleton ────────────────────────────────────────
function NoteCard() {
  return (
    <View style={s.card}>
      <View style={[s.row, { marginBottom: 10 }]}>
        <SkeletonBox style={s.avatarSm} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBox style={s.line60} />
          <SkeletonBox style={s.line30} />
        </View>
      </View>
      <SkeletonBox style={s.line100} />
      <SkeletonBox style={[s.line80, { marginTop: 6 }]} />
    </View>
  );
}

export function NotesFeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={s.wrap}>
      {Array.from({ length: count }).map((_, i) => <NoteCard key={i} />)}
    </View>
  );
}

// ── H.W history skeleton ───────────────────────────────────────
function HWCard() {
  return (
    <View style={s.card}>
      <View style={s.rowBetween}>
        <View style={{ gap: 6 }}>
          <SkeletonBox style={s.line60} />
          <SkeletonBox style={s.line30} />
        </View>
        <View style={[s.row, { gap: 8 }]}>
          <SkeletonBox style={s.badge} />
          <SkeletonBox style={s.badgeSm} />
        </View>
      </View>
    </View>
  );
}

export function HWHistorySkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={s.wrap}>
      {Array.from({ length: count }).map((_, i) => <HWCard key={i} />)}
    </View>
  );
}

// ── Reports list skeleton ──────────────────────────────────────
function ReportCard() {
  return (
    <View style={s.card}>
      <View style={s.row}>
        <SkeletonBox style={s.iconBox} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBox style={s.line70} />
          <SkeletonBox style={s.line30} />
        </View>
        <SkeletonBox style={s.circle36} />
      </View>
    </View>
  );
}

export function ReportsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={s.wrap}>
      {Array.from({ length: count }).map((_, i) => <ReportCard key={i} />)}
    </View>
  );
}

const s = StyleSheet.create({
  box:        { backgroundColor: '#D1D9EF', borderRadius: 8 },
  wrap:       { padding: 16, gap: 12 },
  card:       { backgroundColor: '#fff', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  row:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar:     { width: 52, height: 52, borderRadius: 26 },
  avatarSm:   { width: 38, height: 38, borderRadius: 19 },
  iconBox:    { width: 44, height: 44, borderRadius: 12 },
  circle36:   { width: 36, height: 36, borderRadius: 18 },
  progressBar:{ height: 7, borderRadius: 99, marginTop: 10 },
  badge:      { width: 72, height: 24, borderRadius: 99 },
  badgeSm:    { width: 56, height: 24, borderRadius: 99 },
  line100:    { height: 13, borderRadius: 6 },
  line80:     { height: 13, borderRadius: 6, width: '80%' },
  line70:     { height: 13, borderRadius: 6, width: '70%' },
  line60:     { height: 13, borderRadius: 6, width: '60%' },
  line50:     { height: 13, borderRadius: 6, width: '50%' },
  line30:     { height: 11, borderRadius: 6, width: '30%' },
});
