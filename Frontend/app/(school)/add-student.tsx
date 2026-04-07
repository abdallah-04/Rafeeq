import React, { useState } from 'react'
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { addStudentSchema, AddStudentForm } from '@/lib/schemas/studentSchema'
import { Text } from '@/components/modal/shared/Text'
import { Button } from '@/components/modal/shared/Button'
import Card from '@/components/modal/shared/Card'
import Header from '@/components/modal/shared/Header'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import { theme } from '@/theme'
import { StatusBar } from 'expo-status-bar'

const { colors, spacing, typography, radius } = theme

type Difficulty = 'ADD' | 'ADHD' | 'IFD'
type Gender = 'male' | 'female'

const DIFFICULTIES: Difficulty[] = ['ADD', 'ADHD', 'IFD']

/* ── Gender Card ── */
function GenderCard({ gender, selected, onPress, t }: {
  gender: Gender; selected: boolean; onPress: () => void; t: any
}) {
  const isFemale = gender === 'female'
  const accentColor = isFemale ? '#F472B6' : colors.primary
  const bgColor     = isFemale ? '#FFF0F6' : colors.primaryLighter

  return (
    <TouchableOpacity
      style={[styles.genderCard, selected && { borderColor: accentColor, backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.genderCircle, { backgroundColor: selected ? bgColor : colors.surfaceElevated }]}>
        <Text style={styles.genderEmoji}>🐧</Text>
        <View style={[styles.genderDot, { backgroundColor: accentColor }]} />
      </View>
      <Text
        variant="label"
        style={[styles.genderLabel, selected && { color: accentColor, fontFamily: typography.fontFamily.bold }]}
      >
        {t(`addStudent.${gender}`)}
      </Text>
      {selected && (
        <View style={[styles.checkBadge, { backgroundColor: accentColor }]}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

/* ── Difficulty Dropdown ── */
function DifficultyDropdown({ value, onChange, error, t }: {
  value: Difficulty | undefined; onChange: (v: Difficulty) => void; error: boolean; t: any
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <TouchableOpacity
        style={[styles.dropdown, error && styles.inputError]}
        onPress={() => setOpen(true)}
      >
        <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {value ?? t('addStudent.difficultyPlaceholder')}
        </Text>
        <Text style={styles.dropdownArrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.dropdownMenu}>
            {DIFFICULTIES.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.dropdownItem, value === d && styles.dropdownItemSelected]}
                onPress={() => { onChange(d); setOpen(false) }}
              >
                <Text style={[styles.dropdownItemText, value === d && styles.dropdownItemTextSelected]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  )
}

/* ── Main Screen ── */
export default function AddStudentScreen() {
  const { t } = useTranslation()
  const [loading, setLoading]               = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate]     = useState<Date>(new Date())

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<AddStudentForm>({
    resolver: zodResolver(addStudentSchema),
  })

  const selectedGender = watch('gender')

  const onDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios')
    if (date) {
      setSelectedDate(date)
      setValue('dateOfBirth', date.toISOString().split('T')[0], { shouldValidate: true })
    }
  }

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const onSubmit = async (data: AddStudentForm) => {
    try {
      setLoading(true)
      await new Promise(res => setTimeout(res, 1000))
      console.log('New student:', data)
      router.back()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenWrapper scroll={false} padded={false}>
      <StatusBar style="dark" />
      <Header title={t('addStudent.title')} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Card variant="elevated" padded style={styles.card}>

            {/* Full Name */}
            <Text variant="label" style={styles.label}>{t('addStudent.fullName')}</Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.fullName && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t('addStudent.fullNamePlaceholder')}
                  placeholderTextColor={colors.textMuted}
                />
              )}
            />
            {errors.fullName && <Text style={styles.error}>{errors.fullName.message}</Text>}

            {/* National ID */}
            <Text variant="label" style={styles.label}>{t('addStudent.nationalId')}</Text>
            <Controller
              control={control}
              name="nationalId"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.nationalId && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  placeholder="0000000000"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={10}
                />
              )}
            />
            {errors.nationalId && <Text style={styles.error}>{errors.nationalId.message}</Text>}

            {/* Date of Birth */}
            <Text variant="label" style={styles.label}>{t('addStudent.dateOfBirth')}</Text>
            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field: { value } }) => (
                <TouchableOpacity
                  style={[styles.input, styles.dateInput, errors.dateOfBirth && styles.inputError]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={value ? styles.dateValue : styles.datePlaceholder}>
                    {value ? formatDate(selectedDate) : t('addStudent.dateOfBirthPlaceholder')}
                  </Text>
                  <Text>📅</Text>
                </TouchableOpacity>
              )}
            />
            {errors.dateOfBirth && <Text style={styles.error}>{errors.dateOfBirth.message}</Text>}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* Difficulty */}
            <Text variant="label" style={styles.label}>{t('addStudent.difficulty')}</Text>
            <Controller
              control={control}
              name="difficulty"
              render={({ field: { onChange, value } }) => (
                <DifficultyDropdown value={value} onChange={onChange} error={!!errors.difficulty} t={t} />
              )}
            />
            {errors.difficulty && <Text style={styles.error}>{errors.difficulty.message}</Text>}

            {/* Gender */}
            <Text variant="label" style={styles.label}>{t('addStudent.gender')}</Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange } }) => (
                <View style={styles.genderRow}>
                  <GenderCard gender="female" selected={selectedGender === 'female'} onPress={() => onChange('female')} t={t} />
                  <GenderCard gender="male"   selected={selectedGender === 'male'}   onPress={() => onChange('male')}   t={t} />
                </View>
              )}
            />
            {errors.gender && <Text style={styles.error}>{errors.gender.message}</Text>}

            <Button
              label={t('common.continue')}
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={styles.btn}
            />

          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  card: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    height: 52,
    paddingHorizontal: spacing.md,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily.regular,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: spacing.md,
  },
  dateValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
  },
  datePlaceholder: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
  },

  /* Dropdown */
  dropdown: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    height: 52,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dropdownValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
  },
  dropdownPlaceholder: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
  },
  dropdownArrow: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  dropdownMenu: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: colors.primaryLighter,
  },
  dropdownItemText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
  },
  dropdownItemTextSelected: {
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },

  /* Gender cards */
  genderRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  genderCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    position: 'relative',
  },
  genderCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  genderEmoji: {
    fontSize: 34,
  },
  genderDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  genderLabel: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    fontSize: 12,
    color: colors.white,
    fontFamily: typography.fontFamily.bold,
  },

  btn: {
    marginTop: spacing.md,
    width: '100%',
  },
})
