import React, { useMemo, useState } from 'react'
import { View, StyleSheet, StatusBar } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { theme } from '@/theme'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import ChildSelector from '@/components/modal/parent/ChildSelector'
import TabBar from '@/components/modal/shared/TabBar'
import ProgressCard from '@/components/modal/parent/ProgressCard'
import ProgressSummary, { SkillItem } from '@/components/modal/parent/ProgressSummary'

type TabKey = 'progress' | 'quizzes' | 'activities' | 'homeworks'

const MOCK_CHILD = {
    name: 'Ayoub',
    age: 6,
    avatar: require('@/assets/images/boy.png'),
}

export default function ProgressScreen() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<TabKey>('progress')

    const tabs = useMemo(
        () => [
            { key: 'progress', label: t('progress.tabs.progress') },
            { key: 'quizzes', label: t('progress.tabs.quizzes') },
            { key: 'activities', label: t('activities.title') },
            { key: 'homeworks', label: t('homework.title') },
        ],
        [t]
    )

    const childBadges = useMemo(
        () => [
            { label: `${t('common.level')} 2`, color: '#A78BFA' },
            { label: t('myChildren.years', { age: MOCK_CHILD.age }), color: '#60A5FA' },
        ],
        [t]
    )

    const skillItems = useMemo<SkillItem[]>(
        () => [
            { label: t('progress.focusAttention'), percentage: 62, color: '#5B8DEF' },
            { label: t('progress.mathematics'), percentage: 62, color: '#A855F7' },
            { label: t('progress.socialSkills'), percentage: 90, color: '#F97316' },
        ],
        [t]
    )

    const handleTabChange = (tab: string) => {
        const nextTab = tab as TabKey

        if (nextTab === 'quizzes') {
            router.replace('/(parent)/progress/quiz')
            return
        }
        if (nextTab === 'activities') {
            router.replace('/(parent)/progress/activities')
            return
        }
        if (nextTab === 'homeworks') {
            router.replace('/(parent)/progress/homeworks')
            return
        }

        setActiveTab('progress')
    }

    return (
        <ScreenWrapper padded={false} scroll={false}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />

            <Header title={t('progress.title')} onBack={() => router.back()} />

            <ChildSelector
                name={MOCK_CHILD.name}
                age={MOCK_CHILD.age}
                avatar={MOCK_CHILD.avatar}
                badges={childBadges}
                onPress={() => {}}
            />

            <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

            <View style={styles.content}>
                <ProgressCard
                    title={t('parent.home.quickAccess.progressReports')}
                    description={t('schoolPage.progress.trackingSubtitle')}
                    percentage={75}
                    mascotImage={require('@/assets/images/mascot/rafeeq_reading.png')}
                />
                <ProgressSummary
                    title={t('progress.summary')}
                    items={skillItems}
                />
            </View>
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.xl,
        gap: theme.spacing.sm,
    },
})
