// 




import React, { useState } from 'react'
import { View, StyleSheet, StatusBar, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { theme } from '@/theme'
import { Text } from '@/components/modal/shared/Text'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import ChildSelector from '@/components/modal/parent/ChildSelector'
import TabBar from '@/components/modal/shared/TabBar'
import ProgressCard from '@/components/modal/parent/ProgressCard'
import ProgressSummary, { SkillItem } from '@/components/modal/parent/ProgressSummary'

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

const TABS = ['Progress', 'Quizes', 'Activities', 'Homeworks']

export default function ProgressScreen() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('Progress')

    const handleTabChange = (tab: string) => {
        if (tab === 'Quizes') {
        router.replace('/(parent)/progress/quiz')
        return
        }
        if (tab === 'Activities') {
        router.replace('/(parent)/progress/activities')
        return
        }
        if (tab === 'Homeworks') {
            router.replace('/(parent)/progress/homeworks')
            return
        }
        setActiveTab(tab)
    }

    return (
        <ScreenWrapper scroll={false}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />

        <Header
            title={t('progress.title')}
            onBack={() => router.back()}
            rightElement={
            <HeaderRightButton onPress={() => router.push('/(parent)/settings' as any)} />
            }
        />

        <ChildSelector
        name={MOCK_CHILD.name}
        age={MOCK_CHILD.age}
        avatar={MOCK_CHILD.avatar}
        badges={MOCK_CHILD.badges}
        onPress={() => {}}
    />

        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

        <View style={styles.content}>
            <ProgressCard {...MOCK_PROGRESS_CARD} />
            <ProgressSummary
            title={t('progress.summary')}
            items={MOCK_SKILLS}
            onViewDetails={() => router.push('/(parent)/progress-details' as any)}
            />
        </View>

        </ScreenWrapper>
    )
    }

// Helper component for header right button (settings)
function HeaderRightButton({ onPress }: { onPress: () => void }) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.settingsBtn}>
        <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    content: {
        marginTop: 0.09,
        flex: 1,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.sm,
        gap: theme.spacing.sm,
    },
    settingsBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    settingsIcon: {
        fontSize: 20,
    },
})