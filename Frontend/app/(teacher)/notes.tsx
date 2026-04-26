import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Text } from '@/components/modal/shared/Text'

import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NotesFeedSkeleton } from '@/components/LoadingSkeleton';
import AnimatedProgressCircle from '@/components/AnimatedProgressCircle';
import BackButton from '@/components/BackButton';

import { apiGetNotesForTeacher, apiGetNotesForParent, apiGetStudent, NoteResponse } from '@/services/api';
import { useModal } from '@/components/modal/ModalProvider';
import { pickLocalizedName } from '@/utils/localizedName';

function NoteItem({
  note,
  isRTL,
}: {
  note: NoteResponse & { authorName?: string; avatarBg?: string; initials?: string };
  isRTL: boolean;
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
          <Text style={[styles.noteAuthor, isRTL && styles.textRight]}>{note.authorName ?? '-'}</Text>
          <Text style={[styles.noteDate, isRTL && styles.textRight]}>{displayDate}</Text>
        </View>
      </View>
      <Text style={[styles.noteTitle, isRTL && styles.textRight]}>{note.title}</Text>
      <Text style={[styles.noteText, isRTL && styles.textRight]}>{note.content}</Text>
    </View>
  );
}

export default function NotesScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { show } = useModal();
  const { studentId, studentName } = useLocalSearchParams<{ studentId: string; studentName?: string }>();
  const isRTL = i18n.language === 'ar';

  const [resolvedStudentName, setResolvedStudentName] = useState(studentName ?? '');
  const [activeTab, setActiveTab] = useState<'teacher' | 'parent'>('teacher');
  const [teacherNotes, setTeacherNotes] = useState<NoteResponse[]>([]);
  const [parentNotes, setParentNotes] = useState<NoteResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!studentId || studentName) return;
    apiGetStudent(studentId)
      .then((student) => setResolvedStudentName(pickLocalizedName(isRTL, student.fullNameAr, student.fullNameEn, '')))
      .catch(() => {});
  }, [isRTL, studentId, studentName]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (studentId) {
      router.replace({ pathname: '/(teacher)/Student_dashboard', params: { studentId } } as any);
      return;
    }
    router.replace('/(teacher)/(tabs)/students');
  }, [router, studentId]);

  const load = useCallback(async () => {
    if (!studentId) return;
    try {
      const [teacherFeed, parentFeed] = await Promise.allSettled([
        apiGetNotesForTeacher(studentId),
        apiGetNotesForParent(studentId),
      ]);

      if (teacherFeed.status !== 'fulfilled') {
        throw teacherFeed.reason;
      }

      setTeacherNotes(teacherFeed.value);
      setParentNotes(parentFeed.status === 'fulfilled' ? parentFeed.value : []);
    } catch {
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
    avatarBg: isTeacher ? '#BBDEFB' : '#FFD9B3',
    initials: isTeacher ? 'T' : 'P',
  });

  const currentNotes = activeTab === 'teacher'
    ? teacherNotes.map((note) => enrichNote(note, true))
    : parentNotes.map((note) => enrichNote(note, false));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={[styles.headerTopRow, isRTL && styles.rowReverse]}>
          <BackButton onPress={handleBack} />
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push({ pathname: '/(teacher)/add-note', params: { studentId } } as any)}
          >
            <Text style={styles.addBtnText}>+ {t('teacher.notes.add', 'Add')}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.headerBody, isRTL && styles.rowReverse]}>
          <View style={styles.headerCopy}>
            <Text style={[styles.headerTitle, isRTL && styles.textRight]}>
              {t('teacher.notes.title', 'Notes')}
            </Text>
            {!!resolvedStudentName && (
              <Text style={[styles.headerSubtitle, isRTL && styles.textRight]} numberOfLines={1}>
                {resolvedStudentName}
              </Text>
            )}
          </View>
          <View style={styles.circleWrap}>
            <AnimatedProgressCircle progress={0} size={66} color="#FFB84C" />
          </View>
        </View>
      </View>

      <View style={styles.tabsWrap}>
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
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {currentNotes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {activeTab === 'teacher'
                ? t('teacher.notes.empty', 'No notes yet')
                : t('teacher.notes.emptyParent', 'No parent notes yet')}
            </Text>
          </View>
        ) : (
          currentNotes.map((note) => (
            <NoteItem key={note.id} note={note} isRTL={isRTL} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },
  header: {
    backgroundColor: '#FFB84C',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 22,
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.88)',
  },
  circleWrap: {
    paddingLeft: 6,
  },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.24)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
  },
  addBtnText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: '#fff',
  },
  tabsWrap: {
    paddingHorizontal: 16,
    marginTop: -14,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#FFB84C',
  },
  tabText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 13,
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#fff',
    fontFamily: 'Lexend_700Bold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    color: '#9CA3AF',
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(80,141,247,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: '#1a1a2e',
  },
  noteAuthorBlock: {
    flex: 1,
  },
  noteAuthor: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: '#1a1a2e',
  },
  noteDate: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  noteTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
    color: '#374151',
    marginBottom: 7,
  },
  noteText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 22,
  },
});
