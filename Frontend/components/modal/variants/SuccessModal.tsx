import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { SuccessVariant } from '../ModalProvider';
import { theme } from '@/theme';

interface Props {
  variant?: SuccessVariant;
  taskName?: string;
  date?: string;
  onHide: () => void;
}

const VARIANT_KEYS: Record<
  SuccessVariant,
  { title: string; message: string; btnLabel: string; autoClose?: boolean }
> = {
  greatJob:       { title: 'modal.success.greatJob.title',       message: 'modal.success.greatJob.message',       btnLabel: 'modal.success.btn.okay' },
  reportAdded:    { title: 'modal.success.reportAdded.title',    message: 'modal.success.reportAdded.message',    btnLabel: 'modal.success.btn.okay' },
  hwAdded:        { title: 'modal.success.hwAdded.title',        message: 'modal.success.hwAdded.message',        btnLabel: 'modal.success.btn.okay' },
  noteAdded:      { title: 'modal.success.noteAdded.title',      message: 'modal.success.noteAdded.message',      btnLabel: 'modal.success.btn.okay' },
  saved:          { title: 'modal.success.saved.title',          message: 'modal.success.saved.message',          btnLabel: 'modal.success.btn.okay' },
  downloadDone:   { title: 'modal.success.downloadDone.title',   message: 'modal.success.downloadDone.message',   btnLabel: 'modal.success.btn.okay' },
  passwordUpdate: { title: 'modal.success.passwordUpdate.title', message: 'modal.success.passwordUpdate.message', btnLabel: 'modal.success.btn.okay' },
  submitSuccess:  { title: 'modal.success.submitSuccess.title',  message: 'modal.success.submitSuccess.message',  btnLabel: 'modal.success.btn.okay' },
  childAdded:     { title: 'modal.success.childAdded.title',     message: 'modal.success.childAdded.message',     btnLabel: 'modal.success.btn.okay', autoClose: true },
};

export default function SuccessModal({
  variant = 'saved',
  taskName,
  date,
  onHide,
}: Props) {
  const { t } = useTranslation();
  const keys = VARIANT_KEYS[variant];

  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!keys.autoClose) return;

    setCountdown(3);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [variant, keys.autoClose]);

  useEffect(() => {
    if (!keys.autoClose) return;
    if (countdown <= 0) {
      onHide();
    }
  }, [countdown, keys.autoClose]);

  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>✓</Text>
      </View>

      <Text style={styles.title}>{t(keys.title)}</Text>

      {variant === 'greatJob' && taskName && date ? (
        <View style={styles.greatJobInfo}>
          <Text style={styles.greatJobLine}>📋 {taskName}</Text>
          <Text style={styles.greatJobLine}>📅 {date}</Text>
        </View>
      ) : keys.autoClose ? (
        <Text style={styles.message}>
          {t(keys.message, { seconds: countdown })}
        </Text>
      ) : (
        <Text style={styles.message}>{t(keys.message)}</Text>
      )}

      {!keys.autoClose && (
        <TouchableOpacity style={styles.btn} onPress={onHide} activeOpacity={0.8}>
          <Text style={styles.btnText}>{t(keys.btnLabel)}</Text>
        </TouchableOpacity>
      )}

      {keys.autoClose && (
        <View style={styles.countdownWrapper}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius['2xl'],
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 28,
    alignItems: 'center',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    color: theme.colors.textWhite,
    fontSize: 30,
    fontWeight: theme.typography.fontWeight.bold,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: theme.typography.fontFamily.bold,
  },
  message: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    fontFamily: theme.typography.fontFamily.regular,
  },
  greatJobInfo: {
    gap: 6,
    marginBottom: 24,
    alignItems: 'center',
  },
  greatJobLine: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.regular,
  },
  btn: {
    backgroundColor: theme.colors.buttonPrimary,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.sm,
    width: '100%',
    alignItems: 'center',
    shadowColor: theme.colors.buttonPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnText: {
    color: theme.colors.textWhite,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily.bold,
  },
  countdownWrapper: {
    marginTop: theme.spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success,
    fontFamily: theme.typography.fontFamily.bold,
  },
});