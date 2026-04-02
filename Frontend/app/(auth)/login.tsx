import { useAuthStore } from "@/store/authStore";
import { Colors, Radius, Spacing } from "@/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    KeyboardAvoidingView,
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
import { z } from "zod";

const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "modal.error.invalidId.message")
    .min(5, "modal.error.invalidId.message"),
  password: z
    .string()
    .min(1, "modal.error.invalidInfo.message")
    .min(6, "modal.error.invalidInfo.message"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((s) => s.login)
  const setLoading = useAuthStore((s) => s.setLoading)
  const setError = useAuthStore((s) => s.setError)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setLoading(true)
    setError(null)
    try {
      // TODO: replace with real API call
      // const res = await api.login(data)
      // login(res.user, res.token)

      // Mock — remove when backend is ready
      login(
        { role: 'parent', language: 'en' } as any,
        'mock-token-123'
      )
      router.replace("/(parent)/home")
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setIsLoading(false)
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.mascot}>
            <Text style={styles.mascotEmoji}>🐧</Text>
          </View>

          <Text style={styles.title}>{t("auth.login.title")}</Text>
          <Text style={styles.subtitle}>{t("auth.login.subtitle")}</Text>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t("auth.login.nationalId")}</Text>
              <Controller
                control={control}
                name="identifier"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.identifier && styles.inputError,
                    ]}
                    placeholder={t("auth.login.nationalId")}
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    accessibilityLabel={t("auth.login.nationalId")}
                  />
                )}
              />
              {errors.identifier && (
                <Text style={styles.errorText}>
                  {t(errors.identifier.message!)}
                </Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>{t("auth.login.password")}</Text>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/forgot-password")}
                  accessibilityRole="link"
                >
                  <Text style={styles.forgotLink}>
                    {t("auth.login.forgotPassword")}
                  </Text>
                </TouchableOpacity>
              </View>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={[
                      styles.passwordWrap,
                      errors.password && styles.inputError,
                    ]}
                  >
                    <TextInput
                      style={styles.passwordInput}
                      placeholder={t("auth.login.password")}
                      placeholderTextColor={Colors.textMuted}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(onSubmit)}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      accessibilityLabel={t("auth.login.password")}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword((p) => !p)}
                      style={styles.eyeBtn}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <Text style={styles.eyeIcon}>
                        {showPassword ? "🙈" : "👁"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>
                  {t(errors.password.message!)}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.continueBtn,
                isLoading && styles.continueBtnDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel={t("auth.login.loginButton")}
            >
              <Text style={styles.continueBtnText}>
                {isLoading ? t("common.loading") : t("auth.login.loginButton")}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t("common.orContinueWith")}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.sanadBtn}
              accessibilityRole="button"
              accessibilityLabel="Sign up with Sanad"
            >
              <Text style={styles.sanadIcon}>🇯🇴</Text>
              <Text style={styles.sanadBtnText}>{t("auth.login.sanad")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>{t("auth.login.noAccount")} </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/role-select")}
              accessibilityRole="link"
            >
              <Text style={styles.signupLink}>{t("auth.login.signUp")}</Text>
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl * 2,
  },
  backBtn: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    alignSelf: "flex-start",
  },
  backIcon: {
    fontSize: 22,
    color: Colors.textDark,
  },

  mascot: {
    alignItems: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  mascotEmoji: {
    fontSize: 64,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textDark,
    fontFamily: "Lexend-Bold",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMedium,
    fontFamily: "Lexend-Regular",
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },

  form: {
    gap: Spacing.md,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textDark,
    fontFamily: "Lexend-SemiBold",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotLink: {
    fontSize: 13,
    color: Colors.primary,
    fontFamily: "Lexend-Regular",
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    height: 52,
    fontSize: 15,
    color: Colors.textDark,
    fontFamily: "Lexend-Regular",
  },
  inputError: {
    borderColor: Colors.red,
  },
  errorText: {
    fontSize: 12,
    color: Colors.red,
    fontFamily: "Lexend-Regular",
    marginTop: 2,
  },

  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    height: 52,
    paddingHorizontal: Spacing.lg,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
    fontFamily: "Lexend-Regular",
  },
  eyeBtn: {
    padding: Spacing.sm,
  },
  eyeIcon: {
    fontSize: 18,
  },

  continueBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  continueBtnDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.white,
    fontFamily: "Lexend-Bold",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginVertical: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: "Lexend-Regular",
  },

  sanadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderRadius: Radius.md,
    height: 54,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  sanadIcon: {
    fontSize: 20,
  },
  sanadBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textDark,
    fontFamily: "Lexend-SemiBold",
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  signupText: {
    fontSize: 14,
    color: Colors.textMedium,
    fontFamily: "Lexend-Regular",
  },
  signupLink: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: "Lexend-SemiBold",
    fontWeight: "600",
  },
});