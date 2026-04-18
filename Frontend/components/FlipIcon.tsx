import React from 'react';
import { View, I18nManager } from 'react-native';

interface FlipIconProps {
  children: React.ReactNode;
  /** Set to false to disable flipping (for non-directional icons) */
  flip?: boolean;
}

/**
 * Mirrors its children horizontally in RTL mode.
 * Use for directional icons: back arrows, forward chevrons, send buttons.
 * Do NOT use for non-directional icons: home, settings, bell, bookmark, etc.
 */
export default function FlipIcon({ children, flip = true }: FlipIconProps) {
  const shouldFlip = flip && I18nManager.isRTL;
  return (
    <View style={shouldFlip ? { transform: [{ scaleX: -1 }] } : undefined}>
      {children}
    </View>
  );
}
