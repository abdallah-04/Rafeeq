import React from 'react';
import { Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { colors } from '@/constants';
import "@/assets/images/mascot/rafeeq.png"

type Pose = 'waving' | 'reading' | 'Rafeeq' | 'celebrating' | 'Rafeeqa' | 'spalsh';
type Size = 'sm' | 'md' | 'lg';

type Props = {
    pose: Pose;
    size?: Size;
};

const poseImages: Record<Pose, ImageSourcePropType> = {
    waving: require('@/assets/images/mascot/rafeeq_waving.png'),
    reading: require('@/assets/images/mascot/rafeeq_reading.png'),
    Rafeeq: require('@/assets/images/mascot/rafeeq.png'),
    celebrating: require('@/assets/images/mascot/rafeeq_clabbing.png'),
    Rafeeqa: require('@/assets/images/mascot/rafeeqa.png'),
    spalsh: require('@/assets/images/mascot/splash-icon.png'),
};

const sizeMap: Record<Size, number> = {
    sm: 50,
    md: 100,
    lg: 150,
};

export default function PenguinMascot({ pose, size = 'md' }: Props) {
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
        backgroundColor: colors.transparent,
    },
});