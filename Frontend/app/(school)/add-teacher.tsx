// app/(school)/add-teacher.tsx

import { Colors, Radius, Spacing } from "@/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
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
import { addTeacherSchema, AddTeacherForm } from "@/lib/schemas/teacherSchema";

export default function AddTeacherScreen() {
  const { t } = useTranslation();
  const [photo, setPhoto]               = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddTeacherForm>({
    resolver: zodResolver(addTeacherSchema),
  });

  // ── Photo picker ──────────────────────────────────────────────────────────
  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  // TODO: replace mock with real API call → POST /school/teachers
  const onSubmit = async (data: AddTeacherForm) => {
    try {
      setLoading(true);
      await new Promise((res) => setTimeout(res, 1000)); // mock delay
      console.log("New teacher payload:", {
        fullName:   data.fullName,
        nationalId: data.nationalId,
        phone:      `+962${data.phone}`,
        password:   data.password,
        photo,
      });
      router.back(); // go back to teacher list
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
        <Text style={styles.headerTitle}>{t("addTeacher.title")}</Text>
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
          {/* ── Photo picker ── */}
          <TouchableOpacity
            style={styles.photoCircle}
            onPress={pickPhoto}
            accessibilityRole="button"
            accessibilityLabel={t("addTeacher.addPhoto")}
          >
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photoImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>📷</Text>
                <Text style={styles.photoLabel}>{t("addTeacher.addPhoto")}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* ── Form card ── */}
          <View style={styles.card}>

            {/* Full Name */}
            <Text style={styles.label}>{t("addTeacher.fullName")}</Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.fullName && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t("addTeacher.fullNamePlaceholder")}
                />
              )}
            />
            {errors.fullName && <Text style={styles.error}>{errors.fullName.message}</Text>}

            {/* National ID */}
            <Text style={styles.label}>{t("addTeacher.nationalId")}</Text>
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
            {errors.nationalId && <Text style={styles.error}>{errors.nationalId.message}</Text>}

            {/* Phone */}
            <Text style={styles.label}>{t("addTeacher.phone")}</Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.phoneRow, errors.phone && styles.inputError]}>
                  <Text style={styles.prefix}>+962</Text>
                  <View style={styles.phoneDivider} />
                  <TextInput
                    style={styles.phoneInput}
                    onChangeText={onChange}
                    value={value}
                    placeholder="7X XXX XXXX"
                    keyboardType="phone-pad"
                    maxLength={9}
                  />
                </View>
              )}
            />
            {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

            {/* Create Password */}
            <Text style={styles.label}>{t("addTeacher.createPassword")}</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.passwordRow, errors.password && styles.inputError]}>
                  <TextInput
                    style={styles.passwordInput}
                    onChangeText={onChange}
                    value={value}
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                    <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

            {/* Confirm Password */}
            <Text style={styles.label}>{t("addTeacher.confirmPassword")}</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.passwordRow, errors.confirmPassword && styles.inputError]}>
                  <TextInput
                    style={styles.passwordInput}
                    onChangeText={onChange}
                    value={value}
                    placeholder="••••••••"
                    secureTextEntry={!showConfirm}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm((p) => !p)}>
                    <Text style={styles.eyeIcon}>{showConfirm ? "🙈" : "👁️"}</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.confirmPassword && (
              <Text style={styles.error}>{errors.confirmPassword.message}</Text>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>{t("addTeacher.submit")}</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    alignItems: "center",
  },

  // Photo
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    alignItems: "center",
    gap: 4,
  },
  photoIcon: {
    fontSize: 26,
  },
  photoLabel: {
    fontSize: 10,
    fontFamily: "Lexend-Regular",
    color: Colors.textMedium,
    textAlign: "center",
  },

  // Card
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

  // Phone
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    height: 52,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  prefix: {
    fontSize: 14,
    fontFamily: "Lexend-SemiBold",
    color: Colors.textDark,
  },
  phoneDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Lexend-Regular",
    color: Colors.textDark,
    height: "100%",
  },

  // Password
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    height: 52,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingHorizontal: Spacing.md,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Lexend-Regular",
    color: Colors.textDark,
    height: "100%",
  },
  eyeIcon: {
    fontSize: 18,
    paddingLeft: Spacing.sm,
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