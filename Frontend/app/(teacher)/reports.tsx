import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ReportsListSkeleton } from '@/components/LoadingSkeleton';

type ReportItem = { id: string; title: string; date: string; icon: string };

const INITIAL_REPORTS: ReportItem[] = [
  { id: '1', title: 'Exam schedule',      date: '28/10', icon: '📅' },
  { id: '2', title: 'Math test answer',   date: '21/10', icon: '📝' },
  { id: '3', title: 'New Tasks',          date: '14/10', icon: '📋' },
];

export default function ReportsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const isRTL = i18n.language === 'ar';
  const [reportList, setReportList] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [showForm, setShowForm] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportSubject, setReportSubject] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <ReportsListSkeleton count={3} />;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Purple gradient header */}
      <View style={styles.header}>
        <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>{isRTL ? '→' : '←'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('teacher.reports.title', 'Reports')}</Text>
          <TouchableOpacity onPress={() => setShowForm(!showForm)} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ {t('teacher.reports.add', 'Add')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Add Report Form */}
          {showForm && (
            <View style={styles.formCard}>
              <Text style={[styles.label, isRTL && styles.textRight]}>
                {t('teacher.reports.reportTitle', 'Report Title')}
              </Text>
              <TextInput
                style={[styles.inputPurple, isRTL && styles.textRight]}
                placeholder={t('teacher.reports.titlePlaceholder', 'Enter report title...')}
                placeholderTextColor="#C4B5FD"
                value={reportTitle}
                onChangeText={setReportTitle}
                textAlign={isRTL ? 'right' : 'left'}
              />

              <Text style={[styles.label, isRTL && styles.textRight]}>
                {t('teacher.reports.reportSubject', 'Report Subject')}
              </Text>
              <TextInput
                style={[styles.inputPurpleMulti, isRTL && styles.textRight]}
                placeholder={t('teacher.reports.details', 'Details...')}
                placeholderTextColor="#C4B5FD"
                value={reportSubject}
                onChangeText={setReportSubject}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                textAlign={isRTL ? 'right' : 'left'}
              />

              <TouchableOpacity style={styles.uploadBox}>
                <Text style={styles.uploadIcon}>📎</Text>
                <Text style={styles.uploadText}>{t('teacher.reports.upload', 'Tap to upload')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, (!reportTitle || !reportSubject) && styles.submitBtnDisabled]}
                disabled={!reportTitle || !reportSubject}
                onPress={() => {
                  const newReport: ReportItem = {
                    id: String(Date.now()),
                    title: reportTitle,
                    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
                    icon: '📋',
                  };
                  setReportList((prev) => [newReport, ...prev]);
                  setReportTitle('');
                  setReportSubject('');
                  setShowForm(false);
                }}
              >
                <Text style={styles.submitBtnText}>{t('teacher.reports.submit', 'Add')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Uploaded Reports list */}
          <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>
            {t('teacher.reports.uploaded', 'Uploaded Reports')}
          </Text>

          {reportList.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={[styles.reportRow, isRTL && styles.rowReverse]}>
                <View style={styles.reportIcon}>
                  <Text style={{ fontSize: 22 }}>{report.icon}</Text>
                </View>
                <View style={styles.reportInfo}>
                  <Text style={[styles.reportTitle, isRTL && styles.textRight]}>{report.title}</Text>
                  <Text style={[styles.reportDate, isRTL && styles.textRight]}>{report.date}</Text>
                </View>
                <TouchableOpacity style={styles.downloadBtn}>
                  <Text style={styles.downloadText}>↓</Text>
                </TouchableOpacity>
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

  header: { backgroundColor: '#BA6DE9', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 18, color: '#fff' },
  headerTitle: { fontFamily: 'Lexend_700Bold', fontSize: 22, color: '#fff' },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99 },
  addBtnText: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#fff' },

  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 20, shadowColor: '#BA6DE9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  label: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 8, marginTop: 12 },
  inputPurple: { backgroundColor: '#F5F3FF', borderWidth: 1.5, borderColor: '#DDD6FE', borderRadius: 14, padding: 12, fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#1a1a2e', height: 52 },
  inputPurpleMulti: { backgroundColor: '#F5F3FF', borderWidth: 1.5, borderColor: '#DDD6FE', borderRadius: 14, padding: 12, fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#1a1a2e', minHeight: 100 },
  uploadBox: { marginTop: 16, borderWidth: 2, borderColor: '#DDD6FE', borderStyle: 'dashed', borderRadius: 14, padding: 16, alignItems: 'center', gap: 6, backgroundColor: '#FAF5FF' },
  uploadIcon: { fontSize: 24 },
  uploadText: { fontFamily: 'Lexend_500Medium', fontSize: 13, color: '#BA6DE9' },
  submitBtn: { marginTop: 16, backgroundColor: '#BA6DE9', borderRadius: 14, padding: 14, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#DDD6FE' },
  submitBtnText: { fontFamily: 'Lexend_700Bold', fontSize: 15, color: '#fff' },

  sectionTitle: { fontFamily: 'Lexend_700Bold', fontSize: 15, color: '#1a1a2e', marginBottom: 10 },
  reportCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reportIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  reportInfo: { flex: 1 },
  reportTitle: { fontFamily: 'Lexend_600SemiBold', fontSize: 14, color: '#1a1a2e' },
  reportDate: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  downloadBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  downloadText: { fontSize: 16, color: '#BA6DE9' },
});
