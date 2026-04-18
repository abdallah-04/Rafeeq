import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/modal/shared/Text';
import { theme } from '@/theme';

const { colors, spacing, typography, radius } = theme;

interface FooterProps {
  onPrivacyPress?: () => void;
  onTermsPress?: () => void;
}

export default function Footer({
  onPrivacyPress,
  onTermsPress,
}: FooterProps) {

  const { i18n } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  const currentLanguage =
    i18n.language === 'en' ? 'English (US)' : 'العربية';

  return (
    <View style={styles.container}>

      {/* Language Button */}
      <TouchableOpacity onPress={() => setShowModal(true)}>
        <Text style={styles.link}>🌐 {currentLanguage} ∨</Text>
      </TouchableOpacity>

      {/* Links */}
      <View style={styles.linksRow}>
        <TouchableOpacity onPress={onPrivacyPress}>
          <Text style={styles.link}>Privacy Policy</Text>
        </TouchableOpacity>

        <Text style={styles.dot}>·</Text>

        <TouchableOpacity onPress={onTermsPress}>
          <Text style={styles.link}>Terms of Service</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            <Text style={styles.title}>Select Language</Text>

            {/* English */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                i18n.changeLanguage('en');
                setShowModal(false);
              }}
            >
              <Text style={styles.optionText}>English 🇺🇸</Text>
              {i18n.language === 'en' && <Text>✔</Text>}
            </TouchableOpacity>

            {/* Arabic */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                i18n.changeLanguage('ar');
                setShowModal(false);
              }}
            >
              <Text style={styles.optionText}>العربية 🇯🇴</Text>
              {i18n.language === 'ar' && <Text>✔</Text>}
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },

  linksRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  link: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },

  dot: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  modalContent: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },

  title: {
    fontSize: typography.fontSize.base,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },

  optionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
});