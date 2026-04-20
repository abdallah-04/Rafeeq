import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StudentListSkeleton } from '@/components/LoadingSkeleton';
import { apiGetStudents, StudentResponse } from '@/services/api';
import { useModal } from '@/components/modal/ModalProvider';

const LEVEL_COLOR  = '#BA6DE9';
const DIFF_COLORS: Record<string, string> = {
  ADD:'#508DF7', ADHD:'#A855F7', ASD:'#10B981',
  DYS:'#F97316', IFD:'#EF4444', OTHER:'#6B7280',
};

export default function StudentsScreen() {
  const router = useRouter();
  const { show } = useModal();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [students,    setStudents]    = useState<StudentResponse[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiGetStudents();
      setStudents(data);
    } catch (err: any) {
      show('error', { variant: 'invalidInfo' });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (isLoading) return <StudentListSkeleton count={3} />;

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const AVATAR_COLORS = ['#FFD9B3','#C8E6C9','#BBDEFB','#F8BBD0','#E1BEE7'];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <Text style={styles.headerTitle}>{t('teacher.students.title', 'My Students')}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/(teacher)/add-student')}
        >
          <Text style={styles.addBtnText}>+ {t('teacher.students.add', 'Add')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>{t('teacher.students.empty', 'No students yet')}</Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.ghostCard}
            onPress={() => router.push('/(teacher)/add-student')}
          >
            <View style={styles.ghostAvatar}>
              <Text style={styles.ghostPlus}>+</Text>
            </View>
            <Text style={styles.ghostText}>{t('teacher.students.addFirst', 'Add a new student')}</Text>
          </TouchableOpacity>
        }
        renderItem={({ item, index }) => {
          const diffColor = DIFF_COLORS[item.learningDifficulty ?? 'OTHER'] ?? '#6B7280';
          const avatarBg  = AVATAR_COLORS[index % AVATAR_COLORS.length];
          const initials  = getInitials(item.fullNameAr || item.fullNameEn || '?');
          const displayName = isRTL ? item.fullNameAr : (item.fullNameEn ?? item.fullNameAr);
          const progress  = 0; // no progress field yet from backend

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: '/(teacher)/student-quick-access', params: { studentId: item.id } })}
              activeOpacity={0.75}
            >
              <View style={[styles.cardTop, isRTL && styles.rowReverse]}>
                <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <View style={[styles.nameRow, isRTL && styles.rowReverse]}>
                    <Text style={styles.studentName}>{displayName}</Text>
                    <View style={[styles.activeBadge, item.status === 'ACTIVE' ? styles.activeBadgeGreen : styles.activeBadgeOrange]}>
                      <Text style={[styles.activeBadgeText, item.status === 'ACTIVE' ? styles.activeTextGreen : styles.activeTextOrange]}>
                        {item.status === 'ACTIVE' ? t('teacher.studentCard.active','Active') : t('teacher.studentCard.pending','Pending')}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.tagsRow, isRTL && styles.rowReverse]}>
                    {item.level != null && (
                      <View style={[styles.tag, { backgroundColor: LEVEL_COLOR + '22' }]}>
                        <Text style={[styles.tagText, { color: LEVEL_COLOR }]}>
                          {t('teacher.studentCard.level', { level: item.level })}
                        </Text>
                      </View>
                    )}
                    {item.learningDifficulty && (
                      <View style={[styles.tag, { backgroundColor: diffColor + '22' }]}>
                        <Text style={[styles.tagText, { color: diffColor }]}>{item.learningDifficulty}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressLabel}>{progress}%</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: '#F5F7FF' },
  listContent:       { padding: 16, paddingBottom: 32 },
  rowReverse:        { flexDirection: 'row-reverse' },
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle:       { fontFamily: 'Lexend_700Bold', fontSize: 22, color: '#1a1a2e' },
  addBtn:            { backgroundColor: '#508DF7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99 },
  addBtnText:        { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#fff' },
  emptyBox:          { alignItems: 'center', paddingTop: 60 },
  emptyText:         { fontFamily: 'Lexend_500Medium', fontSize: 15, color: '#93C5FD' },
  card:              { backgroundColor: '#fff', borderRadius: 20, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(80,141,247,0.08)', shadowColor: '#508DF7', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTop:           { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar:            { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(80,141,247,0.12)' },
  avatarText:        { fontFamily: 'Lexend_600SemiBold', fontSize: 16, color: '#1a1a2e' },
  cardInfo:          { flex: 1 },
  nameRow:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  studentName:       { fontFamily: 'Lexend_600SemiBold', fontSize: 15, color: '#1a1a2e', flex: 1 },
  activeBadge:       { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  activeBadgeGreen:  { backgroundColor: '#E8F5E9' },
  activeBadgeOrange: { backgroundColor: '#FFF3E0' },
  activeBadgeText:   { fontFamily: 'Lexend_600SemiBold', fontSize: 11 },
  activeTextGreen:   { color: '#2E7D32' },
  activeTextOrange:  { color: '#E65100' },
  tagsRow:           { flexDirection: 'row', gap: 6 },
  tag:               { paddingHorizontal: 9, paddingVertical: 2, borderRadius: 99 },
  tagText:           { fontFamily: 'Lexend_600SemiBold', fontSize: 11 },
  progressRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack:     { flex: 1, height: 7, backgroundColor: '#EEF2FF', borderRadius: 99, overflow: 'hidden' },
  progressFill:      { height: '100%', backgroundColor: '#508DF7', borderRadius: 99 },
  progressLabel:     { fontFamily: 'Lexend_600SemiBold', fontSize: 12, color: '#508DF7', minWidth: 32, textAlign: 'right' },
  ghostCard:         { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 20, padding: 14, borderWidth: 2, borderColor: '#C8D9FB', borderStyle: 'dashed', backgroundColor: '#F8FAFF' },
  ghostAvatar:       { width: 52, height: 52, borderRadius: 26, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  ghostPlus:         { fontSize: 26, color: '#508DF7', lineHeight: 30 },
  ghostText:         { fontFamily: 'Lexend_500Medium', fontSize: 14, color: '#93C5FD' },
});