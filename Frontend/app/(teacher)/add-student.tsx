import React, { useMemo, useState } from 'react'
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
  Modal, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { colors, spacing, borderRadius } from '@/constants'
import { createAddStudentSchema, AddStudentForm } from '@/lib/schemas/studentSchema'
import { apiCreateStudent } from '@/services/api'
import { useModal } from '@/components/modal/ModalProvider'

type Gender = 'female' | 'male'

const DIFFICULTIES = ['ADD', 'ADHD', 'IFD', 'Autism', 'Down Syndrome', 'Other']

// ─── Date Picker Modal ────────────────────────────────────────
function DatePickerModal({
  visible, value, onConfirm, onClose,
}: { visible: boolean; value: string; onConfirm: (date: string) => void; onClose: () => void }) {
  const [input, setInput] = useState(value)
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.card}>
          <Text style={modalStyles.title}>Select Date of Birth</Text>
          <TextInput
            style={modalStyles.input}
            placeholder="MM/DD/YYYY"
            placeholderTextColor={colors.inputPlaceholder}
            value={input}
            onChangeText={setInput}
            keyboardType="numeric"
            maxLength={10}
          />
          <View style={modalStyles.btnRow}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
              <Text style={modalStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.confirmBtn} onPress={() => { onConfirm(input); onClose() }}>
              <Text style={modalStyles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const modalStyles = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  card:       { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 },
  title:      { fontSize: 16, fontFamily: 'Lexend_700Bold', color: '#1a1a2e', textAlign: 'center' },
  input:      { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, fontFamily: 'Lexend_400Regular', color: '#1a1a2e' },
  btnRow:     { flexDirection: 'row', gap: 12 },
  cancelBtn:  { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center' },
  cancelText: { fontFamily: 'Lexend_600SemiBold', color: '#6B7280' },
  confirmBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center' },
  confirmText:{ fontFamily: 'Lexend_600SemiBold', color: '#fff' },
})

/* ── Difficulty Dropdown ── */
function DifficultyDropdown({ value, onChange, error, t }: {
  value: string; onChange: (v: string) => void; error: boolean; t: any
}) {
  const [open, setOpen] = useState(false)
  return (
    <View>
      <TouchableOpacity
        style={[styles.dropdown, error && styles.inputError]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
          {value ?? t('addStudent.difficultyPlaceholder')}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      {open && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.dropdownList}>
            {DIFFICULTIES.map(d => (
              <TouchableOpacity key={d} style={styles.dropdownItem} onPress={() => { onChange(d); setOpen(false) }}>
                <Text style={styles.dropdownItemText}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}
    </View>
  )
}

/* ── Gender Card ── */
function GenderCard({ gender, selected, onPress, t }: { gender: Gender; selected: boolean; onPress: () => void; t: any }) {
  const isFemale = gender === 'female'
  const accentColor = isFemale ? '#F472B6' : colors.primary
  const bgColor = isFemale ? '#FFF0F6' : colors.primaryLighter
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.genderCard, selected && { borderColor: accentColor, backgroundColor: bgColor }]}
      activeOpacity={0.8}
    >
      <Text style={styles.genderEmoji}>{isFemale ? '👧' : '👦'}</Text>
      <Text style={[styles.genderLabel, selected && { color: accentColor, fontFamily: 'Lexend_700Bold' }]}>
        {t(isFemale ? 'addStudent.female' : 'addStudent.male', isFemale ? 'Female' : 'Male')}
      </Text>
    </TouchableOpacity>
  )
}

