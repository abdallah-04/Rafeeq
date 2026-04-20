import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Text } from '@/components/RNText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';

export default function AddNoteScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const isRTL = i18n.language === 'ar';

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');

  const handleAdd = () => {
    // TODO: connect to service/store
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Nav */}
        <View style={[styles.navBar, isRTL && styles.rowReverse]}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.navTitle}>{t('teacher.addNote.title', 'Add Note')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Note Title input — pink tinted */}
          <Text style={[styles.label, isRTL && styles.textRight]}>
            {t('teacher.addNote.noteTitle', 'Note Title')}
          </Text>
          <TextInput
            style={[styles.inputPink, isRTL && styles.textRight]}
            placeholder={t('teacher.addNote.noteTitlePlaceholder', 'Enter note title...')}
            placeholderTextColor="#F9A8D4"
            value={title}
            onChangeText={setTitle}
            textAlign={isRTL ? 'right' : 'left'}
          />

          {/* Note Subject — blue tinted multiline */}
          <Text style={[styles.label, isRTL && styles.textRight]}>
            {t('teacher.addNote.noteSubject', 'Note Subject')}
          </Text>
          <TextInput
            style={[styles.inputBlue, isRTL && styles.textRight]}
            placeholder={t('teacher.addNote.details', 'Details...')}
            placeholderTextColor="#93C5FD"
            value={subject}
            onChangeText={setSubject}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            textAlign={isRTL ? 'right' : 'left'}
          />

          {/* Upload area */}
          <TouchableOpacity style={styles.uploadBox}>
            <Text style={styles.uploadIcon}>📎</Text>
            <Text style={styles.uploadText}>
              {t('teacher.addNote.tapToUpload', 'Tap to upload')}
            </Text>
          </TouchableOpacity>

          {/* Add button */}
          <TouchableOpacity
            style={[styles.addBtn, (!title || !subject) && styles.addBtnDisabled]}
            onPress={handleAdd}
            disabled={!title || !subject}
          >
            <Text style={styles.addBtnText}>{t('teacher.addNote.add', 'Add')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },

  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  navTitle: { fontFamily: 'Lexend_700Bold', fontSize: 17, color: '#1a1a2e' },

  label: { fontFamily: 'Lexend_600SemiBold', fontSize: 14, color: '#374151', marginBottom: 8, marginTop: 16 },

  inputPink: {
    backgroundColor: '#FFF0F6',
    borderWidth: 1.5,
    borderColor: '#FBCFE8',
    borderRadius: 16,
    padding: 14,
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#1a1a2e',
    height: 52,
  },
  inputBlue: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    padding: 14,
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#1a1a2e',
    minHeight: 120,
  },

  uploadBox: {
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#C8D9FB',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFF',
  },
  uploadIcon: { fontSize: 28 },
  uploadText: { fontFamily: 'Lexend_500Medium', fontSize: 14, color: '#508DF7' },

  addBtn: { marginTop: 24, backgroundColor: '#508DF7', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#508DF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  addBtnDisabled: { backgroundColor: '#93C5FD' },
  addBtnText: { fontFamily: 'Lexend_700Bold', fontSize: 16, color: '#fff' },
});
