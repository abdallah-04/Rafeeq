import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { colors } from '@/constants';

type Props = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
};

export default function CustomInput({
  placeholder,
  value,
  onChangeText,
}: Props) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
});