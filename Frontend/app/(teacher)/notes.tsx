import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NotesFeedSkeleton } from '@/components/LoadingSkeleton';
import AnimatedProgressCircle from '@/components/AnimatedProgressCircle';
import BackButton from '@/components/BackButton';

import { apiGetNotesForTeacher, apiGetNotesForParent, apiGetStudent, NoteResponse } from '@/services/api';
import { useModal } from '@/components/modal/ModalProvider';

function NoteItem({ note, isRTL, t }: {
  note: NoteResponse & { authorName?: string; avatarBg?: string; initials?: string };
  isRTL: boolean;
  t: any;
}) {
  const displayDate = note.createdAt
    ? new Date(note.createdAt).toLocaleDateString(isRTL ? 'ar-JO' : 'en-GB', { day: '2-digit', month: '2-digit' })
    : '';
  return (
    <View style={styles.noteCard}>
      <View style={[styles.noteHeader, isRTL && styles.rowReverse]}>
        <View style={[styles.avatar, { backgroundColor: note.avatarBg ?? '#BBDEFB' }]}>
          <Text style={styles.avatarText}>{note.initials ?? '?'}</Text>
        </View>
        <View style={styles.noteAuthorBlock}>
          <Text style={[styles.noteAuthor, isRTL && styles.textRight]}>{note.authorName ?? '—'}</Text>
          <Text style={[styles.noteDate, isRTL && styles.textRight]}>{displayDate}</Text>
        </View>
      </View>
      <Text style={styles.noteTitle}>{note.title}</Text>
      <Text style={[styles.noteText, isRTL && styles.textRight]}>{note.content}</Text>
    </View>
  );
}

export default function NotesScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { show } = useModal();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const isRTL = i18n.language === 'ar';
  const [studentName, setStudentName] = useState('');
  useEffect(() => {
    if (!studentId) return;
    apiGetStudent(studentId).then((s) => setStudentName(s.fullNameAr ?? s.fullNameEn ?? '')).catch(() => {});
  }, [studentId]);

  const [activeTab,   setActiveTab]   = useState<'teacher' | 'parent'>('teacher');
  const [teacherNotes, setTeacherNotes] = useState<NoteResponse[]>([]);
  const [parentNotes,  setParentNotes]  = useState<NoteResponse[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);

  const load = useCallback(async () => {
    if (!studentId) return;
    try {
      const [tNotes, pNotes] = await Promise.allSettled([
        apiGetNotesForTeacher(studentId),
        apiGetNotesForParent(studentId),
      ]);
      if (tNotes.status !== 'fulfilled') throw tNotes.reason;
      setTeacherNotes(tNotes.value);
      setParentNotes(pNotes.status === 'fulfilled' ? pNotes.value : []);
    } catch (err: any) {
      show('error', { variant: 'invalidInfo' });
    } finally {
      setIsLoading(false);
    }
  }, [studentId, show]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (isLoading) return <NotesFeedSkeleton count={4} />;

  const enrichNote = (note: NoteResponse, isTeacher: boolean) => ({
    ...note,
    authorName: isTeacher ? (isRTL ? 'المعلم' : 'Teacher') : (isRTL ? 'ولي الأمر' : 'Parent'),
    avatarBg:   isTeacher ? '#BBDEFB' : '#FFD9B3',
    initials:   isTeacher ? 'T' : 'P',
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Orange header */}
      <View style={styles.header}>
        <View style={[styles.headerInner, isRTL && styles.rowReverse]}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>{t('teacher.notes.title', 'Notes')}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push({ pathname: '/(teacher)/add-note', params: { studentId } } as any)}
          >
            <Text style={styles.addBtnText}>+ {t('teacher.notes.add', 'Add')}</Text>
          </TouchableOpacity>
        </View>
        <AnimatedProgressCircle progress={0} size={64} color="#FFB84C" />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['teacher', 'parent'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'teacher'
                ? t('teacher.notes.teacherFeed', "Teacher's Feed")
                : t('teacher.notes.parentNotes', 'Parent Notes')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'teacher'
          ? teacherNotes.length === 0
            ? <Text style={styles.emptyText}>{t('teacher.notes.empty', 'No notes yet')}</Text>
            : teacherNotes.map((n) => <NoteItem key={n.id} note={enrichNote(n, true)} isRTL={isRTL} t={t} />)
          : parentNotes.length === 0
            ? <Text style={styles.emptyText}>{t('teacher.notes.emptyParent', 'No parent notes yet')}</Text>
            : parentNotes.map((n)  => <NoteItem key={n.id} note={enrichNote(n, false)} isRTL={isRTL} t={t} />)
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
  emptyText: { color: '#9CA3AF', fontFamily: 'Lexend_400Regular', fontSize: 14, textAlign: 'center', marginTop: 24 },

  header: { backgroundColor: '#FFB84C', paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontFamily: 'Lexend_700Bold', fontSize: 20, color: '#fff' },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99 },
  addBtnText: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#fff' },

  tabs: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#FFB84C' },
  tabText: { fontFamily: 'Lexend_500Medium', fontSize: 13, color: '#9CA3AF' },
  tabTextActive: { color: '#fff', fontFamily: 'Lexend_700Bold' },

  noteCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#1a1a2e' },
  noteAuthorBlock: { flex: 1 },
  noteAuthor: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#1a1a2e' },
  noteDate: { fontFamily: 'Lexend_400Regular', fontSize: 11, color: '#9CA3AF' },
  noteTitle: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 4 },
  noteText: { fontFamily: 'Lexend_400Regular', fontSize: 13, color: '#374151', lineHeight: 20 },
});