/* ── Main Screen ── */
export default function AddStudentScreen() {
  const { t } = useTranslation()
  const { show } = useModal()
  const [loading,         setLoading]         = useState(false)
  const [showDatePicker,  setShowDatePicker]  = useState(false)
  const [gender,          setGender]          = useState<Gender | null>(null)
  const [genderError,     setGenderError]     = useState(false)

  const schema = useMemo(() => createAddStudentSchema(t), [t])
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<AddStudentForm>({ resolver: zodResolver(schema) })

  const dateOfBirth = watch('dateOfBirth')

  const parseDob = (raw: string): string => {
    const parts = raw.split('/')
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`
    }
    return raw
  }

  const onSubmit = async (data: AddStudentForm) => {
    if (!gender) { setGenderError(true); return }
    setLoading(true)
    try {
      await apiCreateStudent({
        fullNameAr: data.fullName,
        nationalId: data.nationalId.trim(),
        dateOfBirth: parseDob(data.dateOfBirth),
        learningDifficulty: data.difficulty,
        gender: gender.toUpperCase(),
        password: ''
      })
      show('success', { variant: 'greatJob' })
      setTimeout(() => router.back(), 1200)
    } catch (err: any) {
      show('error', { variant: 'invalidInfo' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.card}>
            {/* Full Name */}
            <Text style={styles.label}>{t('addStudent.fullName')}</Text>
            <Controller control={control} name="fullName" render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, errors.fullName && styles.inputError]} placeholder={t('addStudent.fullNamePlaceholder')} placeholderTextColor="#9CA3AF" value={value} onChangeText={onChange} />
            )} />
            {errors.fullName && <Text style={styles.error}>{errors.fullName.message}</Text>}

            {/* National ID */}
            <Text style={styles.label}>{t('addStudent.nationalId')}</Text>
            <Controller control={control} name="nationalId" render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, errors.nationalId && styles.inputError]} placeholder={t('addStudent.nationalIdPlaceholder')} placeholderTextColor="#9CA3AF" value={value} onChangeText={onChange} keyboardType="numeric" />
            )} />
            {errors.nationalId && <Text style={styles.error}>{errors.nationalId.message}</Text>}

            {/* Date of Birth */}
            <Text style={styles.label}>{t('addStudent.dateOfBirth')}</Text>
            <TouchableOpacity style={[styles.input, styles.dateInput, errors.dateOfBirth && styles.inputError]} onPress={() => setShowDatePicker(true)}>
              <Text style={{ color: dateOfBirth ? '#111827' : '#9CA3AF', fontFamily: 'Lexend_400Regular', fontSize: 14 }}>
                {dateOfBirth || t('addStudent.dateOfBirthPlaceholder')}
              </Text>
            </TouchableOpacity>
            {errors.dateOfBirth && <Text style={styles.error}>{errors.dateOfBirth.message}</Text>}

            {/* Difficulty */}
            <Text style={styles.label}>{t('addStudent.difficulty')}</Text>
            <Controller control={control} name="difficulty" render={({ field: { onChange, value } }) => (
              <DifficultyDropdown value={value} onChange={onChange} error={!!errors.difficulty} t={t} />
            )} />
            {errors.difficulty && <Text style={styles.error}>{errors.difficulty.message}</Text>}

            {/* Gender */}
            <Text style={styles.label}>{t('addStudent.gender')}</Text>
            <View style={styles.genderRow}>
              <GenderCard gender="female" selected={gender === 'female'} onPress={() => { setGender('female'); setGenderError(false) }} t={t} />
              <GenderCard gender="male"   selected={gender === 'male'}   onPress={() => { setGender('male');   setGenderError(false) }} t={t} />
            </View>
            {genderError && <Text style={styles.error}>Please select a gender</Text>}
          </View>

          <TouchableOpacity style={[styles.button, (loading || !gender) && styles.buttonDisabled]} onPress={handleSubmit(onSubmit)} disabled={loading || !gender}>
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>{t('addStudent.continue')}</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <DatePickerModal
        visible={showDatePicker}
        value={dateOfBirth ?? ''}
        onConfirm={(date) => setValue('dateOfBirth', date, { shouldValidate: true })}
        onClose={() => setShowDatePicker(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  card: { width: '100%', backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2, marginBottom: spacing.lg },
  label: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#1a1a2e', height: 52 },
  dateInput: { justifyContent: 'center' },
  inputError: { borderColor: colors.error },
  error: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: colors.error, marginTop: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, height: 52 },
  dateText: { fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#1a1a2e' },
  datePlaceholder: { color: colors.inputPlaceholder },
  calendarIcon: { fontSize: 18 },
  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, height: 52 },
  dropdownText: { fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#1a1a2e' },
  dropdownPlaceholder: { color: colors.inputPlaceholder },
  dropdownArrow: { fontSize: 12, color: '#9CA3AF' },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
  dropdownList: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, marginTop: 4, zIndex: 20 },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownItemText: { fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#374151' },
  genderSection: { marginBottom: spacing.lg },
  genderTitle: { fontFamily: 'Lexend_600SemiBold', fontSize: 14, color: '#374151', marginBottom: 12 },
  genderRow: { flexDirection: 'row', gap: 12 },
  genderCard: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', gap: 8 },
  genderEmoji: { fontSize: 40 },
  genderLabel: { fontFamily: 'Lexend_500Medium', fontSize: 14, color: '#6B7280' },
  button: { backgroundColor: colors.primary, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: spacing.xl },
  buttonDisabled: { backgroundColor: '#93C5FD' },
  buttonText: { fontFamily: 'Lexend_700Bold', fontSize: 16, color: colors.white },
})