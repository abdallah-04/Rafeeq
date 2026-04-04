import { Colors, Radius, Spacing } from "@/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { schoolStep2Schema, SchoolStep2Form } from "@/lib/schemas/schoolSignup";
import { useSchoolSignupStore } from "@/store/schoolSignupStore";

export default function SchoolSignupStep2() {
  const { t } = useTranslation();
  const setStep2 = useSchoolSignupStore((s) => s.setStep2);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SchoolStep2Form>({
    resolver: zodResolver(schoolStep2Schema),
  });

const onContinue = (data: SchoolStep2Form) => {
  setStep2(data)
  // TODO: replace with /(auth)/verify-otp once shared OTP screen is built
  router.push("/(auth)/school-welcome")
}

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t("schoolSignup.title")}</Text>
          <Text style={styles.subtitle}>{t("schoolSignup.subtitle")}</Text>
        </View>

        <View style={styles.card}>

          <Text style={styles.label}>{t("schoolSignup.advisorPhone")}</Text>
          <Controller
            control={control}
            name="advisorPhone"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.phoneRow, errors.advisorPhone && styles.inputError]}>
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
          {errors.advisorPhone && (
            <Text style={styles.error}>{errors.advisorPhone.message}</Text>
          )}

          <Text style={styles.label}>{t("schoolSignup.createPassword")}</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.passwordRow, errors.password && styles.inputError]}>
                <TextInput
                  style={styles.passwordInput}
                  onChangeText={onChange}
                  value={value}
                  placeholder="*******"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                  <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.password && (
            <Text style={styles.error}>{errors.password.message}</Text>
          )}

          <Text style={styles.label}>{t("schoolSignup.confirmPassword")}</Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.passwordRow, errors.confirmPassword && styles.inputError]}>
                <TextInput
                  style={styles.passwordInput}
                  onChangeText={onChange}
                  value={value}
                  placeholder="*******"
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

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onContinue)}
          >
            <Text style={styles.buttonText}>{t("common.continue")}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t("common.or")}</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.loginText}>
            {t("schoolSignup.alreadyHaveAccount")}{" "}
            <Text
              style={styles.loginLink}
              onPress={() => router.push("/(auth)/login")}
            >
              {t("common.logIn")}
            </Text>
          </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  backBtn: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    alignSelf: "flex-start",
  },
  backIcon: {
    fontSize: 22,
    color: Colors.textDark,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textDark,
    fontFamily: "Lexend-Bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMedium,
    fontFamily: "Lexend-Regular",
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
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

  // Phone field
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

  // Password field
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

  // Error
  inputError: {
    borderColor: "#EF4444",
  },
  error: {
    fontSize: 11,
    color: "#EF4444",
    marginTop: 4,
    fontFamily: "Lexend-Regular",
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
  buttonText: {
    fontFamily: "Lexend-Bold",
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontFamily: "Lexend-Regular",
    fontSize: 12,
    color: Colors.textMuted,
  },

  // Login row
  loginText: {
    textAlign: "center",
    fontFamily: "Lexend-Regular",
    fontSize: 13,
    color: Colors.textMedium,
  },
  loginLink: {
    color: Colors.primary,
    fontFamily: "Lexend-SemiBold",
    fontWeight: "600",
  },
});