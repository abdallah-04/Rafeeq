import React, { useMemo, useState } from 'react';
import { View, Image, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { createAddTeacherSchema, AddTeacherForm } from '@/lib/schemas/teacherSchema';
import Header from '@/components/modal/shared/Header';
import { Button } from '@/components/modal/shared/Button';
import { Text } from '@/components/modal/shared/Text';
import { theme } from '@/theme';

import { 
  TeacherNameInput as NameInput,
  NationalIdInput, 
  PhoneInput, 
  PasswordInput, 
  ConfirmPasswordInput 
} from '@/components/modal/inputs/formInputs';

const { colors, spacing, radius } = theme;

export default function AddTeacherScreen() {
  const { t } = useTranslation();
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const schema = useMemo(() => createAddTeacherSchema(t), [t]);
  const { control, handleSubmit } = useForm<AddTeacherForm>({
    resolver: zodResolver(schema),
  });

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const onSubmit = async (data: AddTeacherForm) => {
    try {
      setLoading(true);
      await new Promise(res => setTimeout(res, 1000));
      console.log('New teacher:', { ...data, photo });
      router.replace('/(school)/teachers');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <Header
        title={t('addTeacher.title')}
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Photo picker */}
          <TouchableOpacity style={styles.photoCircle} onPress={pickPhoto} activeOpacity={0.7}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photoImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={28} color={colors.textMuted} />
                <Text variant="caption" color="textMuted" style={styles.photoLabel}>
                  {t('addTeacher.addPhoto')}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Form card */}
          <View style={styles.card}>

            <NameInput
              control={control}
              name="fullName"
              label={t('addTeacher.fullName')}
              placeholder={t('addTeacher.fullNamePlaceholder')}
            />

            <NationalIdInput
              control={control}
              name="nationalId"
              label={t('addTeacher.nationalId')}
              placeholder="0000000000"
            />

            <PhoneInput
              control={control}
              name="phone"
              label={t('addTeacher.phone')}
              placeholder="7X XXX XXXX"
            />

            <PasswordInput
              control={control}
              name="password"
              label={t('addTeacher.createPassword')}
              placeholder="••••••••"
            />

            <ConfirmPasswordInput
              control={control}
              name="confirmPassword"
              passwordName="password"
              label={t('addTeacher.confirmPassword')}
              placeholder="••••••••"
            />

            <Button
              label={t('common.continue')}
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={styles.btn}
            />

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    gap: spacing.lg,
  },
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.primaryLighter,
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
    gap: 4,
  },
  photoLabel: {
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    gap: spacing.xs,
  },
  btn: {
    marginTop: spacing.md,
  },
});