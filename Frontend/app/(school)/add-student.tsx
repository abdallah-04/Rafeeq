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
    <View>
      <TouchableOpacity
        style={[styles.dropdown, error && styles.inputError]}
        onPress={() => setOpen(true)}
      >
        <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {value ?? t('addStudent.difficultyPlaceholder')}
        </Text>
        <Text style={styles.dropdownArrow}>{open ? "▲" : "▼"}</Text>
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
    if (!gender) return;
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
          {/* ── Form card ── */}
          <View style={styles.card}>

            {/* Child's Full Name */}
            <Text style={styles.label}>{t("addStudent.fullName")}</Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.fullName && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t("addStudent.fullNamePlaceholder")}
                  placeholderTextColor={Colors.textLight}
                />
              )}
            />
            {errors.fullName && <Text style={styles.error}>{errors.fullName.message}</Text>}

            {/* National ID */}
            <Text style={styles.label}>{t("addStudent.nationalId")}</Text>
            <Controller
              control={control}
              name="nationalId"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.nationalId && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  placeholder="0000000000"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                  maxLength={10}
                />
              )}
            />
            {errors.nationalId && <Text style={styles.error}>{errors.nationalId.message}</Text>}

            {/* Date of Birth — calendar trigger */}
            <Text style={styles.label}>{t("addStudent.dateOfBirth")}</Text>
            <TouchableOpacity
              style={[
                styles.dateRow,
                errors.dateOfBirth && styles.inputError,
              ]}
              onPress={() => setShowDatePicker(true)}
              accessibilityRole="button"
              accessibilityLabel="Select date of birth"
            >
              <Text
                style={[
                  styles.dateText,
                  !dateOfBirth && styles.datePlaceholder,
                ]}
              >
                {dateOfBirth || "MM/DD/YYYY"}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
            {errors.dateOfBirth && (
              <Text style={styles.error}>{errors.dateOfBirth.message}</Text>
            )}

            {/* Child's Difficulty */}
            <Text style={styles.label}>{t("addStudent.difficulty")}</Text>
            <Controller
              control={control}
              name="difficulty"
              render={({ field: { onChange, value } }) => (
                <DifficultyDropdown
                  value={value}
                  onChange={onChange}
                  error={errors.difficulty?.message}
                  t={t}
                />
              )}
            />
            {errors.difficulty && (
              <Text style={styles.error}>{errors.difficulty.message}</Text>
            )}
          </View>

          {/* ── Gender section ── */}
          <View style={styles.genderSection}>
            <Text style={styles.genderTitle}>{t("addStudent.gender")}</Text>
            <View style={styles.genderRow}>
              <GenderCard
                gender="female"
                selected={gender === "female"}
                onSelect={() => setGender("female")}
              />
              <GenderCard
                gender="male"
                selected={gender === "male"}
                onSelect={() => setGender("male")}
              />
            </View>
            {!gender && loading && (
              <Text style={styles.error}>Please select a gender</Text>
            )}
          </View>

          {/* ── Continue button ── */}
          <TouchableOpacity
            style={[
              styles.button,
              (loading || !gender) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading || !gender}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>{t("addStudent.continue")}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        value={dateOfBirth}
        onConfirm={(date) => setValue("dateOfBirth", date, { shouldValidate: true })}
        onClose={() => setShowDatePicker(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Lexend-Bold",
    fontWeight: "700",
    color: Colors.textDark,
  },
  penguinIcon: {
    fontSize: 28,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },

  // Form card
  card: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: Spacing.xl,
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

  // Date row
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    height: 52,
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  dateText: {
    fontFamily: "Lexend-Regular",
    fontSize: 14,
    color: Colors.textDark,
  },
  datePlaceholder: {
    color: Colors.textLight,
  },
  calendarIcon: {
    fontSize: 18,
  },

  // Dropdown
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    height: 52,
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dropdownText: {
    fontFamily: "Lexend-Regular",
    fontSize: 14,
    color: Colors.textDark,
  },
  dropdownPlaceholder: {
    color: Colors.textLight,
  },
  dropdownArrow: {
    fontSize: 11,
    color: Colors.textLight,
  },
  dropdownList: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  dropdownItemActive: {
    backgroundColor: Colors.primaryLight,
  },
  dropdownItemText: {
    fontFamily: "Lexend-Regular",
    fontSize: 14,
    color: Colors.textDark,
  },
  dropdownItemTextActive: {
    fontFamily: "Lexend-SemiBold",
    color: Colors.primary,
  },
  checkmark: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "700",
  },

  // Gender
  genderSection: {
    marginBottom: Spacing.xl,
  },
  genderTitle: {
    fontFamily: "Lexend-Bold",
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textDark,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  genderRow: {
    flexDirection: "row",
    gap: Spacing.md,
    justifyContent: "center",
  },
  genderCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
    minHeight: 140,
    justifyContent: "center",
  },
  genderCheck: {
    position: "absolute",
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
    fontFamily: typography.fontFamily.bold,
  },
  genderEmoji: {
    fontSize: 52,
  },
  genderLabel: {
    fontFamily: "Lexend-SemiBold",
    fontSize: 15,
    color: Colors.textMedium,
    fontWeight: "600",
  },

  // Button
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: "Lexend-Bold",
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
})
