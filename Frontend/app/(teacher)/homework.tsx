import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { HWHistorySkeleton } from '@/components/LoadingSkeleton';

type HWItem = { id: string; title: string; date: string; status: string; statusColor: string; score: string | null };

const INITIAL_HW: HWItem[] = [
  { id: '3', title: 'H.W 3', date: 'Today',  status: 'Under review', statusColor: '#F97316', score: null },
  { id: '2', title: 'H.W 2', date: '18/10',   status: 'Done',         statusColor: '#22C55E', score: '5/7' },
  { id: '1', title: 'H.W 1', date: '11/10',   status: 'Done',         statusColor: '#22C55E', score: '7/7' },
];

export default function HomeworkScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const isRTL = i18n.language === 'ar';
  const [hwList, setHwList] = useState<HWItem[]>(INITIAL_HW);
  const [showForm, setShowForm] = useState(false);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <HWHistorySkeleton count={3} />;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Blue gradient header */}
      <View style={styles.header}>
        <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>{isRTL ? '→' : '←'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('teacher.hw.title', 'H.W')}</Text>
          <TouchableOpacity onPress={() => setShowForm(!showForm)} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ {t('teacher.hw.add', 'Add')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Add H.W Form */}
          {showForm && (
            <View style={styles.formCard}>
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

              <TouchableOpacity style={styles.uploadBox}>
                <Text style={styles.uploadIcon}>📎</Text>
                <Text style={styles.uploadText}>{t('teacher.hw.upload', 'Tap to upload')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, (!notes || !dueDate) && styles.submitBtnDisabled]}
                disabled={!notes || !dueDate}
                onPress={() => {
                  const newItem: HWItem = {
                    id: String(Date.now()),
                    title: `H.W ${hwList.length + 1}`,
                    date: dueDate,
                    status: 'Under review',
                    statusColor: '#F97316',
                    score: null,
                  };
                  setHwList((prev) => [newItem, ...prev]);
                  setNotes('');
                  setDueDate('');
                  setShowForm(false);
                }}
              >
                <Text style={styles.submitBtnText}>{t('teacher.hw.submit', 'Add')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* H.W History */}
          <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>
            {t('teacher.hw.history', 'H.W History')}
          </Text>

          {hwList.map((hw) => (
            <View key={hw.id} style={styles.hwCard}>
              <View style={[styles.hwRow, isRTL && styles.rowReverse]}>
                <View style={styles.hwLeft}>
                  <Text style={styles.hwTitle}>{hw.title}</Text>
                  <Text style={styles.hwDate}>{hw.date}</Text>
                </View>
                <View style={styles.hwRight}>
                  {hw.score && <Text style={styles.hwScore}>{hw.score}</Text>}
                  <View style={[styles.statusBadge, { backgroundColor: hw.statusColor + '22' }]}>
                    <Text style={[styles.statusText, { color: hw.statusColor }]}>{hw.status}</Text>
                  </View>
                  <TouchableOpacity style={styles.detailsBtn}>
                    <Text style={styles.detailsBtnText}>{t('teacher.hw.details', 'Details')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
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

  header: { backgroundColor: '#508DF7', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 18, color: '#fff' },
  headerTitle: { fontFamily: 'Lexend_700Bold', fontSize: 22, color: '#fff' },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99 },
  addBtnText: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#fff' },

  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 20, shadowColor: '#508DF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  label: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#EFF6FF', borderWidth: 1.5, borderColor: '#BFDBFE', borderRadius: 14, padding: 12, fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#1a1a2e', minHeight: 100 },
  inputDate: { backgroundColor: '#EFF6FF', borderWidth: 1.5, borderColor: '#BFDBFE', borderRadius: 14, padding: 12, fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#1a1a2e', height: 52 },
  uploadBox: { marginTop: 16, borderWidth: 2, borderColor: '#BFDBFE', borderStyle: 'dashed', borderRadius: 14, padding: 16, alignItems: 'center', gap: 6, backgroundColor: '#F8FAFF' },
  uploadIcon: { fontSize: 24 },
  uploadText: { fontFamily: 'Lexend_500Medium', fontSize: 13, color: '#508DF7' },
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
  hwScore: { fontFamily: 'Lexend_700Bold', fontSize: 13, color: '#22C55E' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  statusText: { fontFamily: 'Lexend_600SemiBold', fontSize: 11 },
  detailsBtn: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 },
  detailsBtnText: { fontFamily: 'Lexend_600SemiBold', fontSize: 11, color: '#508DF7' },
});
