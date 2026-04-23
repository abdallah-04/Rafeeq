import React from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View, TouchableOpacity, StyleSheet, I18nManager, Image, TextInput as RNTextInput } from 'react-native';
import CustomTextInput from '@/components/modal/shared/TextInput';
import { theme } from '@/theme';
import { Text } from '@/components/modal/shared/Text';

const { colors, spacing, typography, radius } = theme;

// ============================================
// 1. National ID Input
// ============================================
type NationalIdInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
};

export function NationalIdInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = true,
}: NationalIdInputProps<T>) {
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        required: required ? t('validation.nationalIdRequired') : undefined,
        pattern: {
          value: /^\d{10}$/,
          message: t('validation.nationalId10Digits'),
        },
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <CustomTextInput
          label={label || t('auth.signup.nationalId')}
          value={value || ''}
          onChangeText={(text) => onChange(text.replace(/[^0-9]/g, '').slice(0, 10))}
          placeholder={placeholder || t('auth.signup.nationalIdPlaceholder')}
          keyboardType="numeric"
          errorMsg={error?.message}
        />
      )}
    />
  );
}

// ============================================
// 2. Phone Input
// ============================================
type PhoneInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
};

export function PhoneInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = true,
}: PhoneInputProps<T>) {
  const { t } = useTranslation();

  const validatePhone = (value: string) => {
    if (!required && !value) return true;
    const cleanNumber = value.replace(/^\+962\s?/, '').replace(/[^0-9]/g, '');
    const jordanPattern = /^7[0-9]{8}$/;
    if (!jordanPattern.test(cleanNumber)) {
      return t('validation.validJordanianNumber');
    }
    return true;
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        required: required ? t('validation.phoneRequired') : undefined,
        validate: validatePhone,
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <CustomTextInput
          label={label || t('auth.signup.phone')}
          value={value || ''}
          onChangeText={(text) => {
            let cleaned = text.replace(/^\+962\s?/i, '');
            cleaned = cleaned.replace(/[^0-9]/g, '');
            onChange(cleaned);
          }}
          placeholder={placeholder || t('auth.signup.phonePlaceholder')}
          keyboardType="phone-pad"
          errorMsg={error?.message}
        />
      )}
    />
  );
}

// ============================================
// 3. Password Input
// ============================================
type PasswordInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
};

export function PasswordInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = true,
  minLength = 8,
}: PasswordInputProps<T>) {
  const { t, i18n } = useTranslation();
  const [showPassword, setShowPassword] = React.useState(false);
  const isRTL = I18nManager.isRTL;
  const isAr = i18n.language === 'ar';

  const fontFamily = isAr ? typography.fontFamily.regular : typography.fontFamily.regular;

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        required: required ? t('validation.passwordRequired') : undefined,
        minLength: {
          value: minLength,
          message: t('validation.passwordMin8', { count: minLength }),
        },
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View>
          <Text 
            variant="label"
            color={error ? 'error' : 'textPrimary'}
            style={[styles.label, isRTL && styles.labelRTL]}
          >
            {label || t('auth.signup.createPassword')}
          </Text>
          <View style={[styles.passwordRow, error && styles.inputError, isRTL && styles.rowReverse]}>
            <RNTextInput
              style={[
                styles.passwordInput, 
                isRTL && styles.inputRTL,
                { fontFamily }
              ]}
              onChangeText={onChange}
              value={value || ''}
              placeholder={placeholder || t('auth.signup.createPasswordPlaceholder')}
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPassword}
              textAlign={isRTL ? 'right' : 'left'}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Image 
                source={showPassword ? require('@/assets/images/icons/eye.png') : require('@/assets/images/icons/hidden.png')}
                style={styles.eyeIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          {error && (
            <Text 
              variant="caption"
              color="error"
              style={[styles.error, isRTL && styles.errorRTL]}
            >
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}

// ============================================
// 4. Confirm Password Input
// ============================================
type ConfirmPasswordInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  passwordName: Path<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
};

export function ConfirmPasswordInput<T extends FieldValues>({
  control,
  name,
  passwordName,
  label,
  placeholder,
  required = true,
}: ConfirmPasswordInputProps<T>) {
  const { t, i18n } = useTranslation();
  const [showPassword, setShowPassword] = React.useState(false);
  const isRTL = I18nManager.isRTL;
  const isAr = i18n.language === 'ar';

  const fontFamily = isAr ? typography.fontFamily.regular : typography.fontFamily.regular;

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        required: required ? t('validation.confirmPasswordRequired') : undefined,
        validate: (value: string, formValues: T) => {
          const password = formValues[passwordName];
          if (required && !value) return t('validation.confirmPasswordRequired');
          if (password && value !== password) {
            return t('validation.passwordsNoMatch');
          }
          return true;
        },
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View>
          <Text 
            variant="label"
            color={error ? 'error' : 'textPrimary'}
            style={[styles.label, isRTL && styles.labelRTL]}
          >
            {label || t('auth.signup.confirmPassword')}
          </Text>
          <View style={[styles.passwordRow, error && styles.inputError, isRTL && styles.rowReverse]}>
            <RNTextInput
              style={[
                styles.passwordInput, 
                isRTL && styles.inputRTL,
                { fontFamily }
              ]}
              onChangeText={onChange}
              value={value || ''}
              placeholder={placeholder || t('auth.signup.confirmPasswordPlaceholder')}
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPassword}
              textAlign={isRTL ? 'right' : 'left'}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Image 
                source={showPassword ? require('@/assets/images/icons/eye.png') : require('@/assets/images/icons/hidden.png')}
                style={styles.eyeIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          {error && (
            <Text 
              variant="caption"
              color="error"
              style={[styles.error, isRTL && styles.errorRTL]}
            >
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}

// ============================================
// 5. School Name Input
// ============================================
type SchoolNameInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
};

export function SchoolNameInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = true,
}: SchoolNameInputProps<T>) {
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        required: required ? t('validation.schoolNameRequired') : undefined,
        minLength: {
          value: 3,
          message: t('validation.schoolNameMinLength'),
        },
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <CustomTextInput
          label={label || t('schoolSignup.schoolName')}
          value={value || ''}
          onChangeText={onChange}
          placeholder={placeholder || t('schoolSignup.schoolNamePlaceholder')}
          errorMsg={error?.message}
        />
      )}
    />
  );
}

