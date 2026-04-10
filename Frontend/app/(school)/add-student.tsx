import React, { useState } from 'react'
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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { colors, spacing, borderRadius } from '@/constants'

// ─── Schema ───────────────────────────────────────────────────
const addStudentSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Full name must be at least 3 characters')
    .max(60, 'Full name is too long'),
  nationalId: z
    .string()
    .length(10, 'National ID must be exactly 10 digits')
    .regex(/^\d+$/, 'National ID must contain only numbers'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Format must be MM/DD/YYYY'),
  difficulty: z.string().min(1, 'Please select a difficulty'),
})

type AddStudentForm = z.infer<typeof addStudentSchema>
type Gender = 'female' | 'male'

const DIFFICULTIES = ['ADD', 'ADHD', 'IFD', 'Autism', 'Down Syndrome', 'Other']

// ─── Date Picker Modal ────────────────────────────────────────
function DatePickerModal({
  visible,
  value,
  onConfirm,
  onClose,
}: {
  visible: boolean
  value: string
  onConfirm: (date: string) => void
  onClose: () => void
}) {
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
            <TouchableOpacity
              style={modalStyles.confirmBtn}
              onPress={() => { onConfirm(input); onClose() }}
            >
              <Text style={modalStyles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

/* ── Gender Card ── */
function GenderCard({ gender, selected, onPress, t }: {
  gender: Gender; selected: boolean; onPress: () => void; t: any
}) {
  const isFemale = gender === 'female'
  const accentColor = isFemale ? '#F472B6' : colors.primary
  const bgColor = isFemale ? '#FFF0F6' : colors.primaryLighter

  return (
    <TouchableOpacity
      style={[styles.genderCard, selected && { borderColor: accentColor, backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.genderEmoji}>🐧</Text>
      <Text style={[styles.genderLabel, selected && { color: accentColor }]}>
        {t(`addStudent.${gender}`)}
      </Text>
      {selected && (
        <View style={[styles.genderCheck, { backgroundColor: accentColor }]}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

/* ── Difficulty Dropdown ── */
function DifficultyDropdown({ value, onChange, error, t }: {
  value: string | undefined; onChange: (v: string) => void; error: boolean; t: any
}) {
  const [open, setOpen] = useState(false)

  return (
    <View>
      <TouchableOpacity
        style={[styles.dropdownBtn, error && styles.inputError]}
        onPress={() => setOpen(true)}
      >
        <Text style={value ? styles.dropdownText : styles.dropdownPlaceholder}>
          {value ?? t('addStudent.difficultyPlaceholder')}
        </Text>
        <Text style={styles.dropdownArrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.dropdownList}>
            {DIFFICULTIES.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.dropdownItem, value === d && styles.dropdownItemActive]}
                onPress={() => { onChange(d); setOpen(false) }}
              >
                <Text style={[styles.dropdownItemText, value === d && styles.dropdownItemTextActive]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

/* ── Main Screen ── */
export default function AddStudentScreen() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [gender, setGender] = useState<Gender | null>(null)
  const [genderError, setGenderError] = useState(false)

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<AddStudentForm>({
    resolver: zodResolver(addStudentSchema),
  })

  const dateOfBirth = watch('dateOfBirth')

  const onSubmit = async (data: AddStudentForm) => {
    if (!gender) {
      setGenderError(true)
      return
    }
    try {
      setLoading(true)
      await new Promise(res => setTimeout(res, 1000))
      console.log('New student:', { ...data, gender })
      router.back()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Form card ── */}
          <View style={styles.card}>

            {/* Child's Full Name */}
            <Text style={styles.label}>{t('addStudent.fullName')}</Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.fullName && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t('addStudent.fullNamePlaceholder')}
                  placeholderTextColor={colors.inputPlaceholder}
                />
              )}
            />
            {errors.fullName && <Text style={styles.error}>{errors.fullName.message}</Text>}

            {/* National ID */}
            <Text style={styles.label}>{t('addStudent.nationalId')}</Text>
            <Controller
              control={control}
              name="nationalId"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.nationalId && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  placeholder="0000000000"
                  placeholderTextColor={colors.inputPlaceholder}
                  keyboardType="numeric"
                  maxLength={10}
                />
              )}
            />
            {errors.nationalId && <Text style={styles.error}>{errors.nationalId.message}</Text>}

            {/* Date of Birth */}
            <Text style={styles.label}>{t('addStudent.dateOfBirth')}</Text>
            <TouchableOpacity
              style={[styles.dateRow, errors.dateOfBirth && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
              accessibilityRole="button"
              accessibilityLabel="Select date of birth"
            >
              <Text style={[styles.dateText, !dateOfBirth && styles.datePlaceholder]}>
                {dateOfBirth || 'MM/DD/YYYY'}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
            {errors.dateOfBirth && <Text style={styles.error}>{errors.dateOfBirth.message}</Text>}

            {/* Child's Difficulty */}
            <Text style={styles.label}>{t('addStudent.difficulty')}</Text>
            <Controller
              control={control}
              name="difficulty"
              render={({ field: { onChange, value } }) => (
                <DifficultyDropdown
                  value={value}
                  onChange={onChange}
                  error={!!errors.difficulty}
                  t={t}
                />
              )}
            />
            {errors.difficulty && <Text style={styles.error}>{errors.difficulty.message}</Text>}
          </View>

          {/* ── Gender section ── */}
          <View style={styles.genderSection}>
            <Text style={styles.genderTitle}>{t('addStudent.gender')}</Text>
            <View style={styles.genderRow}>
              <GenderCard
                gender="female"
                selected={gender === 'female'}
                onPress={() => { setGender('female'); setGenderError(false) }}
                t={t}
              />
              <GenderCard
                gender="male"
                selected={gender === 'male'}
                onPress={() => { setGender('male'); setGenderError(false) }}
                t={t}
              />
            </View>
            {genderError && <Text style={styles.error}>Please select a gender</Text>}
          </View>

          {/* ── Continue button ── */}
          <TouchableOpacity
            style={[styles.button, (loading || !gender) && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading || !gender}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>{t('addStudent.continue')}</Text>
            )}
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

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: spacing.xl,
  },
  label: {
    fontFamily: 'Lexend-SemiBold',
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    height: 52,
    paddingHorizontal: spacing.md,
    fontFamily: 'Lexend-Regular',
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
    fontFamily: 'Lexend-Regular',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    height: 52,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dateText: {
    fontFamily: 'Lexend-Regular',
    fontSize: 14,
    color: colors.textPrimary,
  },
  datePlaceholder: {
    color: colors.inputPlaceholder,
  },
  calendarIcon: {
    fontSize: 18,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    height: 52,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dropdownText: {
    fontFamily: 'Lexend-Regular',
    fontSize: 14,
    color: colors.textPrimary,
  },
  dropdownPlaceholder: {
    color: colors.inputPlaceholder,
  },
  dropdownArrow: {
    fontSize: 11,
    color: colors.inputPlaceholder,
  },
  dropdownList: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    width: 280,
  },
  dropdownItem: {
    paddingVertical: 13,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  dropdownItemActive: {
    backgroundColor: colors.primaryLighter,
  },
  dropdownItemText: {
    fontFamily: 'Lexend-Regular',
    fontSize: 14,
    color: colors.textPrimary,
  },
  dropdownItemTextActive: {
    fontFamily: 'Lexend-SemiBold',
    color: colors.primary,
  },
  genderSection: {
    marginBottom: spacing.xl,
  },
  genderTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  genderCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    minHeight: 140,
    justifyContent: 'center',
  },
  genderCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    fontSize: 12,
    color: colors.white,
    fontFamily: 'Lexend-Bold',
  },
  genderEmoji: {
    fontSize: 52,
  },
  genderLabel: {
    fontFamily: 'Lexend-SemiBold',
    fontSize: 15,
    color: colors.textSecondary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    color: colors.white,
  },
})

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 300,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    height: 48,
    paddingHorizontal: spacing.md,
    fontFamily: 'Lexend-Regular',
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: colors.border,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: 'Lexend-SemiBold',
    fontSize: 14,
    color: colors.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 14,
    color: colors.white,
  },
})
