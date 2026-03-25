import React from 'react';
import {
  View,
  ScrollView,
  ImageBackground,
  StyleSheet,
  StatusBar,
  Dimensions,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/Colors';
const { width } = Dimensions.get('window');

const AmmanCity = require('../assets/images/city-illustration.png');

interface ThemedViewProps
{
    children ?: React.ReactNode;
    scroll ?: boolean;
    showAmman ?: boolean;
    style ?: StyleProp<ViewStyle>
    contentStyle ?: StyleProp<ViewStyle>;
    noSafeArea ?: boolean;
}

export default function ThemedView({
  children,
  scroll = false,
  showAmman = true,
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

            {showAmman && (
              <View style={styles.cityWrapper} pointerEvents="none">
                <ImageBackground
                  source={AmmanCity}
                  style={styles.cityImage}
                  resizeMode="cover"
                />
              </View>
            )}
          </ScrollView>
        ) : (
    <View style={[styles.flex, style]}>
  <   View style={styles.contentLayer}>
    {children}
  </View>

  {showAmman && (
    <View style={styles.cityAbsolute} pointerEvents="none">
      <ImageBackground
        source={AmmanCity}
        style={styles.cityImage}
        resizeMode="cover"
      />
              </View>
            )}
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
  cityWrapper: {
    width: '100%',
    height: 200,
    marginTop: 16,
  },
  cityAbsolute: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: width,
    height: 190,
    opacity: 0.7,
    zIndex: 0
  },
  cityImage: {
    width: '100%',
    height: '100%',
  },
  contentLayer: {
  flex: 1,
  zIndex: 1,
},
});