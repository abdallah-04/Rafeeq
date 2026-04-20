import React, { useMemo, useState } from 'react';
import { View, Image, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { createAddTeacherSchema, AddTeacherForm } from '@/lib/schemas/teacherSchema';
import Header from '@/components/modal/shared/Header';
import { Button } from '@/components/modal/shared/Button';
import { Text } from '@/components/modal/shared/Text';
import TextInput from '@/components/modal/shared/TextInput';
import { theme } from '@/theme';
import { apiCreateTeacher } from '@/services/api';
import { useModal } from '@/components/modal/ModalProvider';

const { colors, spacing, radius } = theme;

export default function AddTeacherScreen() {
  const { show } = useModal();
  const { t } = useTranslation();
  const [photo,   setPhoto]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const schema = useMemo(() => createAddTeacherSchema(t), [t]);
  const { control, handleSubmit, formState: { errors } } = useForm<AddTeacherForm>({
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
    setLoading(true);
    try {
      await apiCreateTeacher({
        fullNameAr:  data.fullName,
        nationalId:  data.nationalId,
        phone:       `+962${data.phone}`,
        password:    data.password,
        email:       `${data.nationalId}@teachers.rafeeq.local`, // backend accepts optional email
      });
      show('success', { variant: 'greatJob' });
      setTimeout(() => router.replace('/(school)/teachers' as any), 1200);
    } catch (err: any) {
      show('error', { variant: 'invalidInfo' });
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

            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label={t('addTeacher.fullName')}
                  placeholder={t('addTeacher.fullNamePlaceholder')}
                  value={value}
                  onChangeText={onChange}
                  errorMsg={errors.fullName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="nationalId"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label={t('addTeacher.nationalId')}
                  placeholder="0000000000"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  errorMsg={errors.nationalId?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label={t('addTeacher.phone')}
                  placeholder="7X XXX XXXX"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                  errorMsg={errors.phone?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label={t('addTeacher.createPassword')}
                  placeholder="••••••••"
                  value={value}
                  onChangeText={onChange}
                  secureEntry
                  errorMsg={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label={t('addTeacher.confirmPassword')}
                  placeholder="••••••••"
                  value={value}
                  onChangeText={onChange}
                  secureEntry
                  errorMsg={errors.confirmPassword?.message}
                />
              )}
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
  safe:             { flex: 1, backgroundColor: colors.background },
  container:        { flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl, alignItems: 'center', gap: spacing.lg },
  photoCircle:      { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surfaceElevated, borderWidth: 1.5, borderColor: colors.primaryLighter, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photoImage:       { width: '100%', height: '100%' },
  photoPlaceholder: { alignItems: 'center', gap: 4 },
  photoLabel:       { fontSize: 11, textAlign: 'center' },
  card:             { width: '100%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  btn:              { marginTop: spacing.sm },
});