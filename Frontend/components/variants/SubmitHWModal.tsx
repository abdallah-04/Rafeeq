import React, { useState } from 'react'
import { Modal, View, TouchableOpacity, TextInput as RNTextInput, StyleSheet } from 'react-native'
import { Text } from '@/components/modal/shared/Text'
import { Button } from '@/components/modal/shared/Button'
import { theme } from '@/theme'

type Props = {
  visible: boolean
  onSubmit: () => void
}

export default function SubmitHWModal({ visible, onSubmit }: Props) {
  const [hwTitle, setHwTitle] = useState('')
  const [note, setNote] = useState('')

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.label}>H.W Title:</Text>
          <RNTextInput
            style={styles.titleInput}
            value={hwTitle}
            onChangeText={setHwTitle}
            placeholderTextColor={theme.colors.textMuted}
          />

          <Text style={styles.label}>Any Note :</Text>
          <RNTextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Details..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.uploadBox}>
            <Text style={styles.uploadIcon}>☁</Text>
            <Text style={styles.uploadText}>Tap to upload</Text>
          </TouchableOpacity>

          <Button label="Submit" onPress={onSubmit} variant="primary" style={styles.submitBtn} />
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
    width: '85%',
    borderRadius: 20,
    padding: 20,
  },
  label: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  titleInput: {
    borderWidth: 1.5,
    borderColor: '#F9A8D4',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 14,
    backgroundColor: '#FFF0F6',
    color: theme.colors.textPrimary,
    fontFamily: 'Lexend_400Regular',
  },
  noteInput: {
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    height: 80,
    paddingHorizontal: 12,
    paddingTop: 10,
    marginBottom: 14,
    backgroundColor: '#EFF6FF',
    color: theme.colors.textPrimary,
    fontFamily: 'Lexend_400Regular',
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    borderRadius: 14,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    gap: 4,
  },
  uploadIcon: {
    fontSize: 24,
    color: theme.colors.primary,
  },
  uploadText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontSize.sm,
  },
  submitBtn: {
    borderRadius: 50,
  },
})