// ============================================
// 6. School ID Input
// ============================================
type SchoolIdInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
};

export function SchoolIdInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = true,
}: SchoolIdInputProps<T>) {
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        required: required ? t('validation.schoolIdRequired') : undefined,
        minLength: {
          value: 3,
          message: t('validation.schoolIdMinLength'),
        },
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <CustomTextInput
          label={label || t('schoolSignup.schoolId')}
          value={value || ''}
          onChangeText={onChange}
          placeholder={placeholder || t('schoolSignup.schoolIdPlaceholder')}
          errorMsg={error?.message}
        />
      )}
    />
  );
}

// ============================================
// 7. Advisor Name Input
// ============================================
type AdvisorNameInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
};

export function AdvisorNameInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = true,
}: AdvisorNameInputProps<T>) {
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        required: required ? t('validation.advisorNameRequired') : undefined,
        minLength: {
          value: 3,
          message: t('validation.nameMinLength', { count: 3 }),
        },
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <CustomTextInput
          label={label || t('schoolSignup.advisorName')}
          value={value || ''}
          onChangeText={onChange}
          placeholder={placeholder || t('schoolSignup.advisorNamePlaceholder')}
          errorMsg={error?.message}
        />
      )}
    />
  );
}

// ============================================
// 8. Teacher Name Input
// ============================================
type TeacherNameInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
};

export function TeacherNameInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = true,
  minLength = 3,
}: TeacherNameInputProps<T>) {
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        required: required ? t('validation.teacherNameRequired') : undefined,
        minLength: {
          value: minLength,
          message: t('validation.nameMinLength', { count: minLength }),
        },
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <CustomTextInput
          label={label || t('addTeacher.fullName')}
          value={value || ''}
          onChangeText={onChange}
          placeholder={placeholder || t('addTeacher.fullNamePlaceholder')}
          errorMsg={error?.message}
        />
      )}
    />
  );
}

// ============================================
// 9. Advisor Phone Input (with +962 prefix)
// ============================================
type AdvisorPhoneInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
};

export function AdvisorPhoneInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = true,
}: AdvisorPhoneInputProps<T>) {
  const { t, i18n } = useTranslation();
  const isRTL = I18nManager.isRTL;
  const isAr = i18n.language === 'ar';

  const validatePhone = (value: string) => {
    if (!required && !value) return true;
    const cleanNumber = value.replace(/[^0-9]/g, '');
    const jordanPattern = /^7[0-9]{8}$/;
    if (!jordanPattern.test(cleanNumber)) {
      return t('validation.validJordanianNumber');
    }
    return true;
  };

  const fontFamily = isAr ? typography.fontFamily.regular : typography.fontFamily.regular;
  const prefixFontFamily = isAr ? typography.fontFamily.semiBold : typography.fontFamily.semiBold;

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        required: required ? t('validation.phoneRequired') : undefined,
        validate: validatePhone,
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View>
          <Text 
            variant="label"
            color={error ? 'error' : 'textPrimary'}
            style={[styles.phoneLabel, isRTL && styles.labelRTL]}
          >
            {label || t('schoolSignup.advisorPhone')}
          </Text>
          <View style={[styles.phoneRow, error && styles.inputError]}>
            <Text style={[styles.prefix, { fontFamily: prefixFontFamily }]}>+962</Text>
            <View style={styles.phoneDivider} />
            <RNTextInput
              style={[
                styles.phoneInput, 
                isRTL && styles.inputRTL,
                { fontFamily }
              ]}
              onChangeText={(text) => {
                let cleaned = text.replace(/[^0-9]/g, '');
                if (cleaned.length > 9) cleaned = cleaned.slice(0, 9);
                onChange(cleaned);
              }}
              value={value || ''}
              placeholder={placeholder || "7X XXX XXXX"}
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
          {error && (
            <Text 
              variant="caption"
              color="error"
              style={[styles.error, isRTL && styles.errorRTL]}
            >
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  label: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  labelRTL: {
    textAlign: 'right',
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
    color: colors.textPrimary,
    height: '100%',
  },
  inputRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  eyeIcon: {
    width: 20,
    height: 20,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    marginTop: spacing.xs,
  },
  errorRTL: {
    textAlign: 'right',
  },
  phoneLabel: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
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
    color: colors.primary,
  },
  phoneDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  phoneInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    height: '100%',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
});