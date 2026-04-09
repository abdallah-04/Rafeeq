// app/(school)/add-teacher.tsx

import { Colors, Radius, Spacing } from "@/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import BackButton from "@/components/BackButton";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
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
  const { t } = useTranslation()
  const [photo, setPhoto]               = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [loading, setLoading]           = useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm<AddTeacherForm>({
    resolver: zodResolver(addTeacherSchema),
  })

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled) setPhoto(result.assets[0].uri)
  }

  const onSubmit = async (data: AddTeacherForm) => {
    try {
      setLoading(true)
      await new Promise(res => setTimeout(res, 1000))
      console.log('New teacher:', { ...data, photo })
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
      <Header title={t('addTeacher.title')} />

      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>{t("addTeacher.title")}</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Photo picker */}
          <TouchableOpacity style={styles.photoCircle} onPress={pickPhoto}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photoImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>📷</Text>
                <Text variant="caption" color="textSecondary">{t('addTeacher.addPhoto')}</Text>
              </View>
            )}
          </TouchableOpacity>

          <Card variant="elevated" padded style={styles.card}>

            {/* Full Name */}
            <Text variant="label" style={styles.label}>{t('addTeacher.fullName')}</Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.fullName && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t('addTeacher.fullNamePlaceholder')}
                  placeholderTextColor={colors.textMuted}
                />
              )}
            />
            {errors.fullName && <Text style={styles.error}>{errors.fullName.message}</Text>}

            {/* National ID */}
            <Text variant="label" style={styles.label}>{t('addTeacher.nationalId')}</Text>
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

            {/* Phone */}
            <Text variant="label" style={styles.label}>{t('addTeacher.phone')}</Text>
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
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    maxLength={9}
                  />
                </View>
              )}
            />
            {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

            {/* Password */}
            <Text variant="label" style={styles.label}>{t('addTeacher.createPassword')}</Text>
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
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
                    <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

            {/* Confirm Password */}
            <Text variant="label" style={styles.label}>{t('addTeacher.confirmPassword')}</Text>
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
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showConfirm}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(p => !p)}>
                    <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message}</Text>}

            <Button
              label={t('addTeacher.submit')}
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
  headerTitle: {
    fontSize: 18,
    fontFamily: "Lexend-Bold",
    fontWeight: "700",
    color: Colors.textDark,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.lg,
  },
  photoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  photoIcon: {
    fontSize: 26,
  },
  card: {
    width: '100%',
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
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    height: 52,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  prefix: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
  },
  phoneDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  phoneInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    height: '100%',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    height: 52,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: spacing.md,
  },
  passwordInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    height: '100%',
  },
  eyeIcon: {
    fontSize: 18,
    paddingLeft: spacing.sm,
  },
  btn: {
    marginTop: spacing.md,
    width: '100%',
  },
})
