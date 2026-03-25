import { TouchableOpacity, StyleSheet } from 'react-native';
import ThemedText from './ThemedText';
import { colors } from '@/constants/Colors';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean
  radius?: number;
}

export default function PrimaryButton({
  label,
  onPress,
  color = colors.primary,
  disabled = false,
  radius = 24,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: color, borderRadius: radius },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <ThemedText variant="button" color="white" center>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
});