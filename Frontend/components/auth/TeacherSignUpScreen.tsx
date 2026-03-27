import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { PenguinMascot } from '../../components/common/PenguinMascot';
import { UserRole } from '../../types/user';

interface TeacherSignUpScreenProps {
  role: UserRole.TEACHER | UserRole.ADMIN;
  onSignUp: (data: TeacherSignUpData) => void;
  onBack: () => void;
  onLogin: () => void;
}

interface TeacherSignUpData {
  schoolName: string;
  schoolId: string;
  advisorName?: string;
  advisorId?: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export const TeacherSignUpScreen: React.FC<TeacherSignUpScreenProps> = ({
  role,
  onSignUp,
  onBack,
  onLogin,
}) => {
  const [schoolName, setSchoolName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [advisorName, setAdvisorName] = useState('');
  const [advisorId, setAdvisorId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Partial<TeacherSignUpData>>({});
  const [loading, setLoading] = useState(false);

  const isTeacher = role === UserRole.TEACHER;
  const title = isTeacher ? 'Teacher' : 'School Administrator';

  const validate = (): boolean => {
    const newErrors: Partial<TeacherSignUpData> = {};

  
    if (!schoolName.trim()) {
      newErrors.schoolName = 'School name is required';
    }

  
    if (!schoolId.trim()) {
      newErrors.schoolId = 'School ID is required';
    }


    if (isTeacher) {
      if (!advisorName?.trim()) {
        newErrors.advisorName = 'Advisor name is required';
      }
      if (!advisorId?.trim()) {
        newErrors.advisorId = 'Advisor National ID is required';
      }
    }


    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }


    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }


    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await onSignUp({
        schoolName,
        schoolId,
        advisorName: isTeacher ? advisorName : undefined,
        advisorId: isTeacher ? advisorId : undefined,
        phone,
        password,
        confirmPassword,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Welcome to RAFEEQ</Text>
          <Text style={styles.subtitle}>
            Set up your child profile to manage student support, monitor progress, and communicate effectively with parents
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionLabel}>School Details</Text>

          <Input
            label="School Name"
            placeholder="Enter school name"
            value={schoolName}
            onChangeText={(text) => {
              setSchoolName(text);
              setErrors({ ...errors, schoolName: undefined });
            }}
            error={errors.schoolName}
            required
          />

          <Input
            label="School ID"
            placeholder="Enter school ID"
            value={schoolId}
            onChangeText={(text) => {
              setSchoolId(text);
              setErrors({ ...errors, schoolId: undefined });
            }}
            error={errors.schoolId}
            required
          />

          {isTeacher && (
            <>
              <Input
                label="Advisor Name"
                placeholder="Enter advisor name"
                value={advisorName}
                onChangeText={(text) => {
                  setAdvisorName(text);
                  setErrors({ ...errors, advisorName: undefined });
                }}
                error={errors.advisorName}
                required
              />

              <Input
                label="Advisor National ID"
                placeholder="Enter advisor national ID"
                value={advisorId}
                onChangeText={(text) => {
                  setAdvisorId(text);
                  setErrors({ ...errors, advisorId: undefined });
                }}
                error={errors.advisorId}
                keyboardType="number-pad"
                required
              />
            </>
          )}

          <View style={styles.divider} />

          <Input
            label="Phone number"
            placeholder="+962 XX XXX XXXX"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setErrors({ ...errors, phone: undefined });
            }}
            error={errors.phone}
            keyboardType="phone-pad"
            required
          />

          <Input
            label="Create password"
            placeholder="Enter password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: undefined });
            }}
            error={errors.password}
            secureTextEntry
            required
          />

          <Input
            label="Confirm password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setErrors({ ...errors, confirmPassword: undefined });
            }}
            error={errors.confirmPassword}
            secureTextEntry
            required
          />

          <Button
            title="Continue"
            onPress={handleSignUp}
            loading={loading}
            fullWidth
            style={styles.submitButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text style={styles.footerLink} onPress={onLogin}>
              Log in
            </Text>
          </Text>
        </View>

        <View style={styles.languageSelector}>
          <Text style={styles.languageText}>🌐 English (US)</Text>
        </View>

        <View style={styles.links}>
          <TouchableOpacity>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.linkSeparator}>•</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * 1.5,
  },
  form: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  footerLink: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
  },
  languageSelector: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  languageText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textMuted,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
  },
  linkSeparator: {
    marginHorizontal: spacing.sm,
    color: colors.textMuted,
  },
});