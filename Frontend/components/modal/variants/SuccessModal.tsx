import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { SuccessVariant } from '../ModalProvider';

interface Props {
  variant?: SuccessVariant;
  taskName?: string;  // used by 'greatJob'
  date?: string;      // used by 'greatJob'
  onHide: () => void;
}

const VARIANT_KEYS: Record<
  SuccessVariant,
  { title: string; message: string; btnLabel: string; autoClose?: boolean }
> = {
  greatJob:       { title: 'modal.success.greatJob.title',       message: 'modal.success.greatJob.message',       btnLabel: 'modal.success.btn.okay'      },
  reportAdded:    { title: 'modal.success.reportAdded.title',    message: 'modal.success.reportAdded.message',    btnLabel: 'modal.success.btn.okay'      },
  hwAdded:        { title: 'modal.success.hwAdded.title',        message: 'modal.success.hwAdded.message',        btnLabel: 'modal.success.btn.okay'      },
  noteAdded:      { title: 'modal.success.noteAdded.title',      message: 'modal.success.noteAdded.message',      btnLabel: 'modal.success.btn.okay'      },
  saved:          { title: 'modal.success.saved.title',          message: 'modal.success.saved.message',          btnLabel: 'modal.success.btn.okay'      },
  downloadDone:   { title: 'modal.success.downloadDone.title',   message: 'modal.success.downloadDone.message',   btnLabel: 'modal.success.btn.okay'      },
  passwordUpdate: { title: 'modal.success.passwordUpdate.title', message: 'modal.success.passwordUpdate.message', btnLabel: 'modal.success.btn.okay'      },
  submitSuccess:  { title: 'modal.success.submitSuccess.title',  message: 'modal.success.submitSuccess.message',  btnLabel: 'modal.success.btn.okay'      },
  childAdded:     { title: 'modal.success.childAdded.title',     message: 'modal.success.childAdded.message',     btnLabel: 'modal.success.btn.okay', autoClose: true },
};

export default function SuccessModal({ variant = 'saved', taskName, date, onHide }: Props) {
  const { t } = useTranslation();
  const keys = VARIANT_KEYS[variant];

  const [countdown, setCountdown] = React.useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!keys.autoClose) return;
    setCountdown(3);

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          onHide();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [variant]); 

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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Lexend',
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    fontFamily: 'Lexend',
  },
  greatJobInfo: {
    gap: 6,
    marginBottom: 24,
    alignItems: 'center',
  },
  greatJobLine: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'Lexend',
  },
  btn: {
    backgroundColor: '#508DF7',
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#508DF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Lexend',
  },
  countdownWrapper: {
    marginTop: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#22C55E',
    fontFamily: 'Lexend',
  },
});