import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import React from 'react';
import PrimaryButton from '@/components/modal/shared/blueButton';   
import SecondaryButton from '@/components/modal/shared/otherbutton';
import { colors } from '@/constants';

const SLIDES = [
    {
        title: 'Helping every child\nlearn and grow',
        desc: 'Rafeeq supports children with learning difficulties through a personalized journey built with care.',
        image: require('@/assets/images/mascot/rafeeq_reading.png'),
    },
    {
        title: 'Stay connected with\nschool and family',
        desc: 'Parents and teachers can work together in one place to follow the child\'s progress step by step.',
        image: require('@/assets/images/mascot/rafeeq_reading.png'),
    },
    {
        title: 'A learning path\nmade for each child',
        desc: 'Rafeeq helps create a clear and supportive experience with activities, evaluations, and guidance.',
        image: require('@/assets/images/mascot/rafeeq_reading.png'),
    },
];

export default function OnboardingScreen() {
    const [index, setIndex] = useState(0);
    const isLast = index === SLIDES.length - 1;

    const next = () => {
        if (isLast) router.replace('/welcome');
        else setIndex(index + 1);
    };

    const skip = () => router.replace('/welcome');

    const slide = SLIDES[index];

    return (

        <View style={styles.container}>
        {/* Header */}
        <Text style={styles.brand}>RAFEEQ</Text>
        <Text style={styles.brandAr}>رفيق</Text>

        {/* Text */}
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.desc}>{slide.desc}</Text>

        {/* Illustration */}
        <View style={styles.imageBox}>
            <Image source={slide.image} style={styles.image} resizeMode="contain" />
        </View>

        {/* Dots */}
        <View style={styles.dots}>
            {SLIDES.map((_, i) => (
            <View
                key={i}
                style={[styles.dot, i === index && styles.dotActive]}
            />
            ))}
        </View>

        {/* Buttons */}
        <PrimaryButton title={isLast ? 'Get Started' : 'Next'} onPress={next} />

        {!isLast && (
            <SecondaryButton title="Skip" onPress={skip} />
        )}
        </View>
    );
    }

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    brand: 
    {   fontSize: 18, 
        fontFamily: 'Lexend', 
        fontWeight: '700', 
        color: colors.buttonPrimary, 
        letterSpacing: 1 
    },

    brandAr: 
    { 
        fontSize: 16, 
        fontFamily: 'Lexend', 
        color: colors.buttonPrimary, 
        marginBottom: 20 
    },
    title: 
    { 
        fontSize: 28, 
        fontFamily: 'Lexend', 
        fontWeight: '700', 
        textAlign: 'center', 
        color: colors.textPrimary, 
        lineHeight: 36 
    },
    desc: 
    { 
        fontSize: 14, 
        fontFamily: 'Lexend', 
        color: colors.textSecondary, 
        textAlign: 'center', 
        marginTop: 12, 
        lineHeight: 22 
    },
    imageBox: 
    { 
        flex: 1, 
        width: '100%', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginVertical: 24 
    },
    image: { width: '90%', height: '90%' },
    dots: { flexDirection: 'row', gap: 8, marginBottom: 24 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB' },
    dotActive: { backgroundColor: '#508DF7', width: 24 },
    btn: { width: '100%', height: 56, backgroundColor: '#508DF7', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    btnText: { fontSize: 16, fontFamily: 'Lexend', fontWeight: '600', color: '#fff' },
    skip: { fontSize: 14, fontFamily: 'Lexend', color: '#6B7280', textDecorationLine: 'underline', marginBottom: 32 },
    });