import React from 'react';
import { Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { theme } from '@/theme';

type Pose = 'waving' | 'reading' | 'rafeeq' | 'celebrating' | 'rafeeqa' | 'splash';
type Size = 'sm' | 'md' | 'lg';

type Props = {
    pose: Pose;
    size?: Size;
};

const poseImages: Record<Pose, ImageSourcePropType> = {
    waving: require('@/assets/images/mascot/rafeeq_clabbing.png'),
    reading: require('@/assets/images/mascot/rafeeq_clabbing.png'),
    rafeeq: require('@/assets/images/mascot/rafeeq_clabbing.png'),
    celebrating: require('@/assets/images/mascot/rafeeq_clabbing.png'),
    rafeeqa: require('@/assets/images/mascot/rafeeqa.png'),
    splash: require('@/assets/images/mascot/splash-icon.png'),
};

const sizeMap: Record<Size, number> = {
    sm: 50,
    md: 100,
    lg: 150,
};

export default function Mascot({ pose, size = 'md' }: Props) {
    const dimension = sizeMap[size];

    return (
        <Image
            source={poseImages[pose]}
            style={[styles.image, { width: dimension, height: dimension }]}
            resizeMode="contain"
        />
    );
}

const styles = StyleSheet.create({
    image: {
        backgroundColor: theme.colors.transparent,
    },
});