import React, { ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, I18nManager, ViewStyle } from 'react-native';
import { colors } from '@/constants';

type Props = {
    children: ReactNode;
    style?: ViewStyle;
};

export default function ScreenWrapper({ children, style }: Props) {
    return (
        <SafeAreaView style={styles.safeArea}>
        <ScrollView
            contentContainerStyle={[
            styles.scrollContainer,
            style,
            I18nManager.isRTL && { paddingRight: 20, paddingLeft: 10 },
            ]}
            showsVerticalScrollIndicator={false}
        >
            {children}
        </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        padding: 20,
        flexGrow: 1,
    },
});