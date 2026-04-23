import React, { useCallback, useEffect, useState } from 'react';
import {
  View, ScrollView, StyleSheet, Image,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';

import { theme } from '@/theme';
import { Text } from '@/components/modal/shared/Text';
import { Button } from '@/components/modal/shared/Button';
import BackButton from '@/components/modal/shared/BackButton';
import Avatar from '@/components/modal/shared/Avatar';
import ProgressBar from '@/components/modal/shared/progressBar';
import Footer from '@/components/modal/shared/Footer';
import { useModal } from '@/components/modal/ModalProvider';
import { apiGetChildren, ChildResponse } from '@/services/api';
import { useActiveChildStore } from '@/store/activeChildStore';
import { useAuthStore } from '@/store/authStore';

const { colors, spacing, typography, radius } = theme;

function ChildCard({ child, onPress }: { child: ChildResponse; onPress: () => void }) {
  const { t } = useTranslation();
  const displayName = child.fullNameAr ?? child.fullNameEn ?? '—';
  const age = child.dateOfBirth
    ? Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Avatar name={displayName} size="md" />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>
          {displayName}
          {age != null ? `, ${t('myChildren.years', { age })}` : ''}
        </Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>0%</Text>
        </View>
        <ProgressBar value={0} height={6} showLabel={false} />
      </View>
    </TouchableOpacity>
  );
}

function AddSlot({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.slot} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.slotCircle}>
        <Text style={styles.slotPlus}>+</Text>
      </View>
      <View style={styles.slotLines}>
        <View style={styles.slotLineWide} />
        <View style={styles.slotLineNarrow} />
      </View>
    </TouchableOpacity>
  );
}

export default function MyChildrenListScreen() {
  const { t }    = useTranslation();
  const { show } = useModal();
  const setActiveChild = useActiveChildStore((s) => s.setActiveChild);
  const setSelectedChild = useAuthStore((s) => s.setSelectedChild);

  const [children,   setChildren]   = useState<ChildResponse[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiGetChildren();
      setChildren(data);
    } catch {
      // no children yet — empty list is fine
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload every time screen is focused (after linking a child)
  useEffect(() => { load(); }, [load]);

  const handleAdd = () => show('addChild');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>{t('myChildren.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.primary} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        >
          <Image
            source={require('@/assets/images/mascot/rafeeq_like.png')}
            style={styles.mascot}
            resizeMode="contain"
          />

          <Text style={styles.listTitle}>{t('myChildren.manageHeading')}</Text>

          <View style={styles.list}>
            {children.map((child) => (
              <ChildCard key={child.id} child={child} onPress={() => {
                setActiveChild(child);
                setSelectedChild(child);
                router.push('/(parent)/Home-parent' as any);
              }} />
            ))}
            <AddSlot onPress={handleAdd} />
          </View>

          <Button label={t('myChildren.addMore')} onPress={handleAdd} style={styles.btn} />

          <Footer
            onPrivacyPress={() => {}}
            onTermsPress={() => {}}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: colors.background },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle:      { fontSize: typography.fontSize.lg, fontFamily: typography.fontFamily.bold, color: colors.textPrimary },
  headerSpacer:     { width: 36 },
  scroll:           { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl, alignItems: 'center', gap: spacing.md },
  mascot:           { width: 100, height: 100 },
  listTitle:        { fontSize: typography.fontSize['2xl'], fontFamily: typography.fontFamily.bold, color: colors.primary, textAlign: 'center' },
  list:             { width: '100%', gap: spacing.md, marginTop: spacing.sm },
  card:             { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundLight, borderRadius: radius.xl, padding: spacing.md, gap: spacing.md },
  cardInfo:         { flex: 1, gap: 4 },
  cardName:         { fontSize: typography.fontSize.base, fontFamily: typography.fontFamily.semiBold, color: colors.textPrimary },
  progressRow:      { flexDirection: 'row', justifyContent: 'flex-end' },
  progressLabel:    { fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.bold, color: colors.primary, marginBottom: 2 },
  slot:             { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', borderRadius: radius.xl, backgroundColor: colors.backgroundLight, padding: spacing.md },
  slotCircle:       { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  slotPlus:         { fontSize: 22, color: colors.primary, fontFamily: typography.fontFamily.bold },
  slotLines:        { flex: 1, gap: spacing.xs },
  slotLineWide:     { height: 10, width: '75%', backgroundColor: colors.borderLight, borderRadius: radius.full },
  slotLineNarrow:   { height: 10, width: '50%', backgroundColor: colors.borderLight, borderRadius: radius.full },
  btn:              { width: '100%', marginTop: spacing.sm },
});