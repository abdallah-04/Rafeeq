import React, { useState } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    StyleSheet,
} from 'react-native'
import { router } from 'expo-router'
import { theme } from '@/theme';

import ChildSelector from '@/components/modal/parent/ChildSelector'
import TabBar from '@/components/modal/shared/TabBar'
import ProgressCard from '@/components/modal/parent/ProgressCard'
import ProgressSummary, { SkillItem } from '@/components/modal/parent/ProgressSummary'
import BottomNav from '@/components/modal/shared/BottomNav' // Import the BottomNav component

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CHILD = {
    name: 'Ayoub',
    age: 6,
    avatar: require('@/assets/images/boy.png'),
    badges: [
        { label: 'Level 2', color: '#A78BFA' },
        { label: 'Age 8',   color: '#60A5FA' },
        { label: 'level2',  color: '#A78BFA' },
    ],
}

const MOCK_PROGRESS_CARD = {
    childName: 'Zaid',
    monthLabel: 'This Month 🎉',
    description: 'Great progress this month! keep going.',
    percentage: 75,
    mascotImage: require('@/assets/images/mascot/rafeeq_reading.png'),
}

const MOCK_SKILLS: SkillItem[] = [
    { label: 'Focus & Attention', percentage: 62, color: '#5B8DEF' },
    { label: 'Mathematics',       percentage: 62, color: '#A855F7' },
    { label: 'Social Skills',     percentage: 90, color: '#F97316' },
]

const TABS = ['Progress', 'Quizes', 'Activities']

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProgressScreen() {
    const [activeTab, setActiveTab] = useState('Progress')

    const handleTabChange = (tab: string) => {
        if (tab === 'Quizes') {
            router.replace('/(parent)/quizes')
            return
        }
        if (tab === 'Activities') {
            router.replace('/(parent)/activities')
            return
        }
        setActiveTab(tab)
    }

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Progress</Text>

                <TouchableOpacity
                    onPress={() => router.push('/(parent)/settings')}
                    style={styles.settingsBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Settings"
                >
                    <Text style={styles.settingsIcon}>⚙️</Text>
                </TouchableOpacity>
            </View>

            {/* ── Child Selector ── */}
            <ChildSelector
                name={MOCK_CHILD.name}
                age={MOCK_CHILD.age}
                avatar={MOCK_CHILD.avatar}
                badges={MOCK_CHILD.badges}
                onPress={() => {
                    // TODO: open child switcher modal
                }}
            />

            {/* ── Tab Bar ── */}
            <TabBar
                tabs={TABS}
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            {/* ── Content ── */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Progress Card */}
                <ProgressCard
                    childName={MOCK_PROGRESS_CARD.childName}
                    monthLabel={MOCK_PROGRESS_CARD.monthLabel}
                    description={MOCK_PROGRESS_CARD.description}
                    percentage={MOCK_PROGRESS_CARD.percentage}
                    mascotImage={MOCK_PROGRESS_CARD.mascotImage}
                />

                {/* Progress Summary */}
                <ProgressSummary
                    title="Progress Summary"
                    items={MOCK_SKILLS}
                    onViewDetails={() => router.push('/(parent)/progress-details')}
                />
            </ScrollView>

            {/* ── Bottom Navigation ── */}
            <BottomNav />
        </SafeAreaView>
    )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    backIcon: {
        fontSize: 22,
        color: theme.colors.textPrimary,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Lexend_700Bold',
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    settingsBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    settingsIcon: {
        fontSize: 20,
    },

    // Scroll
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: theme.spacing.xl,
    },
})