import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import BackButton from '@/components/BackButton';
import { colors } from '@/constants';
import { createAddStudentSchema, AddStudentForm } from '@/lib/schemas/studentSchema';
import { apiCreateStudent } from '@/services/api';
import { useModal } from '@/components/modal/ModalProvider';

type Gender = 'female' | 'male';

const MALE_PING = require('@/assets/images/mascot/rafeeq_like.png');
const FEMALE_PING = require('@/assets/images/mascot/rafeeqa.png');

const CONDITIONS: Array<{ value: string; key: string; fallback: string }> = [
  { value: 'ADD', key: 'ADD', fallback: 'ADD' },
  { value: 'ADHD', key: 'ADHD', fallback: 'ADHD' },
  { value: 'IFD', key: 'IFD', fallback: 'IFD' },
  { value: 'Autism', key: 'Autism', fallback: 'Autism' },
  { value: 'Down Syndrome', key: 'DownSyndrome', fallback: 'Down Syndrome' },
  { value: 'Other', key: 'OTHER', fallback: 'Other' },
];

const parseDateValue = (raw: string) => {
  const [day, month, year] = raw.split('/');
  if (day && month && year?.length === 4) {
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
};

const formatDisplayDate = (date: Date) => (
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
);

function DatePickerModal({
  visible,
  value,
  onConfirm,
  onClose,
  t,
}: {
  visible: boolean;
  value: string;
  onConfirm: (date: string) => void;
  onClose: () => void;
  t: any;
}) {
  const [selectedDate, setSelectedDate] = useState(() => parseDateValue(value));

  useEffect(() => {
    if (visible) {
      setSelectedDate(parseDateValue(value));
    }
  }, [value, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.card}>
          <Text style={modalStyles.title}>{t('teacher.addStudent.selectDob', 'Select Date of Birth')}</Text>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
            maximumDate={new Date()}
            onChange={(_, date) => {
              if (date) {
                setSelectedDate(date);
              }
            }}
          />
          <Text style={modalStyles.input}>{formatDisplayDate(selectedDate)}</Text>
          <View style={modalStyles.btnRow}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
              <Text style={modalStyles.cancelText}>{t('common.cancel', 'Cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={modalStyles.confirmBtn}
              onPress={() => {
                onConfirm(formatDisplayDate(selectedDate));
                onClose();
              }}
            >
              <Text style={modalStyles.confirmText}>{t('common.confirm', 'Confirm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DifficultyDropdown({
  value,
  onChange,
  error,
  t,
  isRTL,
}: {
  value: string;
  onChange: (v: string) => void;
  error: boolean;
  t: any;
  isRTL: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = CONDITIONS.find((item) => item.value === value);

  return (
    <View>
      <TouchableOpacity
        style={[styles.dropdown, isRTL && styles.rowReverse, error && styles.inputError]}
        onPress={() => setOpen((current) => !current)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.dropdownText,
            !selected && styles.dropdownPlaceholder,
            isRTL && styles.textRight,
          ]}
        >
          {selected
            ? t(`difficulties.${selected.key}`, selected.fallback)
            : t('teacher.addStudent.conditionPlaceholder', 'Select difficulty...')}
        </Text>
        <Text style={styles.dropdownArrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {open && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.dropdownList}>
            {CONDITIONS.map((item, index) => (
              <TouchableOpacity
                key={item.value}
                style={[styles.dropdownItem, index === CONDITIONS.length - 1 && styles.dropdownItemLast]}
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
              >
                <Text style={[styles.dropdownItemText, value === item.value && styles.dropdownItemActive]}>
                  {t(`difficulties.${item.key}`, item.fallback)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

function GenderCard({
  gender,
  selected,
  onPress,
  t,
}: {
  gender: Gender;
  selected: boolean;
  onPress: () => void;
  t: any;
}) {
  const isFemale = gender === 'female';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.genderCard, selected && styles.genderCardSelected]}
      activeOpacity={0.8}
    >
      <Image source={isFemale ? FEMALE_PING : MALE_PING} style={styles.genderImage} />
      <Text style={[styles.genderLabel, selected && styles.genderLabelSelected]}>
        {t(
          isFemale ? 'teacher.addStudent.female' : 'teacher.addStudent.male',
          isFemale ? 'Female' : 'Male'
        )}
      </Text>
    </TouchableOpacity>
  );
}

export default function AddStudentScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { show } = useModal();
  const isRTL = i18n.language === 'ar';

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<Gender | null>(null);
  const [genderError, setGenderError] = useState(false);

  const schema = useMemo(() => createAddStudentSchema(t), [t]);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddStudentForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      nationalId: '',
      dateOfBirth: '',
      difficulty: '',
      gender: '',
    },
  });

  const dateOfBirth = watch('dateOfBirth');

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(teacher)/(tabs)/students');
  };

  const parseDob = (raw: string): string => {
    const parts = raw.split('/');
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return raw;
  };

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: parseDateValue(dateOfBirth ?? ''),
        mode: 'date',
        display: 'calendar',
        maximumDate: new Date(),
        onChange: (_, selectedDate) => {
          if (selectedDate) {
            setValue('dateOfBirth', formatDisplayDate(selectedDate), { shouldValidate: true });
          }
        },
      });
      return;
    }
    setShowDatePicker(true);
  };

  const onSubmit = async (data: AddStudentForm) => {
    if (!gender) {
      setGenderError(true);
      return;
    }

    setLoading(true);
    try {
      await apiCreateStudent({
        fullNameAr: data.fullName,
        nationalId: data.nationalId.trim(),
        dateOfBirth: parseDob(data.dateOfBirth),
        learningDifficulty: data.difficulty,
        gender: gender.toUpperCase(),
      });
      show('success', { variant: 'greatJob' });
      setTimeout(() => handleBack(), 1200);
    } catch {
      show('error', { variant: 'invalidInfo' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.navBar, isRTL && styles.rowReverse]}>
          <BackButton onPress={handleBack} />
          <Text style={styles.navTitle}>{t('teacher.addStudent.title', 'Add Student')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={[styles.label, isRTL && styles.textRight]}>
            {t('teacher.addStudent.fullName', "Child's Full Name")}
          </Text>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, isRTL && styles.textRight, errors.fullName && styles.inputError]}
                placeholder={t('teacher.addStudent.fullNamePlaceholder', 'Enter full name...')}
                placeholderTextColor="#93C5FD"
                value={value}
                onChangeText={onChange}
                textAlign={isRTL ? 'right' : 'left'}
              />
            )}
          />
          {errors.fullName && <Text style={[styles.error, isRTL && styles.textRight]}>{errors.fullName.message}</Text>}

          <Text style={[styles.label, isRTL && styles.textRight]}>
            {t('teacher.addStudent.nationalId', 'National ID')}
          </Text>
          <Controller
            control={control}
            name="nationalId"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, isRTL && styles.textRight, errors.nationalId && styles.inputError]}
                placeholder={t('teacher.addStudent.nationalIdPlaceholder', '0000000000')}
                placeholderTextColor="#93C5FD"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                maxLength={10}
                textAlign={isRTL ? 'right' : 'left'}
              />
            )}
          />
          {errors.nationalId && <Text style={[styles.error, isRTL && styles.textRight]}>{errors.nationalId.message}</Text>}

          <Text style={[styles.label, isRTL && styles.textRight]}>
            {t('teacher.addStudent.dob', 'Date of Birth')}
          </Text>
          <TouchableOpacity
            style={[styles.dateInput, isRTL && styles.rowReverse, errors.dateOfBirth && styles.inputError]}
            onPress={openDatePicker}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.dateInputText,
                !dateOfBirth && styles.datePlaceholder,
                isRTL && styles.textRight,
              ]}
            >
              {dateOfBirth || t('teacher.addStudent.dobPlaceholder', 'MM/DD/YYYY')}
            </Text>
            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>
          {errors.dateOfBirth && <Text style={[styles.error, isRTL && styles.textRight]}>{errors.dateOfBirth.message}</Text>}

          <Text style={[styles.label, isRTL && styles.textRight]}>
            {t('teacher.addStudent.condition', "Child's Difficulty")}
          </Text>
          <Controller
            control={control}
            name="difficulty"
            render={({ field: { onChange, value } }) => (
              <DifficultyDropdown value={value} onChange={onChange} error={!!errors.difficulty} t={t} isRTL={isRTL} />
            )}
          />
          {errors.difficulty && <Text style={[styles.error, isRTL && styles.textRight]}>{errors.difficulty.message}</Text>}

          <Text style={[styles.label, isRTL && styles.textRight]}>
            {t('teacher.addStudent.gender', 'Gender')}
          </Text>
          <View style={[styles.genderRow, isRTL && styles.rowReverse]}>
            <GenderCard
              gender="male"
              selected={gender === 'male'}
              onPress={() => {
                setGender('male');
                setGenderError(false);
                setValue('gender', 'male', { shouldValidate: true });
              }}
              t={t}
            />
            <GenderCard
              gender="female"
              selected={gender === 'female'}
              onPress={() => {
                setGender('female');
                setGenderError(false);
                setValue('gender', 'female', { shouldValidate: true });
              }}
              t={t}
            />
          </View>
          {genderError && (
            <Text style={[styles.error, isRTL && styles.textRight]}>
              {t('validation.selectGender', 'Please select a gender')}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.continueBtn, (loading || !gender) && styles.continueBtnDisabled]}
            disabled={loading || !gender}
            onPress={handleSubmit(onSubmit)}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.continueBtnText}>{t('teacher.addStudent.continue', 'Continue')}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <DatePickerModal
        visible={showDatePicker}
        value={dateOfBirth ?? ''}
        onConfirm={(date) => setValue('dateOfBirth', date, { shouldValidate: true })}
        onClose={() => setShowDatePicker(false)}
        t={t}
      />
    </SafeAreaView>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Lexend_700Bold',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Lexend_400Regular',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: 'Lexend_600SemiBold',
    color: '#6B7280',
  },
  confirmBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmText: {
    fontFamily: 'Lexend_600SemiBold',
    color: '#fff',
  },
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  navTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 17,
    color: '#1a1a2e',
  },
  label: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    padding: 14,
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#1a1a2e',
    height: 52,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
  },
  dateInputText: {
    flex: 1,
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#1a1a2e',
  },
  datePlaceholder: {
    color: '#93C5FD',
  },
  calendarIcon: {
    fontSize: 18,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
  },
  dropdownText: {
    flex: 1,
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#1a1a2e',
  },
  dropdownPlaceholder: {
    color: '#93C5FD',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#93C5FD',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#374151',
  },
  dropdownItemActive: {
    color: '#508DF7',
    fontFamily: 'Lexend_600SemiBold',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#E8EEFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  genderCardSelected: {
    borderColor: '#508DF7',
    backgroundColor: '#EEF4FF',
  },
  genderImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  genderLabel: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
    color: '#9CA3AF',
  },
  genderLabelSelected: {
    color: '#508DF7',
  },
  continueBtn: {
    marginTop: 28,
    backgroundColor: '#508DF7',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#508DF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  continueBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  continueBtnText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 16,
    color: '#fff',
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});
