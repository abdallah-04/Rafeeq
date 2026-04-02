import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants';

type Props = {
    title: string;
    onPress: () => void;
};

export default function SecondaryButton({ title, onPress }: Props) {
    return (
        <TouchableOpacity style={styles.btn} onPress={onPress}>
        <Text style={styles.btnText}>{title}</Text>
        </TouchableOpacity>
    );
    }

const styles = StyleSheet.create({
    btn: {
        width: '100%',
        backgroundColor: colors.buttonSecondary,
        paddingVertical: 15,
        borderRadius: 30,
        marginTop: 20,
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    btnText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});