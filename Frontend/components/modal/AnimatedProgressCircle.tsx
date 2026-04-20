/**
 * AnimatedProgressCircle.tsx
 * Animated circular progress indicator using React Native Animated API.
 * Replaces the static circle in Student_dashboard.tsx and notes.tsx.
 *
 * Usage:
 *   <AnimatedProgressCircle progress={74} size={88} color="#508DF7" />
 *   <AnimatedProgressCircle progress={62} size={64} color="#FFB84C" />
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from '@/components/RNText';
import Svg, { Circle } from 'react-native-svg';

// ─── Props ─────────────────────────────────────────────────────
interface AnimatedProgressCircleProps {
  /** 0–100 */
  progress: number;
  /** outer diameter in px — default 88 */
  size?: number;
  /** stroke color — default #508DF7 */
  color?: string;
  /** background track color — default #EEF4FF */
  trackColor?: string;
  /** stroke width — default 7 */
  strokeWidth?: number;
  /** font size for the % label */
  fontSize?: number;
}

// ─── Animated Circle wrapper ───────────────────────────────────
// react-native-svg doesn't accept Animated.Value directly,
// so we create an AnimatedCircle via createAnimatedComponent.
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function AnimatedProgressCircle({
  progress,
  size = 88,
  color = '#508DF7',
  trackColor = '#EEF4FF',
  strokeWidth = 7,
  fontSize = 16,
}: AnimatedProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animated value drives strokeDashoffset
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Interpolate 0→progress on mount with a spring feel
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 900,
      useNativeDriver: false, // SVG props can't use native driver
    }).start();
  }, [progress]);

  // strokeDashoffset = circumference * (1 - pct/100)
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  // Animated label
  const animatedLabel = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animatedLabel, {
      toValue: progress,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc — starts from top (rotate -90°) */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Label */}
      <AnimatedLabel
        animatedValue={animatedLabel}
        color={color}
        fontSize={fontSize}
      />
    </View>
  );
}

// ─── Animated label helper ─────────────────────────────────────
function AnimatedLabel({
  animatedValue,
  color,
  fontSize,
}: {
  animatedValue: Animated.Value;
  color: string;
  fontSize: number;
}) {
  // We read the native value and update a state for the text
  const [display, setDisplay] = React.useState(0);

  useEffect(() => {
    const id = animatedValue.addListener(({ value }) => {
      setDisplay(Math.round(value));
    });
    return () => animatedValue.removeListener(id);
  }, [animatedValue]);

  return (
    <Text style={{ fontFamily: 'Lexend_700Bold', fontSize, color }}>
      {display}%
    </Text>
  );
}

// ─── Fallback: pure-JS circle (no SVG dependency) ─────────────
/**
 * Use this if react-native-svg is not yet installed.
 * Visually equivalent using border trick.
 */
export function SimpleProgressCircle({
  progress,
  size = 88,
  color = '#508DF7',
  trackColor = '#EEF4FF',
  strokeWidth = 7,
  fontSize = 16,
}: AnimatedProgressCircleProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const [display, setDisplay] = React.useState(0);
  useEffect(() => {
    const id = animatedValue.addListener(({ value }) => setDisplay(Math.round(value)));
    return () => animatedValue.removeListener(id);
  }, [animatedValue]);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: trackColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: strokeWidth,
        borderColor: color,
      }}
    >
      <Text style={{ fontFamily: 'Lexend_700Bold', fontSize, color }}>
        {display}%
      </Text>
    </View>
  );
}