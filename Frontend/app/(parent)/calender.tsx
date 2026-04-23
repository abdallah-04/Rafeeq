import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/modal/shared/Text';
import { theme } from '@/theme';

const { colors, spacing, typography, radius } = theme;

const ACTIVE_DAYS = new Set([1,2,3,5,6,8,9,10,14,15,16,17,20,21,23]);

    const getDaysInMonth = (y:number,m:number) =>
    new Date(y, m + 1, 0).getDate();

    const getFirstDay = (y:number,m:number) =>
    new Date(y, m, 1).getDay();

    /* ── Strip ── */
    function StripRow({ year, month, selected, setSelected }: any) {
    const { t } = useTranslation();
    const weekDays = t('calendar.weekDays', { returnObjects: true }) as string[];
    const today = new Date();
    const daysInMonth = getDaysInMonth(year, month);

    const lastDay =
        today.getMonth() === month && today.getFullYear() === year
        ? today.getDate()
        : daysInMonth;

    const days = Array.from({ length: 7 }, (_, i) => lastDay - 6 + i);

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.strip}>
            {days.map((day, i) => {
            if (day < 1 || day > daysInMonth)
                return <View key={`e-${i}`} style={styles.dayBox} />;

            const active = ACTIVE_DAYS.has(day);
            const isSelected = selected === i;

            return (
                <TouchableOpacity
                key={`${year}-${month}-${day}`}
                style={[
                    styles.dayBox,
                    active && styles.dayBoxActive,
                    isSelected && styles.dayBoxSelected,
                ]}
                onPress={() => setSelected(i)}
                >
                <Text style={[styles.dayLetter, (active || isSelected) && styles.white]}>
                    {weekDays[new Date(year, month, day).getDay()]}
                </Text>

                <Text style={[styles.dayNum, (active || isSelected) && styles.white]}>
                    {day}
                </Text>
                </TouchableOpacity>
            );
            })}
        </View>
        </ScrollView>
    );
}

/* ── Full Month ── */
    function FullMonth({ year, month, prev, next }: any) {
    const { t } = useTranslation();
    const monthNames = t('calendar.months', { returnObjects: true }) as string[];
    const weekDays = t('calendar.weekDays', { returnObjects: true }) as string[];
    const today = new Date();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDay(year, month);

    const cells = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    return (
        <View>
        <View style={styles.monthNav}>
            <TouchableOpacity onPress={prev} style={styles.arrow}><Text>‹</Text></TouchableOpacity>
            <Text style={styles.monthTitle}>{monthNames[month]} {year}</Text>
            <TouchableOpacity onPress={next} style={styles.arrow}><Text>›</Text></TouchableOpacity>
        </View>

        <View style={styles.weekRow}>
            {weekDays.map((d: string) => (
            <Text key={d} style={styles.weekLabel}>{d}</Text>
            ))}
        </View>

        <View style={styles.grid}>
            {cells.map((day, i) => {
            if (!day) return <View key={`e-${i}`} style={styles.cell} />;

            const active = ACTIVE_DAYS.has(day);
            const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

            return (
                <View
                key={`${year}-${month}-${day}`}
                style={[
                    styles.cell,
                    active && styles.cellActive,
                    isToday && styles.cellToday,
                ]}
                >
                <Text style={[
                    styles.cellNum,
                    active && styles.white,
                    isToday && styles.todayText,
                ]}>
                    {day}
                </Text>
                </View>
            );
            })}
        </View>
        </View>
    );
}

/* ── Main ── */
export default function CalendarStrip() {
    const { t } = useTranslation();
    const today = new Date();

    const [expanded, setExpanded] = useState(false);
    const [selected, setSelected] = useState(6);
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());

    const prev = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };

    const next = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    return (
        <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>{t('calendar.title')}</Text>
            <Text style={styles.streak}>{t('calendar.streak', { count: 14 })}</Text>
        </View>

        {!expanded ? (
            <StripRow year={year} month={month} selected={selected} setSelected={setSelected} />
        ) : (
            <FullMonth year={year} month={month} prev={prev} next={next} />
        )}

        <TouchableOpacity onPress={() => setExpanded(e => !e)}>
            <Text style={styles.toggle}>
            {expanded ? t('calendar.showLess') : t('calendar.showMore')}
            </Text>
        </TouchableOpacity>
        </View>
    );
}

/* ── Styles ── */
const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.backgroundLight,
        padding: spacing.md,
        borderBlockColor: colors.borderDark,
        borderRadius: 18,
        gap: spacing.sm,
        shadowColor: colors.black,
        shadowOffset: { width: 3, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 8,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between' },
    title: { fontWeight: typography.fontWeight.bold , color: colors.textPrimary},
    streak: { color: colors.primary },

    strip: { flexDirection: 'row', gap: 7 },

    dayBox: {
        width: 46,
        height: 57,
        borderRadius: 12,
        backgroundColor: colors.backgroundLight,
        alignItems: 'center',
        justifyContent: 'center',
        borderBlockColor: colors.borderLight,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 3,
    },
    dayBoxActive: { backgroundColor: colors.primary },
    dayBoxSelected: { backgroundColor: colors.primaryDark },

    dayLetter: { fontSize: typography.fontSize.sm , color: colors.textSecondary, fontWeight: typography.fontWeight.semiBold },
    dayNum: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold , color: colors.textSecondary},
    white: { color: colors.textWhite },

    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    arrow: { padding: 6, backgroundColor: colors.backgroundGray, borderRadius: 8 },
    monthTitle: { fontWeight: typography.fontWeight.bold },

    weekRow: { flexDirection: 'row', justifyContent: 'space-around' },
    weekLabel: { width: 30, textAlign: 'center' },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },

    cell: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: colors.backgroundGray,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    cellActive: { backgroundColor: colors.primary },
    cellToday: { borderWidth: 2, borderColor: colors.primary },

    cellNum: {},
    todayText: { color: colors.primary },

    toggle: { textAlign: 'center', color: colors.textSecondary },
});