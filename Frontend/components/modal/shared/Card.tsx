import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants';

type Props = {
    children: ReactNode;
    style?: object; 
};

export default function Card({ children, style }: Props) {
    return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 15,
        margin: 10,
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
});