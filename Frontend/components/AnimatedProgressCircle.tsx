import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

interface Props {
  progress: number;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function AnimatedProgressCircle({
  progress,
  size = 88,
  color = '#508DF7',
  strokeWidth = 7,
}: Props) {
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withTiming(progress, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => {
    const pct = interpolate(anim.value, [0, 100], [0, 100]);
    return {
      // visual fill: we simulate arc by scaling a coloured overlay
      // Simple approach: border-based circle that animates opacity+scale
      opacity: interpolate(pct, [0, 10, 100], [0, 1, 1]),
    };
  });

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(anim.value, [0, 30, 100], [0, 0.6, 1]),
  }));

  const fontSize = size < 70 ? 12 : 16;
  const radius = size / 2;

  return (
    <View
      style={[
        s.container,
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: strokeWidth,
          borderColor: color + '30',
        },
      ]}
    >
      {/* Animated coloured ring overlay */}
      <Animated.View
        style={[
          s.ring,
          fillStyle,
          {
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: radius,
            borderWidth: strokeWidth,
            borderColor: color,
          },
        ]}
      />
      <Animated.Text
        style={[s.label, labelStyle, { fontSize, color }]}
      >
        {progress}%
      </Animated.Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF4FF',
  },
  ring: {
    position: 'absolute',
  },
  label: {
    fontFamily: 'Lexend_700Bold',
    position: 'absolute',
  },
});
