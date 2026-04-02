import React, { useEffect, useState } from 'react';
//import { useAppStore } from '@/store/Appstore';
import { router } from 'expo-router';
import {Image, View,Text,TouchableOpacity,StyleSheet,} from 'react-native';
import { colors } from '@/constants';
import  PrimaryButton from '@/components/modal/shared/blueButton';
import ScreenWrapper from '@/components/modal/shared/ScreenWap';


export default function LanguageSelectionScreen() {
    const [selected, setSelected] = useState<'en' | 'ar' | null>(null);
    // const setLanguage = useAppStore(s => s.setLanguage);

    // const languageFromStore = useAppStore(s => s.language);

    // useEffect(() => {
    // if (languageFromStore) setSelected(languageFromStore);
    //     }, [languageFromStore]);

    // const handleContinue = () => {
    //         if (!selected) return;
    //         setLanguage(selected); 
    //         router.replace('/onboarding');
    //     };

    return (

        <ScreenWrapper style={styles.container}>
        {/* Logo */}
        <Image
            source={require('@/assets/images/mascot/rafeeq_like.png')}
            style={styles.pic}
            resizeMode="contain"
        />
        <Text style={styles.logoAr}>رفيق</Text>
        <Text style={styles.logoAr}>Rafeeq</Text>

        {/* Title */}
        <Text style={styles.title}>Choose your language</Text>
        <Text style={styles.title}>اختر لغتك</Text>

        {/* Options */}
        <View style={styles.options}>
            
            <TouchableOpacity
            style={[
                styles.card,
                selected === 'en' && styles.cardSelected,
            ]}
            onPress={() => setSelected('en')}
            >
            <Text style={styles.flag}>UK</Text>
            <View>
                <Text style={styles.lang}>English</Text>
                <Text style={styles.sub}>الإنجليزية</Text>
            </View>
            </TouchableOpacity>

            <TouchableOpacity
            style={[
                styles.card,
                selected === 'ar' && styles.cardSelected,
            ]}
            onPress={() => setSelected('ar')}
            >
            <Text style={styles.flag}>🇯🇴</Text>
            <View>
                <Text style={styles.lang}>العربية</Text>
                <Text style={styles.sub}>Arabic</Text>
            </View>
            </TouchableOpacity>

        </View>

        {/* Button */}
        <PrimaryButton
            title="Continue"
            onPress={() => {
                if (!selected) return;
                router.replace('/onboarding');
            }}
            disabled={!selected}
            />

        </ScreenWrapper>
    );
    }

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingTop: 40,
    },

    logoAr: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 6,
    },

    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },

    options: {
        width: '100%',
        gap: 12,
        marginBottom: 24,
        marginTop: 12,
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 12,
    },

    cardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.backgroundGray,
    },

    flag: {
        fontSize: 20,
    },

    lang: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textPrimary,
    },

    sub: {
        fontSize: 12,
        color: colors.textSecondary,
    },

    pic: {
        width: 114,
        height: 114,
        marginBottom: 2,
    },  
    });