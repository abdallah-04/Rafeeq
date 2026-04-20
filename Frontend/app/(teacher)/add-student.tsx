import React, { useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Image,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Text } from '@/components/RNText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';

const MALE_PING   = require('@/assets/images/mascot/rafeeq_like.png');
const FEMALE_PING = require('@/assets/images/mascot/rafeeqa.png');

const CONDITIONS: { key: string; default: string }[] = [
  { key: 'ADD',         default: 'ADD' },
  { key: 'ADHD',        default: 'ADHD' },
  { key: 'IFD',         default: 'IFD' },
  { key: 'Autism',      default: 'Autism' },
  { key: 'DownSyndrome',default: 'Down Syndrome' },
  { key: 'OTHER',       default: 'Other' },
];

export default function AddStudentScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [dob, setDob] = useState('');
  const [condition, setCondition] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isValid = fullName && nationalId && dob && condition && gender;

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
            {t('teacher.addStudent.fullName', "Child's Full Name")}
          </Text>
          <TextInput
            style={[styles.input, isRTL && styles.textRight]}
            placeholder={t('teacher.addStudent.fullNamePlaceholder', 'Enter full name...')}
            placeholderTextColor="#93C5FD"
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
            placeholder="0000000000"
            placeholderTextColor="#93C5FD"
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
          <TouchableOpacity style={[styles.dateInput, isRTL && styles.rowReverse]}>
            <TextInput
              style={[styles.dateInputText, isRTL && styles.textRight]}
              placeholder="MM/DD/YYYY"
              placeholderTextColor="#93C5FD"
              value={dob}
              onChangeText={setDob}
              keyboardType="numeric"
              textAlign={isRTL ? 'right' : 'left'}
            />
            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>

          {/* Condition dropdown */}
          <Text style={[styles.label, isRTL && styles.textRight]}>
            {t('teacher.addStudent.condition', "Child's Difficulty")}
          </Text>
          <TouchableOpacity
            style={[styles.dropdown, isRTL && styles.rowReverse]}
            onPress={() => setDropdownOpen(!dropdownOpen)}
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
                  style={styles.dropdownItem}
                  onPress={() => { setCondition(c.key); setDropdownOpen(false); }}
                >
                  <Text style={[styles.dropdownItemText, condition === c.key && styles.dropdownItemActive]}>
                    {t(`difficulties.${c.key}`, c.default)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Gender — penguin cards */}
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
            style={[styles.continueBtn, !isValid && styles.continueBtnDisabled]}
            disabled={!isValid}
            onPress={() => router.replace('/(teacher)/students')}
          >
            <Text style={styles.continueBtnText}>
              {t('teacher.addStudent.continue', 'Continue')}
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

  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  navTitle: { fontFamily: 'Lexend_700Bold', fontSize: 17, color: '#1a1a2e' },

  label: { fontFamily: 'Lexend_600SemiBold', fontSize: 14, color: '#374151', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#BFDBFE', borderRadius: 16, padding: 14, fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#1a1a2e', height: 52 },
  dateInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#BFDBFE', borderRadius: 16, paddingHorizontal: 14, height: 52 },
  dateInputText: { flex: 1, fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#1a1a2e' },
  calendarIcon: { fontSize: 18 },

  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#BFDBFE', borderRadius: 16, paddingHorizontal: 14, height: 52 },
  dropdownText: { fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#1a1a2e' },
  dropdownPlaceholder: { color: '#93C5FD' },
  dropdownArrow: { fontSize: 12, color: '#93C5FD' },
  dropdownList: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#BFDBFE', borderRadius: 16, marginTop: 4, overflow: 'hidden' },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0' },
  dropdownItemText: { fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#374151' },
  dropdownItemActive: { color: '#508DF7', fontFamily: 'Lexend_600SemiBold' },

  genderRow: { flexDirection: 'row', gap: 12 },
  genderCard: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', gap: 8, borderWidth: 2, borderColor: '#E8EEFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  genderCardSelected: { borderColor: '#508DF7', backgroundColor: '#EEF4FF' },
  genderEmoji: { width: 60, height: 60, resizeMode: 'contain' },
  genderLabel: { fontFamily: 'Lexend_600SemiBold', fontSize: 14, color: '#9CA3AF' },
  genderLabelSelected: { color: '#508DF7' },

  continueBtn: { marginTop: 28, backgroundColor: '#508DF7', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#508DF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  continueBtnDisabled: { backgroundColor: '#93C5FD' },
  continueBtnText: { fontFamily: 'Lexend_700Bold', fontSize: 16, color: '#fff' },
});
