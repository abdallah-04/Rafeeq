import React, { useMemo, useState } from 'react'
import {
    View,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    StyleSheet,
} from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { theme } from '@/theme'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import ChildSelector from '@/components/modal/parent/ChildSelector'
import TabBar from '@/components/modal/shared/TabBar'
import QuizCard from '@/components/modal/parent/quizcard'
import { Text } from '@/components/modal/shared/Text'

type TabKey = 'progress' | 'quizzes' | 'activities' | 'homeworks'

interface Quiz {
    id: string
    titleKey: string
    icon: any
    iconBgColor: string
    iconTintColor?: string
    questionsCount: number
    durationMinutes: number
    status: 'completed' | 'in_progress' | 'new'
}

const MOCK_CHILD = {
    name: 'Ayoub',
    age: 6,
    avatar: require('@/assets/images/boy.png'),
}

const MOCK_QUIZZES: Quiz[] = [
    {
        id: '1',
        titleKey: 'quizzes.cards.colors',
        icon: require('@/assets/images/icons/color.png'),
        iconBgColor: '#BBF7D0',
        iconTintColor: '#00C688',
        questionsCount: 10,
        durationMinutes: 5,
        status: 'completed',
    },
    {
        id: '2',
        titleKey: 'quizzes.cards.numbers',
        icon: require('@/assets/images/icons/math.png'),
        iconBgColor: '#FDE68A',
        iconTintColor: '#D97706',
        questionsCount: 10,
        durationMinutes: 5,
        status: 'in_progress',
    },
    {
        id: '3',
        titleKey: 'quizzes.cards.animals',
        icon: require('@/assets/images/icons/animal.png'),
        iconBgColor: '#DDD6FE',
        iconTintColor: '#7C3AED',
        questionsCount: 10,
        durationMinutes: 5,
        status: 'new',
    },
]

export default function QuizzesScreen() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<TabKey>('quizzes')

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

    const handleTabChange = (tab: string) => {
        const nextTab = tab as TabKey

        if (nextTab === 'progress') {
            router.replace('/(parent)/progress/progress-page')
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

        setActiveTab('quizzes')
    }

    return (
        <ScreenWrapper padded={false} scroll={false}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />

            <Header title={t('progress.tabs.quizzes')} onBack={() => router.back()} />

            <ChildSelector
                name={MOCK_CHILD.name}
                age={MOCK_CHILD.age}
                avatar={MOCK_CHILD.avatar}
                badges={childBadges}
                onPress={() => {}}
            />

            <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <View style={styles.sectionHeader}>
                    <Text variant="heading" style={styles.sectionTitle}>
                        {t('quizzes.thisWeek')}
                    </Text>
                    <TouchableOpacity activeOpacity={0.7}>
                        <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
                    </TouchableOpacity>
                </View>

                {MOCK_QUIZZES.map((quiz) => (
                    <QuizCard
                        key={quiz.id}
                        {...quiz}
                        title={t(quiz.titleKey)}
                        onPress={() => {}}
                    />
                ))}
            </ScrollView>
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.lg,
        paddingBottom: 120,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Lexend_700Bold',
        color: theme.colors.textPrimary,
    },
    seeAll: {
        fontSize: 13,
        fontFamily: 'Lexend_400Regular',
        color: theme.colors.primary,
    },
})
