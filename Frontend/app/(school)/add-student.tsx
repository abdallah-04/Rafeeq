import { Colors, Radius, Spacing } from "@/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

// ─── Schema ───────────────────────────────────────────────────
const addStudentSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(60, "Full name is too long"),
  nationalId: z
    .string()
    .length(10, "National ID must be exactly 10 digits")
    .regex(/^\d+$/, "National ID must contain only numbers"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Format must be MM/DD/YYYY"),
  difficulty: z.string().min(1, "Please select a difficulty"),
});

type AddStudentForm = z.infer<typeof addStudentSchema>;

// ─── Constants ────────────────────────────────────────────────
const DIFFICULTIES = ["ADD", "ADHD", "IFD", "Autism", "Down Syndrome", "Other"];

type Gender = "female" | "male";

// ─── Date Picker Modal (simple) ───────────────────────────────
function DatePickerModal({
  visible,
  value,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  value: string;
  onConfirm: (date: string) => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState(value);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.card}>
          <Text style={modalStyles.title}>Select Date of Birth</Text>
          <TextInput
            style={modalStyles.input}
            placeholder="MM/DD/YYYY"
            placeholderTextColor={Colors.textLight}
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
              onPress={() => {
                onConfirm(input);
                onClose();
              }}
            >
              <Text style={modalStyles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: 300,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontFamily: "Lexend-Bold",
    fontSize: 16,
    color: Colors.textDark,
    textAlign: "center",
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    height: 48,
    paddingHorizontal: Spacing.md,
    fontFamily: "Lexend-Regular",
    fontSize: 14,
    color: Colors.textDark,
    borderWidth: 1.5,
    borderColor: Colors.border,
    textAlign: "center",
  },
  btnRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontFamily: "Lexend-SemiBold",
    fontSize: 14,
    color: Colors.textMedium,
  },
  confirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    fontFamily: "Lexend-Bold",
    fontSize: 14,
    color: Colors.white,
  },
});

// ─── Difficulty Dropdown ──────────────────────────────────────
function DifficultyDropdown({
  value,
  onChange,
  error,
  t,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  t: any;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={[styles.dropdownBtn, error && styles.inputError]}
        onPress={() => setOpen(!open)}
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.dropdownText,
            !value && styles.dropdownPlaceholder,
          ]}
        >
          {value || t("addStudent.difficultyPlaceholder")}
        </Text>
        <Text style={styles.dropdownArrow}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownList}>
          {DIFFICULTIES.map((d) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.dropdownItem,
                value === d && styles.dropdownItemActive,
              ]}
              onPress={() => {
                onChange(d);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  value === d && styles.dropdownItemTextActive,
                ]}
              >
                {d}
              </Text>
              {value === d && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Gender Card ──────────────────────────────────────────────
function GenderCard({
  gender,
  selected,
  onSelect,
}: {
  gender: Gender;
  selected: boolean;
  onSelect: () => void;
}) {
  const isFemale = gender === "female";
  const borderColor = isFemale ? "#EC4899" : "#06B6D4";
  const emoji = isFemale ? "🐧" : "🐧";

  return (
    <TouchableOpacity
      style={[
        styles.genderCard,
        selected && { borderColor, borderWidth: 3 },
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={gender}
    >
      {/* Selected checkmark */}
      {selected && (
        <View
          style={[styles.genderCheck, { backgroundColor: borderColor }]}
        >
          <Text style={styles.genderCheckIcon}>✓</Text>
        </View>
      )}

      {/* Penguin emoji — replace with Image asset when available */}
      <Text style={[styles.genderEmoji, isFemale && { color: "#EC4899" }]}>
        {isFemale ? "🐧" : "🐧"}
      </Text>

      <Text
        style={[
          styles.genderLabel,
          selected && { color: borderColor, fontFamily: "Lexend-Bold" },
        ]}
      >
        {gender === "female" ? "Female" : "Male"}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────
export default function AddStudentScreen() {
  const { t } = useTranslation();
  const [gender, setGender] = useState<Gender | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddStudentForm>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      fullName: "",
      nationalId: "",
      dateOfBirth: "",
      difficulty: "",
    },
  });

  const dateOfBirth = watch("dateOfBirth");

  // ── Submit ──────────────────────────────────────────────────
  // TODO: replace mock with real API → POST /teacher/students or /school/students
  const onSubmit = async (data: AddStudentForm) => {
    if (!gender) return;
    try {
      setLoading(true);
      await new Promise((res) => setTimeout(res, 1000)); // mock delay
      console.log("New student payload:", { ...data, gender });
      router.back();
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
        {/* Penguin top-right */}
        <Text style={styles.penguinIcon}>🐧</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
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
            {errors.fullName && (
              <Text style={styles.error}>{errors.fullName.message}</Text>
            )}

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
            {errors.nationalId && (
              <Text style={styles.error}>{errors.nationalId.message}</Text>
            )}

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
  penguinIcon: {
    fontSize: 28,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
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
    borderColor: "transparent",
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
    alignItems: "center",
    justifyContent: "center",
  },
  genderCheckIcon: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: "700",
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
});