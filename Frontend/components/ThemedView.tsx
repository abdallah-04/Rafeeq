import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

interface ThemedViewProps {
  children?: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  noSafeArea?: boolean;
}

export default function ThemedView({
  children,
  scroll = false,
  style,
  contentStyle,
  noSafeArea = false,
}: ThemedViewProps) {
  const Wrapper = noSafeArea ? View : SafeAreaView;

  return (
    <Wrapper style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCF8F1" />

      <View style={styles.background}>
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.scrollContent, contentStyle]}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.content, style]}>
              {children}
            </View>
          </ScrollView>
        ) : (
          <View style={[styles.flex, style]}>
            <View style={styles.contentLayer}>
              {children}
            </View>
          </View>
        )}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentLayer: {
    flex: 1,
    zIndex: 1,
  },
});