import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../constants';
import { Button } from '../../components/common/Button';
import { PenguinMascot } from '../../components/common/PenguinMascot';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  mascotVariant: 'welcome' | 'learning' | 'default';
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Helping every child\nlearn and grow',
    description: 'Rafeeq supports children with learning disabilities through a personalized journey built with care, follow-up, and progress tracking.',
    mascotVariant: 'welcome',
  },
  {
    id: '2',
    title: 'Stay connected with\nschool and family',
    description: 'Rafeeq teachers can write daily reports that help families track their child\'s progress, tasks, and close collaboration.',
    mascotVariant: 'learning'
  },
  {
    id: '3',
    title: 'A learning path\nmade for each child',
    description: 'Rafeeq helps create a clear year-long roadmap with personalized activities, evaluations, and guidance tailored to every child\'s needs.\'',
    mascotVariant: 'default'
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    } else {
      // Navigate to the Type Selection screen when onboarding is complete
      router.push('/TypeSelectionScreen');
    }
  };

  const handleSkip = () => {
    // Navigate directly to the Login screen if they skip
    router.push('/LoginScreen');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={styles.header}>
        <Text style={styles.logo}>RAFEEQ</Text>
        <Text style={styles.logoArabic}>رفيق</Text>
      </View>

      <View style={styles.mascotContainer}>
        <PenguinMascot variant={item.mascotVariant} size="large" />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === currentIndex && styles.paginationDotActive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        scrollEnabled={true}
      />

      <View style={styles.footer}>
        {renderPagination()}

        <Button
          title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          fullWidth
        />

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>
            {currentIndex === slides.length - 1 ? 'Login' : 'Skip'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  logoArabic: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  mascotContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing['2xl'],
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: typography.fontSize['2xl'] * 1.3,
  },
  description: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.5,
    paddingHorizontal: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderMedium,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  skipButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  skipText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
});