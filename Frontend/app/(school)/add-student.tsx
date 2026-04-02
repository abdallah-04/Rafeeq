// app/(school)/add-student.tsx

import { Colors, Radius, Spacing } from "@/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { addStudentSchema, AddStudentForm } from "@/lib/schemas/studentSchema";

// ─── Types ────────────────────────────────────────────────────────────────────

type Difficulty = "ADD" | "ADHD" | "IFD";
type Gender = "male" | "female";

const DIFFICULTIES: Difficulty[] = ["ADD", "ADHD", "IFD"];

// ─── Gender Card ──────────────────────────────────────────────────────────────
// Shows a penguin card — pink for female, blue for male
// Selected state shows a checkmark badge on the penguin

interface GenderCardProps {
  gender: Gender;
  selected: boolean;
  onPress: () => void;
  t: any;
}

function GenderCard({ gender, selected, onPress, t }: GenderCardProps) {
  const isFemale = gender === "female";

  const cardStyle = [
    styles.genderCard,
    selected && (isFemale ? styles.genderCardSelectedFemale : styles.genderCardSelectedMale),
  ];

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t(`addStudent.${gender}`)}
      accessibilityState={{ selected }}
    >
      {/* Penguin emoji — pink tint for female, blue tint for male */}
      <View style={[
        styles.genderPenguinCircle,
        { backgroundColor: isFemale ? "#FFF0F6" : "#EFF6FF" }
      ]}>
        <Text style={styles.genderPenguinEmoji}>
          {isFemale ? "🐧" : "🐧"}
        </Text>
        {/* Color tint label under penguin */}
        <View style={[
          styles.genderTintDot,
          { backgroundColor: isFemale ? "#F472B6" : "#3B82F6" }
        ]} />
      </View>

      <Text style={[
        styles.genderLabel,
        selected && { color: isFemale ? "#F472B6" : "#3B82F6", fontFamily: "Lexend-Bold" }
      ]}>
        {t(`addStudent.${gender}`)}
      </Text>

      {/* Checkmark badge — only visible when selected */}
      {selected && (
        <View style={[
          styles.genderCheckBadge,
          { backgroundColor: isFemale ? "#F472B6" : "#3B82F6" }
        ]}>
          <Text style={styles.genderCheckIcon}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Difficulty Dropdown ──────────────────────────────────────────────────────

interface DifficultyDropdownProps {
  value: Difficulty | undefined;
  onChange: (val: Difficulty) => void;
  error: boolean;
  t: any;
}

function DifficultyDropdown({ value, onChange, error, t }: DifficultyDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[styles.dropdown, error && styles.inputError]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
      >
        <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {value ?? t("addStudent.difficultyPlaceholder")}
        </Text>
        <Text style={styles.dropdownArrow}>▾</Text>
      </TouchableOpacity>

      {/* Dropdown modal */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.dropdownMenu}>
            {DIFFICULTIES.map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.dropdownItem,
                  value === d && styles.dropdownItemSelected,
                ]}
                onPress={() => { onChange(d); setOpen(false); }}
              >
                <Text style={[
                  styles.dropdownItemText,
                  value === d && styles.dropdownItemTextSelected,
                ]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AddStudentScreen() {
  const { t } = useTranslation();
  const [loading, setLoading]           = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddStudentForm>({
    resolver: zodResolver(addStudentSchema),
  });

  const selectedGender = watch("gender");

  // ── Date picker handler ───────────────────────────────────────────────────
  const onDateChange = (_: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setSelectedDate(date);
      setValue("dateOfBirth", date.toISOString().split("T")[0], {
        shouldValidate: true,
      });
    }
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // ── Submit ────────────────────────────────────────────────────────────────
  // TODO: replace mock with real API call → POST /teacher/students
  const onSubmit = async (data: AddStudentForm) => {
    try {
      setLoading(true);
      await new Promise((res) => setTimeout(res, 1000)); // mock delay
      console.log("New student payload:", data);
      router.back(); // go back to students list
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("addStudent.title")}</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>

            {/* ── Full Name ── */}
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
                />
              )}
            />
            {errors.fullName && (
              <Text style={styles.error}>{errors.fullName.message}</Text>
            )}

            {/* ── National ID ── */}
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
                  keyboardType="numeric"
                  maxLength={10}
                />
              )}
            />
            {errors.nationalId && (
              <Text style={styles.error}>{errors.nationalId.message}</Text>
            )}

            {/* ── Date of Birth ── */}
            <Text style={styles.label}>{t("addStudent.dateOfBirth")}</Text>
            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field: { value } }) => (
                <TouchableOpacity
                  style={[styles.input, styles.dateInput, errors.dateOfBirth && styles.inputError]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={value ? styles.dateValue : styles.datePlaceholder}>
                    {value ? formatDate(selectedDate) : t("addStudent.dateOfBirthPlaceholder")}
                  </Text>
                  <Text style={styles.calendarIcon}>📅</Text>
                </TouchableOpacity>
              )}
            />
            {errors.dateOfBirth && (
              <Text style={styles.error}>{errors.dateOfBirth.message}</Text>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* ── Difficulty Dropdown ── */}
            <Text style={styles.label}>{t("addStudent.difficulty")}</Text>
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
            {errors.difficulty && (
              <Text style={styles.error}>{errors.difficulty.message}</Text>
            )}

            {/* ── Gender Penguin Cards ── */}
            <Text style={styles.label}>{t("addStudent.gender")}</Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange } }) => (
                <View style={styles.genderRow}>
                  <GenderCard
                    gender="female"
                    selected={selectedGender === "female"}
                    onPress={() => onChange("female")}
                    t={t}
                  />
                  <GenderCard
                    gender="male"
                    selected={selectedGender === "male"}
                    onPress={() => onChange("male")}
                    t={t}
                  />
                </View>
              )}
            />
            {errors.gender && (
              <Text style={styles.error}>{errors.gender.message}</Text>
            )}

            {/* ── Continue button ── */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>{t("common.continue")}</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backIcon: {
    fontSize: 22,
    color: Colors.textDark,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Lexend-Bold",
    fontWeight: "700",
    color: Colors.textDark,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textDark,
    fontFamily: "Lexend-SemiBold",
    marginBottom: 6,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    height: 52,
    paddingHorizontal: Spacing.md,
    fontFamily: "Lexend-Regular",
    fontSize: 14,
    color: Colors.textDark,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  error: {
    fontSize: 11,
    color: "#EF4444",
    marginTop: 4,
    fontFamily: "Lexend-Regular",
  },

  // Date picker
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: Spacing.md,
  },
  dateValue: {
    fontSize: 14,
    fontFamily: "Lexend-Regular",
    color: Colors.textDark,
  },
  datePlaceholder: {
    fontSize: 14,
    fontFamily: "Lexend-Regular",
    color: Colors.textLight,
  },
  calendarIcon: {
    fontSize: 18,
  },

  // Difficulty dropdown
  dropdown: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    height: 52,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  dropdownValue: {
    fontSize: 14,
    fontFamily: "Lexend-Regular",
    color: Colors.textDark,
  },
  dropdownPlaceholder: {
    fontSize: 14,
    fontFamily: "Lexend-Regular",
    color: Colors.textLight,
  },
  dropdownArrow: {
    fontSize: 14,
    color: Colors.textMedium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl * 2,
  },
  dropdownMenu: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.primaryLight,
  },
  dropdownItemText: {
    fontSize: 15,
    fontFamily: "Lexend-Regular",
    color: Colors.textDark,
  },
  dropdownItemTextSelected: {
    fontFamily: "Lexend-Bold",
    color: Colors.primary,
  },

  // Gender cards
  genderRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  genderCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    position: "relative",
  },
  genderCardSelectedFemale: {
    borderColor: "#F472B6",
    backgroundColor: "#FFF0F6",
  },
  genderCardSelectedMale: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  genderPenguinCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  genderPenguinEmoji: {
    fontSize: 36,
  },
  genderTintDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: "absolute",
    bottom: 2,
    right: 2,
  },
  genderLabel: {
    fontSize: 13,
    fontFamily: "Lexend-SemiBold",
    color: Colors.textMedium,
    marginTop: 4,
  },
  genderCheckBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  genderCheckIcon: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: "700",
  },

  // Button
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: "Lexend-Bold",
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
});