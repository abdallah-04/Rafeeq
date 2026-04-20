import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { HWHistorySkeleton } from '@/components/LoadingSkeleton';
import BackButton from '@/components/BackButton';
import { apiGetHomeworkForTeacher, apiCreateHomework, HomeworkResponse } from '@/services/api';
import { useModal } from '@/components/modal/ModalProvider';

export default function HomeworkScreen() {
  const router = useRouter();
  const { show } = useModal();
  const { t, i18n } = useTranslation();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const isRTL = i18n.language === 'ar';

  const [hwList, setHwList]   = useState<HomeworkResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [notes, setNotes]     = useState('');
  const [title, setTitle]     = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!studentId) return;
    try {
      const data = await apiGetHomeworkForTeacher(studentId);
      setHwList(data);
    } catch (err: any) {
      show('error', { variant: 'invalidInfo' });
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const handleAddHomework = async () => {
    if (!notes || !dueDate || !studentId || !title) return;
    setSubmitting(true);
    try {
      // Convert DD/MM/YYYY or MM/DD/YYYY to YYYY-MM-DD
      const parts = dueDate.split('/');
      let isoDate = dueDate;
      if (parts.length === 3) {
        // Assume MM/DD/YYYY
        isoDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      }
      const newHw = await apiCreateHomework({
        childId:     studentId,
        title,
        description: notes,
        dueDate:     isoDate,
      });
      setHwList((prev) => [newHw, ...prev]);
      setNotes('');
      setTitle('');
      setDueDate('');
      setShowForm(false);
    } catch (err: any) {
      show('error', { variant: 'invalidInfo' });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <HWHistorySkeleton count={3} />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>{t('teacher.hw.title', 'H.W')}</Text>
          <TouchableOpacity onPress={() => setShowForm(!showForm)} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ {t('teacher.hw.add', 'Add')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {showForm && (
            <View style={styles.formCard}>
              <Text style={[styles.label, isRTL && styles.textRight]}>
                {t('teacher.hw.titleLabel', 'H.W Title')}
              </Text>
              <TextInput
                style={[styles.inputDate, isRTL && styles.textRight]}
                placeholder={t('teacher.hw.titlePlaceholder', 'Title...')}
                placeholderTextColor="#93C5FD"
                value={title}
                onChangeText={setTitle}
                textAlign={isRTL ? 'right' : 'left'}
              />

              <Text style={[styles.label, isRTL && styles.textRight]}>
                {t('teacher.hw.notesLabel', 'H.W Details')}
              </Text>
              <TextInput
                style={[styles.input, isRTL && styles.textRight]}
                placeholder={t('teacher.hw.notesPlaceholder', 'H.W Details...')}
                placeholderTextColor="#93C5FD"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                textAlign={isRTL ? 'right' : 'left'}
              />

              <Text style={[styles.label, isRTL && styles.textRight]}>
                {t('teacher.hw.dueDate', 'Due Date')}
              </Text>
              <TextInput
                style={[styles.inputDate, isRTL && styles.textRight]}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#93C5FD"
                value={dueDate}
                onChangeText={setDueDate}
                textAlign={isRTL ? 'right' : 'left'}
              />

              <TouchableOpacity
                style={[styles.submitBtn, (!notes || !dueDate || !title || submitting) && styles.submitBtnDisabled]}
                disabled={!notes || !dueDate || !title || submitting}
                onPress={handleAddHomework}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? '...' : t('teacher.hw.submit', 'Add')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>
            {t('teacher.hw.history', 'H.W History')}
          </Text>

          {hwList.length === 0 ? (
            <Text style={[styles.emptyText, isRTL && styles.textRight]}>
              {t('teacher.hw.empty', 'No homework assigned yet')}
            </Text>
          ) : hwList.map((hw) => (
            <View key={hw.id} style={styles.hwCard}>
              <View style={[styles.hwRow, isRTL && styles.rowReverse]}>
                <View style={styles.hwLeft}>
                  <Text style={styles.hwTitle}>{hw.title}</Text>
                  <Text style={styles.hwDate}>{hw.dueDate}</Text>
                </View>
                <View style={styles.hwRight}>
                  <View style={[styles.statusBadge, {
                    backgroundColor: hw.status === 'DONE' ? '#22C55E22' : '#F9731622',
                  }]}>
                    <Text style={[styles.statusText, {
                      color: hw.status === 'DONE' ? '#22C55E' : '#F97316',
                    }]}>{hw.status}</Text>
                  </View>
                </View>
              </View>
              {hw.description ? (
                <Text style={[styles.hwDesc, isRTL && styles.textRight]}>{hw.description}</Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
  emptyText: { color: '#9CA3AF', fontFamily: 'Lexend_400Regular', fontSize: 14, textAlign: 'center', marginTop: 24 },

  header: { backgroundColor: '#508DF7', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16 },
  headerTitle: { fontFamily: 'Lexend_700Bold', fontSize: 22, color: '#fff' },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99 },
  addBtnText: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#fff' },

  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 20, shadowColor: '#508DF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  label: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#EFF6FF', borderWidth: 1.5, borderColor: '#BFDBFE', borderRadius: 14, padding: 12, fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#1a1a2e', minHeight: 100 },
  inputDate: { backgroundColor: '#EFF6FF', borderWidth: 1.5, borderColor: '#BFDBFE', borderRadius: 14, padding: 12, fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#1a1a2e', height: 52 },
  submitBtn: { marginTop: 16, backgroundColor: '#508DF7', borderRadius: 14, padding: 14, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#93C5FD' },
  submitBtnText: { fontFamily: 'Lexend_700Bold', fontSize: 15, color: '#fff' },

  sectionTitle: { fontFamily: 'Lexend_700Bold', fontSize: 15, color: '#1a1a2e', marginBottom: 10 },
  hwCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  hwRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hwLeft: {},
  hwTitle: { fontFamily: 'Lexend_600SemiBold', fontSize: 14, color: '#1a1a2e' },
  hwDate: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  hwRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hwDesc: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#6B7280', marginTop: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  statusText: { fontFamily: 'Lexend_600SemiBold', fontSize: 11 },
});