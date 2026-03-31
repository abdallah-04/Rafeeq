import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants';

type Unit = 'H.W' | 'Quiz' | 'Activities' | 'tasks';
type Period = 'today' | 'This week';

type Props = {
    completed: number;
    total: number;
    unit: Unit;
    period: Period;
};

export default function KeepGoingBanner({ completed, total, unit, period }: Props) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <View style={styles.container}>
        <Text style={styles.text}>
            Keep going! {completed}/{total} {unit} done {period === 'today' ? 'today' : 'this week'} ({percentage}%)
        </Text>
        <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.primaryLighter,
        padding: 15,
        borderRadius: 12,
        marginVertical: 10,
    },
    text: {
        color: colors.textPrimary,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    progressBar: {
        width: '100%',
        height: 10,
        backgroundColor: colors.progressNotStarted,
        borderRadius: 5,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.progressComplete,
        borderRadius: 5,
    },
});