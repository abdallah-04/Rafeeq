import { View, Text, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import React from 'react';
import PrimaryButton from '@/components/modal/shared/blueButton';
import SecondaryButton from '@/components/modal/shared/otherbutton';
import { colors } from '@/constants';
import ScreenWrapper from '@/components/modal/shared/ScreenWap';

export default function LandingScreen() {
    return (
    <ScreenWrapper style={styles.container}>
        {/* Header */}
        <Text style={styles.brand}>RAFEEQ</Text>
        <Text style={styles.brandAr}>رفيق</Text>

        {/* Mascot */}
        <View style={styles.imageBox}>
            <Image 
            source={require('@/assets/images/mascot/rafeeq_waving.png')} 
            style={styles.penguin} 
            resizeMode="contain"
            />
        </View>

        {/* Text */}
        <Text style={styles.heading}>Helping every child learn and grow.</Text>
        <Text style={styles.sub}>
            The companion for your child's educational journey and personalized growth.
        </Text>

        {/* Buttons */}
        <PrimaryButton 
            title="Get Started" 
            onPress={() => {}} 
        />
        <SecondaryButton 
            title="Log In" 
            onPress={() => {}} 
        />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container:{ 
        flex: 1, 
        backgroundColor: colors.white, 
        alignItems: 'center', 
        paddingHorizontal: 24, 
        paddingTop: 60 
    },
    brand: { 
        fontSize: 18, 
        fontFamily: 'Lexend', 
        fontWeight: '900', 
        color: colors.buttonPrimary, 
        letterSpacing: 1 
    },
    brandAr: { 
        fontSize: 16, 
        fontFamily: 'Lexend', 
        color: colors.buttonPrimary, 
        marginBottom: 16 
    },
    imageBox: { 
        flex: 1, 
        width: '100%', 
        backgroundColor: '#EEF4FF', 
        borderRadius: 24, 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: 24 
    },
    penguin: { 
        width: '70%', 
        height: '70%' 
    },
    heading: { 
        fontSize: 22, 
        fontFamily: 'Lexend', 
        fontWeight: '700', 
        textAlign: 'center', 
        color: colors.textPrimary, 
        lineHeight: 30, 
        marginBottom: 8 
    },
    sub: { 
        fontSize: 13, 
        fontFamily: 'Lexend', 
        color: colors.textSecondary, 
        textAlign: 'center', 
        lineHeight: 20, 
        marginBottom: 24 
    },
});