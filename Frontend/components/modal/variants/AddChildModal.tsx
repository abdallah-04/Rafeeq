import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useModal } from '../ModalProvider';
import { theme } from '@/theme';

interface Props {
  onHide: () => void;
}

export default function AddChildModal({ onHide }: Props) {
  const { t } = useTranslation();
  const { show } = useModal();

  const [nationalId, setNationalId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(id: string): boolean {
    if (!id.trim()) {
      setError(t('modal.addChild.error.empty'));
      return false;
    }
    if (!/^\d{10}$/.test(id.trim())) {
      setError(t('modal.addChild.error.invalid'));
      return false;
    }
    setError('');
    return true;
  }

  async function handleOkay() {
    if (!validate(nationalId)) return;

    setLoading(true);
    try {
      await new Promise(res => setTimeout(res, 600));
      show('success', { variant: 'childAdded' });
    } catch {
      show('error', { variant: 'invalidId' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('modal.addChild.title')}</Text>
        <TouchableOpacity onPress={onHide} style={styles.closeBtn} hitSlop={12}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>{t('modal.addChild.subtitle')}</Text>

      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <TextInput
          style={styles.input}
          placeholder={t('modal.addChild.placeholder')}
          placeholderTextColor={theme.colors.textMuted}
          value={nationalId}
          onChangeText={text => {
            setNationalId(text);
            if (error) setError('');
          }}
          keyboardType="number-pad"
          maxLength={10}
          returnKeyType="done"
          onSubmitEditing={handleOkay}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={handleOkay}
        activeOpacity={0.8}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.textWhite} />
        ) : (
          <Text style={styles.btnText}>{t('modal.addChild.btn.okay')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius['2xl'],
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 28,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily.regular,
  },
  inputWrapper: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: 6,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  input: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.regular,
    padding: 0,
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
    marginLeft: 4,
    fontFamily: theme.typography.fontFamily.regular,
  },
  btn: {
    backgroundColor: theme.colors.buttonPrimary,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.sm,
    width: '100%',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    shadowColor: theme.colors.buttonPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: theme.colors.textWhite,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily.bold,
  },
});