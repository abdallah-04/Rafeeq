import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ReportsListSkeleton } from '@/components/LoadingSkeleton';
import BackButton from '@/components/BackButton';
import { apiGetReportsForTeacher, apiCreateReport, ReportResponse } from '@/services/api';
import { useModal } from '@/components/modal/ModalProvider';

export default function ReportsScreen() {
  const router = useRouter();
  const { show } = useModal();
  const { t, i18n } = useTranslation();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const isRTL = i18n.language === 'ar';

  const [reportList,    setReportList]    = useState<ReportResponse[]>([]);
  const [showForm,      setShowForm]      = useState(false);
  const [reportTitle,   setReportTitle]   = useState('');
  const [reportContent, setReportContent] = useState('');
  const [isLoading,     setIsLoading]     = useState(true);
  const [submitting,    setSubmitting]    = useState(false);

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
      const data = await apiGetReportsForTeacher(studentId);
      setReportList(data);
    } catch (err: any) {
      show('error', { variant: 'invalidInfo' });
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const handleAddReport = async () => {
    if (!reportTitle || !reportContent || !studentId) return;
    setSubmitting(true);
    try {
      const newReport = await apiCreateReport({
        childId: studentId,
        title:   reportTitle,
        content: reportContent,
      });
      setReportList((prev) => [newReport, ...prev]);
      setReportTitle('');
      setReportContent('');
      setShowForm(false);
    } catch (err: any) {
      show('error', { variant: 'invalidInfo' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(isRTL ? 'ar-JO' : 'en-GB', { day: '2-digit', month: '2-digit' });
    } catch {
      return iso;
    }
  };

  if (isLoading) return <ReportsListSkeleton count={3} />;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Purple header */}
      <View style={styles.header}>
        <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
          <BackButton onPress={handleBack} />
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
                {t('teacher.reports.reportSubject', 'Report Content')}
              </Text>
              <TextInput
                style={[styles.inputPurpleMulti, isRTL && styles.textRight]}
                placeholder={t('teacher.reports.details', 'Details...')}
                placeholderTextColor="#C4B5FD"
                value={reportContent}
                onChangeText={setReportContent}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                textAlign={isRTL ? 'right' : 'left'}
              />

              <TouchableOpacity
                style={[styles.submitBtn, (!reportTitle || !reportContent || submitting) && styles.submitBtnDisabled]}
                disabled={!reportTitle || !reportContent || submitting}
                onPress={handleAddReport}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? '...' : t('teacher.reports.submit', 'Add')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>
            {t('teacher.reports.uploaded', 'Uploaded Reports')}
          </Text>

          {reportList.length === 0 ? (
            <Text style={[styles.emptyText, isRTL && styles.textRight]}>
              {t('teacher.reports.empty', 'No reports yet')}
            </Text>
          ) : reportList.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={[styles.reportRow, isRTL && styles.rowReverse]}>
                <View style={styles.reportIcon}>
                  <Text style={{ fontSize: 22 }}>📋</Text>
                </View>
                <View style={styles.reportInfo}>
                  <Text style={[styles.reportTitle, isRTL && styles.textRight]}>{report.title}</Text>
                  <Text style={[styles.reportDate, isRTL && styles.textRight]}>{formatDate(report.createdAt)}</Text>
                  {report.content ? (
                    <Text style={[styles.reportContent, isRTL && styles.textRight]} numberOfLines={2}>
                      {report.content}
                    </Text>
                  ) : null}
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
  emptyText: { color: '#9CA3AF', fontFamily: 'Lexend_400Regular', fontSize: 14, textAlign: 'center', marginTop: 24 },

  header: { backgroundColor: '#BA6DE9', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16 },
  headerTitle: { fontFamily: 'Lexend_700Bold', fontSize: 22, color: '#fff' },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99 },
  addBtnText: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#fff' },

  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 20, shadowColor: '#BA6DE9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  label: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 8, marginTop: 12 },
  inputPurple: { backgroundColor: '#F5F3FF', borderWidth: 1.5, borderColor: '#DDD6FE', borderRadius: 14, padding: 12, fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#1a1a2e', height: 52 },
  inputPurpleMulti: { backgroundColor: '#F5F3FF', borderWidth: 1.5, borderColor: '#DDD6FE', borderRadius: 14, padding: 12, fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#1a1a2e', minHeight: 100 },
  submitBtn: { marginTop: 16, backgroundColor: '#BA6DE9', borderRadius: 14, padding: 14, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#DDD6FE' },
  submitBtnText: { fontFamily: 'Lexend_700Bold', fontSize: 15, color: '#fff' },

  sectionTitle: { fontFamily: 'Lexend_700Bold', fontSize: 15, color: '#1a1a2e', marginBottom: 10 },
  reportCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  reportRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  reportIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  reportInfo: { flex: 1 },
  reportTitle: { fontFamily: 'Lexend_600SemiBold', fontSize: 14, color: '#1a1a2e' },
  reportDate: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  reportContent: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 18 },
});
