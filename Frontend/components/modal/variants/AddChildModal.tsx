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

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleOkay() {
    if (!validate(nationalId)) return;

    setLoading(true);
    try {
      // TODO: replace with real API call when backend is ready
      // await addChildByNationalId(nationalId);
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
          placeholderTextColor="#94A3B8"
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
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.btnText}>{t('modal.addChild.btn.okay')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#334155',
    fontFamily: 'Lexend',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: 'Lexend',
  },
  inputWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 6,
    // subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  input: {
    fontSize: 15,
    color: '#334155',
    fontFamily: 'Lexend',
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 12,
    marginLeft: 4,
    fontFamily: 'Lexend',
  },
  btn: {
    backgroundColor: '#508DF7',
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#508DF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Lexend',
  },
});