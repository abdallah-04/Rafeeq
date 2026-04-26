import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { Text } from '@/components/modal/shared/Text'

import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

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

  const formatApiDate = (date: Date) => (
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  );

  const formatDisplayDate = (value: string) => {
    const [year, month, day] = value.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    return value;
  };

  const parseDateValue = (value: string) => {
    const [year, month, day] = value.split('-');
    if (year && month && day) {
      const parsed = new Date(Number(year), Number(month) - 1, Number(day));
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return new Date();
  };

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
  }, [studentId, show]);

  useEffect(() => { load(); }, [load]);

  const openDatePicker = () => {
    const currentDate = parseDateValue(dueDate);
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: currentDate,
        mode: 'date',
        display: 'calendar',
        minimumDate: new Date(),
        onChange: (_, selectedDate) => {
          if (selectedDate) {
            setDueDate(formatApiDate(selectedDate));
          }
        },
      });
      return;
    }
    setPickerDate(currentDate);
    setShowDatePicker(true);
  };

  const handleAddHomework = async () => {
    if (!notes || !dueDate || !studentId || !title) return;
    setSubmitting(true);
    try {
      const newHw = await apiCreateHomework({
        childId:     studentId,
        title,
        description: notes,
        dueDate,
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
          <BackButton onPress={handleBack} />
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
              <TouchableOpacity
                style={[styles.inputDate, styles.dateField]}
                onPress={openDatePicker}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dateFieldText,
                    !dueDate && styles.dateFieldPlaceholder,
                    isRTL && styles.textRight,
                  ]}
                >
                  {dueDate ? formatDisplayDate(dueDate) : 'DD/MM/YYYY'}
                </Text>
              </TouchableOpacity>

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

      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerCard}>
            <DateTimePicker
              value={pickerDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              minimumDate={new Date()}
              onChange={(_, selectedDate) => {
                if (selectedDate) {
                  setPickerDate(selectedDate);
                }
              }}
            />
            <View style={styles.datePickerActions}>
              <TouchableOpacity style={styles.datePickerCancel} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.datePickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.datePickerConfirm}
                onPress={() => {
                  setDueDate(formatApiDate(pickerDate));
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.datePickerConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  dateField: { justifyContent: 'center' },
  dateFieldText: { fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#1a1a2e' },
  dateFieldPlaceholder: { color: '#93C5FD' },
  submitBtn: { marginTop: 16, backgroundColor: '#508DF7', borderRadius: 14, padding: 14, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#93C5FD' },
  submitBtnText: { fontFamily: 'Lexend_700Bold', fontSize: 15, color: '#fff' },
  datePickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  datePickerCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 12 },
  datePickerActions: { flexDirection: 'row', gap: 12 },
  datePickerCancel: { flex: 1, alignItems: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: '#BFDBFE', padding: 14 },
  datePickerCancelText: { fontFamily: 'Lexend_600SemiBold', color: '#6B7280' },
  datePickerConfirm: { flex: 1, alignItems: 'center', borderRadius: 12, backgroundColor: '#508DF7', padding: 14 },
  datePickerConfirmText: { fontFamily: 'Lexend_600SemiBold', color: '#fff' },

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
