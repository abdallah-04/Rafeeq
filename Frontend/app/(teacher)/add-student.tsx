import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Image,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';
import { apiCreateStudent } from '@/services/api';

const MALE_PING   = require('@/assets/images/mascot/rafeeq_like.png');
const FEMALE_PING = require('@/assets/images/mascot/rafeeqa.png');

const CONDITIONS: { key: string; default: string }[] = [
  { key: 'ADD',          default: 'ADD' },
  { key: 'ADHD',         default: 'ADHD' },
  { key: 'IFD',          default: 'IFD' },
  { key: 'Autism',       default: 'Autism' },
  { key: 'DownSyndrome', default: 'Down Syndrome' },
  { key: 'OTHER',        default: 'Other' },
];

export default function AddStudentScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [fullName,     setFullName]     = useState('');
  const [nationalId,   setNationalId]   = useState('');
  const [dob,          setDob]          = useState('');
  const [condition,    setCondition]    = useState('');
  const [gender,       setGender]       = useState<'male' | 'female' | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading,      setLoading]      = useState(false);

  const isValid = fullName && nationalId && dob && condition && gender;

  const parseDob = (raw: string): string => {
    // Accept MM/DD/YYYY or DD/MM/YYYY → YYYY-MM-DD
    const parts = raw.split('/');
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
    return raw; // already ISO or unrecognized — let backend validate
  };

  const handleContinue = async () => {
    if (!isValid || !gender) return;
    setLoading(true);
    try {
      await apiCreateStudent({
        fullNameAr: fullName,
        nationalId: nationalId.trim(),
        dateOfBirth: parseDob(dob),
        learningDifficulty: condition,
        gender: gender.toUpperCase(),
        password: ''
      });
      router.replace('/(teacher)/students' as any);
    } catch (err: any) {
      Alert.alert(t('common.error', 'Error'), err?.message ?? t('addStudent.failed', 'Failed to add student'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Nav */}
        <View style={[styles.navBar, isRTL && styles.rowReverse]}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.navTitle}>{t('teacher.addStudent.title', 'Add Student')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Full Name */}
          <Text style={[styles.label, isRTL && styles.textRight]}>
            {t('teacher.addStudent.fullName', 'Full Name')}
          </Text>
          <TextInput
            style={[styles.input, isRTL && styles.textRight]}
            placeholder={t('teacher.addStudent.fullNamePlaceholder', "Student's full name")}
            placeholderTextColor="#9CA3AF"
            value={fullName}
            onChangeText={setFullName}
            textAlign={isRTL ? 'right' : 'left'}
          />

          {/* National ID */}
          <Text style={[styles.label, isRTL && styles.textRight]}>
            {t('teacher.addStudent.nationalId', 'National ID')}
          </Text>
          <TextInput
            style={[styles.input, isRTL && styles.textRight]}
            placeholder={t('teacher.addStudent.nationalIdPlaceholder', '10-digit National ID')}
            placeholderTextColor="#9CA3AF"
            value={nationalId}
            onChangeText={setNationalId}
            keyboardType="numeric"
            maxLength={10}
            textAlign={isRTL ? 'right' : 'left'}
          />

          {/* Date of Birth */}
          <Text style={[styles.label, isRTL && styles.textRight]}>
            {t('teacher.addStudent.dob', 'Date of Birth')}
          </Text>
          <TextInput
            style={[styles.input, isRTL && styles.textRight]}
            placeholder="MM/DD/YYYY"
            placeholderTextColor="#9CA3AF"
            value={dob}
            onChangeText={setDob}
            keyboardType="numeric"
            textAlign={isRTL ? 'right' : 'left'}
          />

          {/* Difficulty Dropdown */}
          <Text style={[styles.label, isRTL && styles.textRight]}>
            {t('teacher.addStudent.condition', "Child's Difficulty")}
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setDropdownOpen(!dropdownOpen)}
            activeOpacity={0.8}
          >
            <Text style={[styles.dropdownText, !condition && styles.dropdownPlaceholder]}>
              {condition
                ? t(`difficulties.${condition}`, condition)
                : t('teacher.addStudent.conditionPlaceholder', 'Select difficulty...')}
            </Text>
            <Text style={styles.dropdownArrow}>{dropdownOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={styles.dropdownList}>
              {CONDITIONS.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.dropdownItem, condition === c.key && styles.dropdownItemActive]}
                  onPress={() => { setCondition(c.key); setDropdownOpen(false); }}
                >
                  <Text style={[styles.dropdownItemText, condition === c.key && styles.dropdownItemActiveText]}>
                    {t(`difficulties.${c.key}`, c.default)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Gender */}
          <Text style={[styles.label, isRTL && styles.textRight]}>
            {t('teacher.addStudent.gender', 'Gender')}
          </Text>
          <View style={[styles.genderRow, isRTL && styles.rowReverse]}>
            {(['male', 'female'] as const).map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderCard, gender === g && styles.genderCardSelected]}
                onPress={() => setGender(g)}
                activeOpacity={0.8}
              >
                <Image source={g === 'male' ? MALE_PING : FEMALE_PING} style={styles.genderEmoji} />
                <Text style={[styles.genderLabel, gender === g && styles.genderLabelSelected]}>
                  {t(`teacher.addStudent.${g}`, g === 'male' ? 'Male' : 'Female')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Continue button */}
          <TouchableOpacity
            style={[styles.continueBtn, (!isValid || loading) && styles.continueBtnDisabled]}
            disabled={!isValid || loading}
            onPress={handleContinue}
          >
            <Text style={styles.continueBtnText}>
              {loading
                ? t('common.loading', 'Please wait...')
                : t('teacher.addStudent.continue', 'Continue')}
            </Text>
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

  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  navTitle: { fontFamily: 'Lexend_700Bold', fontSize: 20, color: '#1a1a2e' },

  label: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14, padding: 14, fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#1a1a2e', height: 52 },

  dropdown: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14, padding: 14, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropdownText: { fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#1a1a2e' },
  dropdownPlaceholder: { color: '#9CA3AF' },
  dropdownArrow: { fontSize: 12, color: '#9CA3AF' },
  dropdownList: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14, marginTop: 4, overflow: 'hidden' },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownItemActive: { backgroundColor: '#EEF2FF' },
  dropdownItemText: { fontFamily: 'Lexend_500Medium', fontSize: 14, color: '#374151' },
  dropdownItemActiveText: { color: '#508DF7', fontFamily: 'Lexend_600SemiBold' },

  genderRow: { flexDirection: 'row', gap: 12 },
  genderCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', gap: 8 },
  genderCardSelected: { borderColor: '#508DF7', backgroundColor: '#EEF2FF' },
  genderEmoji: { width: 56, height: 56 },
  genderLabel: { fontFamily: 'Lexend_500Medium', fontSize: 13, color: '#6B7280' },
  genderLabelSelected: { color: '#508DF7', fontFamily: 'Lexend_700Bold' },

  continueBtn: { marginTop: 28, backgroundColor: '#508DF7', borderRadius: 16, padding: 16, alignItems: 'center' },
  continueBtnDisabled: { backgroundColor: '#93C5FD' },
  continueBtnText: { fontFamily: 'Lexend_700Bold', fontSize: 16, color: '#fff' },
});
