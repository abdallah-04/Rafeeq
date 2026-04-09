import React from 'react'
import { Modal, View, StyleSheet } from 'react-native'
import { Text } from '@/components/modal/shared/Text'
import { Button } from '@/components/modal/shared/Button'
import { theme } from '@/theme'

type Props = {
  visible: boolean
  hwName?: string
  onClose: () => void
}

export default function SubmitSuccessModal({ visible, hwName = 'H.W 3', onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>

          <Text style={styles.title}>Submit successfully</Text>
          <Text style={styles.subtitle}>{hwName} has been Submited</Text>

          <Button label="Okay" onPress={onClose} variant="primary" style={styles.btn} />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: theme.colors.white,
    width: '75%',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkIcon: {
    color: theme.colors.white,
    fontSize: 30,
    fontFamily: 'Lexend_700Bold',
  },
  title: {
    fontFamily: 'Lexend_700Bold',
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  btn: {
    width: '100%',
    borderRadius: 50,
  },
})
