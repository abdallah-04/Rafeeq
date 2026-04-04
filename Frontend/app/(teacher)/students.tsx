import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TEACHER_STUDENTS } from './_students';

export default function StudentsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
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
        data={TEACHER_STUDENTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/(teacher)/student-quick-access', params: { studentId: item.id } })}
            activeOpacity={0.75}
          >
            <View style={[styles.cardTop, isRTL && styles.rowReverse]}>
              <View style={[styles.avatar, { backgroundColor: item.avatarBg }]}>
                <Text style={styles.avatarText}>{item.initials}</Text>
              </View>
              <View style={styles.cardInfo}>
                <View style={[styles.nameRow, isRTL && styles.rowReverse]}>
                  <Text style={styles.studentName}>{item.name}</Text>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>{item.status}</Text>
                  </View>
                </View>
                <View style={styles.tagsRow}>
                  <View style={[styles.tag, { backgroundColor: item.levelColor + '22' }]}>
                    <Text style={[styles.tagText, { color: item.levelColor }]}>{item.level}</Text>
                  </View>
                  <View style={[styles.tag, { backgroundColor: item.conditionColor + '22' }]}>
                    <Text style={[styles.tagText, { color: item.conditionColor }]}>{item.condition}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
              </View>
              <Text style={styles.progressLabel}>{item.progress}%</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  listContent: { padding: 16, paddingBottom: 32 },
  rowReverse: { flexDirection: 'row-reverse' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontFamily: 'Lexend_700Bold', fontSize: 22, color: '#1a1a2e' },
  addBtn: { backgroundColor: '#508DF7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99 },
  addBtnText: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#fff' },

  card: { backgroundColor: '#fff', borderRadius: 20, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(80,141,247,0.08)', shadowColor: '#508DF7', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(80,141,247,0.12)' },
  avatarText: { fontFamily: 'Lexend_600SemiBold', fontSize: 16, color: '#1a1a2e' },
  cardInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  studentName: { fontFamily: 'Lexend_600SemiBold', fontSize: 15, color: '#1a1a2e' },
  activeBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  activeBadgeText: { fontFamily: 'Lexend_600SemiBold', fontSize: 11, color: '#2E7D32' },
  tagsRow: { flexDirection: 'row', gap: 6 },
  tag: { paddingHorizontal: 9, paddingVertical: 2, borderRadius: 99 },
  tagText: { fontFamily: 'Lexend_600SemiBold', fontSize: 11 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: { flex: 1, height: 7, backgroundColor: '#EEF2FF', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#508DF7', borderRadius: 99 },
  progressLabel: { fontFamily: 'Lexend_600SemiBold', fontSize: 12, color: '#508DF7', minWidth: 32, textAlign: 'right' },

  ghostCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 20, padding: 14, borderWidth: 2, borderColor: '#C8D9FB', borderStyle: 'dashed', backgroundColor: '#F8FAFF' },
  ghostAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  ghostPlus: { fontSize: 26, color: '#508DF7', lineHeight: 30 },
  ghostText: { fontFamily: 'Lexend_500Medium', fontSize: 14, color: '#93C5FD' },
});
