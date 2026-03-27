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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { PenguinMascot } from '../../components/common/PenguinMascot';
import { UserRole } from '../../types/user';

export default function LoginScreen() {
  const router = useRouter();
  // Get the role from the route parameters (defaults to PARENT if none provided)
  const params = useLocalSearchParams();
  const role = (params.role as UserRole) || UserRole.PARENT;

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getRoleTitle = () => {
    switch (role) {
      case UserRole.PARENT:
        return 'Parent';
      case UserRole.TEACHER:
        return 'Teacher';
      case UserRole.ADMIN:
        return 'School Administrator';
      default:
        return 'User';
    }
  };

  const validate = (): boolean => {
    const newErrors: { phone?: string; password?: string } = {};

    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.length < 10) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // MOCK LOGIN LOGIC: Replace this with your actual API/Auth call later
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      // Navigate to the main app after successful login
      // router.replace('/(main)/home'); 
      console.log('Logged in successfully!');
    } catch (err: any) {
      setErrors({
        password: err.message || 'Invalid credentials',
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
        {/* Changed to router.back() */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.logo}>RAFEEQ</Text>
          <Text style={styles.logoArabic}>رفيق</Text>
        </View>

        <View style={styles.mascotContainer}>
          <PenguinMascot variant="welcome" size="large" />
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to RAFEEQ</Text>
          <Text style={styles.welcomeSubtitle}>
            Log in as {getRoleTitle()}
          </Text>
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
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: undefined });
            }}
            error={errors.password}
            secureTextEntry={!showPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            }
          />

          <TouchableOpacity 
            style={styles.forgotPassword}
            // Navigate to forgot password screen when ready
            onPress={() => console.log('Forgot password pressed')} 
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            title="Log in"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Sign in with Email"
            onPress={() => {}}
            variant="outline"
            fullWidth
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            {/* Navigates back to TypeSelection to start sign up flow */}
            <Text 
              style={styles.footerLink} 
              onPress={() => router.push('/TypeSelectionScreen')}
            >
              Sign up
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
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  logoArabic: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  mascotContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  welcomeTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: spacing.xl,
  },
  eyeIcon: {
    fontSize: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  loginButton: {
    marginBottom: spacing.lg,
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