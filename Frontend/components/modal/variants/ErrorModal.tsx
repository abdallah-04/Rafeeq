// components/modal/variants/ErrorModal.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ErrorVariant } from '../ModalProvider';

interface Props {
  variant?: ErrorVariant;
  onHide: () => void;
}
const VARIANT_KEYS: Record<ErrorVariant, { title: string; message: string; btnLabel: string }> = {
  incompleteInfo:  { title: 'modal.error.incompleteInfo.title',  message: 'modal.error.incompleteInfo.message',  btnLabel: 'modal.error.btn.okay'    },
  invalidCode:     { title: 'modal.error.invalidCode.title',     message: 'modal.error.invalidCode.message',     btnLabel: 'modal.error.btn.tryAgain' },
  invalidId:       { title: 'modal.error.invalidId.title',       message: 'modal.error.invalidId.message',       btnLabel: 'modal.error.btn.okay'    },
  passwordMismatch:{ title: 'modal.error.passwordMismatch.title', message: 'modal.error.passwordMismatch.message',btnLabel: 'modal.error.btn.okay'    },
  incorrectNumber: { title: 'modal.error.incorrectNumber.title',  message: 'modal.error.incorrectNumber.message', btnLabel: 'modal.error.btn.okay'    },
  invalidInfo:     { title: 'modal.error.invalidInfo.title',      message: 'modal.error.invalidInfo.message',     btnLabel: 'modal.error.btn.okay'    },
};

export default function ErrorModal({ variant = 'invalidInfo', onHide }: Props) {
  const { t } = useTranslation();
  const keys = VARIANT_KEYS[variant];

  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>!</Text>
      </View>

      <Text style={styles.title}>{t(keys.title)}</Text>

      <Text style={styles.message}>{t(keys.message)}</Text>

      <TouchableOpacity style={styles.btn} onPress={onHide} activeOpacity={0.8}>
        <Text style={styles.btnText}>{t(keys.btnLabel)}</Text>
      </TouchableOpacity>
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
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
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
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
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
});