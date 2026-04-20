// 




import React, { useState, useEffect } from 'react'
import { View, StyleSheet, StatusBar, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { theme } from '@/theme'
import { useActiveChildStore } from '@/store/activeChildStore'
import { apiGetChildSummary } from '@/services/api'
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
    const activeChild = useActiveChildStore((s) => s.activeChild)
    const [assessedLevel, setAssessedLevel] = useState<number | null>(null)

    useEffect(() => {
        if (!activeChild) return
        apiGetChildSummary(activeChild.id)
            .then((s) => setAssessedLevel(s.assessedLevel))
            .catch(() => {})
    }, [activeChild?.id])

    const childName  = activeChild?.fullNameAr ?? activeChild?.fullNameEn ?? '—'
    const level      = assessedLevel ?? activeChild?.level ?? activeChild?.assessedLevel ?? null
    const levelPct   = level ? Math.min(level * 20, 100) : 0
    const skills     = level ? [{ label: t('progress.assessedLevel','Assessed Level'), percentage: levelPct, color: '#5B8DEF' }] : []

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
        name={childName}
        age={activeChild?.dateOfBirth ? Math.floor((Date.now()-new Date(activeChild.dateOfBirth).getTime())/(1000*60*60*24*365)) : 0}
        avatar={require('@/assets/images/boy.png')}
        badges={level ? [{ label: `Level ${level}`, color: '#A78BFA' }] : []}
        onPress={() => {}}
    />

        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

        <View style={styles.content}>
            <ProgressCard childName={childName} monthLabel={t('progress.thisMonth','This Month 🎉')} description={t('progress.description','Keep going!')} percentage={levelPct} mascotImage={require('@/assets/images/mascot/rafeeq_reading.png')} />
            <ProgressSummary
            title={t('progress.summary')}
            items={skills}
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