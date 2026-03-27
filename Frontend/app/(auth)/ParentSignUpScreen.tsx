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
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { PenguinMascot } from '../../components/common/PenguinMascot';

interface ParentSignUpData {
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function ParentSignUpScreen() {
  const router = useRouter();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Partial<ParentSignUpData>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<ParentSignUpData> = {};

    // Phone validation
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
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
      // MOCK SIGN UP LOGIC: Replace with your actual API call later
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Parent Sign Up Successful:', { phone });
      
      // Navigate to main app or OTP screen after success
      // router.replace('/(main)/home');
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
        {/* Changed to router.back() */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Welcome to RAFEEQ</Text>
          <Text style={styles.subtitle}>
            Set up your child profile to manage student support, monitor progress, and communicate effectively with parents
          </Text>
        </View>

        <View style={styles.mascotContainer}>
          <PenguinMascot variant="welcome" size="medium" />
          <View style={styles.welcomeBubble}>
            <Text style={styles.welcomeText}>Welcome back !</Text>
          </View>
        </View>

        <View style={styles.form}>
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

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Sign up with Email"
            onPress={() => {}}
            variant="outline"
            fullWidth
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            {/* Changed to navigate to LoginScreen */}
            <Text style={styles.footerLink} onPress={() => router.push('/LoginScreen')}>
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
}

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
  mascotContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  welcomeBubble: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  welcomeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: spacing.xl,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.textMuted,
    marginHorizontal: spacing.md,
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