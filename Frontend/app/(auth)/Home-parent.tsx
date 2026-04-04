import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

import { theme } from '@/theme';
import { Text } from '@/components/modal/shared/Text';
import Avatar from '@/components/modal/shared/Avatar';
import Badge from '@/components/modal/shared/Badge';
import ProgressBar from '@/components/modal/shared/progressBar';
import BottomNav from '@/components/modal/shared/BottomNav';

const { colors, spacing, typography, radius } = theme;

/* ── Mock data (replace with real store/API) ── */
const CHILD = {
    name: 'Ayoub',
    age: 6,
    level: 2,
    disability: 'ADD',
    progress: 65,
    tasks: 8,
    daysInRow: 14,
    achievements: 3,
    imageUri: undefined as string | undefined,
};

const PARENT_NAME = "Ayoub's mother";

/* ── Calendar strip ── */
const DAYS = ['M', 'M', 'M', 'M', 'M', 'M', 'M'];
const DATES = [23, 23, 23, 23, 23, 23, 23];

/* ── Quick access items ── */
const QUICK_ACCESS = [
    { label: 'School page',      icon: '🎓', route: '/(parent)/school'    },
    { label: 'Progress Reports', icon: '📊', route: '/(parent)/progress'  },
    { label: 'Tree',             icon: '🌿', route: '/(parent)/tree'      },
    { label: 'Special education',icon: '💡', route: '/(parent)/se'        },
];

/* ─────────────────────────────────────────
    Child Summary Card
───────────────────────────────────────── */
function ChildCard() {
    return (
        <View style={cardStyles.container}>
        {/* Top row */}
        <View style={cardStyles.topRow}>
            <Avatar name={CHILD.name} imageUri={CHILD.imageUri} size="md" />
            <View style={cardStyles.info}>
            <Text style={cardStyles.name}>{CHILD.name}, {CHILD.age} years</Text>
            <View style={cardStyles.badges}>
                <Badge label={`Level ${CHILD.level}`} variant="blue" />
                <Badge label={`Age ${CHILD.age}`}     variant="green" />
                <Badge label={CHILD.disability}        variant="orange" />
            </View>
            </View>
            <Text style={cardStyles.percent}>{CHILD.progress}%</Text>
        </View>

        {/* Progress bar */}
        <ProgressBar value={CHILD.progress} height={8} showLabel={false} />

        {/* Stats row */}
        <View style={cardStyles.statsRow}>
            <View style={cardStyles.stat}>
            <Text style={cardStyles.statIcon}>✓</Text>
            <Text style={cardStyles.statText}>{CHILD.tasks} Task</Text>
            </View>
            <View style={cardStyles.divider} />
            <View style={cardStyles.stat}>
            <Text style={cardStyles.statIcon}>📅</Text>
            <Text style={cardStyles.statText}>{CHILD.daysInRow} Days in Row</Text>
            </View>
            <View style={cardStyles.divider} />
            <View style={cardStyles.stat}>
            <Text style={cardStyles.statIcon}>☆</Text>
            <Text style={cardStyles.statText}>{CHILD.achievements} Achievement</Text>
            </View>
        </View>
        </View>
    );
}

const cardStyles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        gap: spacing.md,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    info: {
        flex: 1,
        gap: spacing.xs,
    },
    name: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.textPrimary,
    },
    badges: {
        flexDirection: 'row',
        gap: spacing.xs,
        flexWrap: 'wrap',
    },
    percent: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.primary,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: spacing.xs,
    },
    stat: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    statIcon: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    statText: {
        fontSize: 11,
        fontFamily: typography.fontFamily.regular,
        color: colors.textSecondary,
    },
    divider: {
        width: 1,
        height: 16,
        backgroundColor: colors.border,
    },
    });

    /* ─────────────────────────────────────────
    Calendar Strip
    ───────────────────────────────────────── */
function CalendarStrip() {
    const [selected, setSelected] = useState(3);

    return (
        <View style={calStyles.container}>
        <View style={calStyles.header}>
            <Text style={calStyles.month}>March 2026</Text>
            <Text style={calStyles.streak}>{CHILD.daysInRow} Days in Row</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={calStyles.strip}>
            {DAYS.map((day, i) => (
                <TouchableOpacity
                key={i}
                style={[calStyles.dayBox, i === selected && calStyles.dayBoxActive]}
                onPress={() => setSelected(i)}
                activeOpacity={0.8}
                >
                <Text style={[calStyles.dayLetter, i === selected && calStyles.dayTextActive]}>
                    {day}
                </Text>
                <Text style={[calStyles.dayNum, i === selected && calStyles.dayTextActive]}>
                    {DATES[i]}
                </Text>
                </TouchableOpacity>
            ))}
            </View>
        </ScrollView>
        </View>
    );
    }

    const calStyles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        gap: spacing.sm,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    month: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.textPrimary,
    },
    streak: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.primary,
    },
    strip: {
        flexDirection: 'row',
        gap: spacing.sm,
        paddingVertical: spacing.xs,
    },
    dayBox: {
        width: 44,
        height: 52,
        borderRadius: radius.lg,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    dayBoxActive: {
        backgroundColor: colors.primaryDark,
    },
    dayLetter: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.textWhite,
    },
    dayNum: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.textWhite,
    },
    dayTextActive: {
        color: colors.textWhite,
    },
    });

    /* ─────────────────────────────────────────
    Quick Access Grid
    ───────────────────────────────────────── */
    function QuickAccess() {
    return (
        <View style={qaStyles.container}>
        <Text style={qaStyles.title}>Quick Access</Text>
        <View style={qaStyles.grid}>
            {QUICK_ACCESS.map((item) => (
            <TouchableOpacity
                key={item.route}
                style={qaStyles.item}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.8}
            >
                <View style={qaStyles.iconBox}>
                <Text style={qaStyles.icon}>{item.icon}</Text>
                </View>
                <Text style={qaStyles.label}>{item.label}</Text>
            </TouchableOpacity>
            ))}
        </View>
        </View>
    );
}

const qaStyles = StyleSheet.create({
    container: {
        gap: spacing.md,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.textPrimary,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    item: {
        width: '47%',
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        alignItems: 'center',
        gap: spacing.sm,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 24,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.textPrimary,
        textAlign: 'center',
    },
});

/* ─────────────────────────────────────────
Main Screen
───────────────────────────────────────── */
export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar style="dark" />

        {/* Top bar */}
        <View style={styles.topBar}>
            <View style={styles.userRow}>
            <Avatar name={PARENT_NAME} size="sm" />
            <View>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.parentName}>{PARENT_NAME}</Text>
            </View>
            </View>
            <TouchableOpacity style={styles.bellBtn}>
            <Text style={styles.bell}>🔔</Text>
            </TouchableOpacity>
        </View>

        <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
        >
            <ChildCard />
            <CalendarStrip />
            <QuickAccess />
        </ScrollView>

        <BottomNav />
        </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },

    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },

    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },

    welcomeText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.textSecondary,
    },

    parentName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.textPrimary,
    },

    bellBtn: {
        width: 36,
        height: 36,
        borderRadius: radius.full,
        backgroundColor: colors.backgroundLight,
        alignItems: 'center',
        justifyContent: 'center',
    },

    bell: {
        fontSize: 18,
    },

    scroll: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
    },
});