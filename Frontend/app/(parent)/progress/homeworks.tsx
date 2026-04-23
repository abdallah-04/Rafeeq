import React, { useMemo, useState } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { theme } from '@/theme'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/Appstore'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import ProgressCard from '@/components/modal/parent/ProgressCard'
import TabBar from '@/components/modal/shared/TabBar'
import { Text } from '@/components/modal/shared/Text'
import QuizCard from '@/components/modal/parent/quizcard'

type TabKey = 'progress' | 'quizzes' | 'activities' | 'homeworks'

export default function HomeworksMain() {
    const { t } = useTranslation()
    const isRTL = useAppStore((state) => state.isRTL)
    const [activeTab, setActiveTab] = useState<TabKey>('homeworks')
    const [filter, setFilter] = useState<'todo' | 'done'>('todo')

    const tabs = useMemo(
        () => [
            { key: 'progress', label: t('progress.tabs.progress') },
            { key: 'quizzes', label: t('progress.tabs.quizzes') },
            { key: 'activities', label: t('activities.title') },
            { key: 'homeworks', label: t('homework.title') },
        ],
        [t]
    )

    const handleTabChange = (tab: string) => {
        const nextTab = tab as TabKey

        if (nextTab === 'progress') {
            router.replace('/(parent)/progress/progress-page')
            return
        }
        if (nextTab === 'quizzes') {
            router.replace('/(parent)/progress/quiz')
            return
        }
        if (nextTab === 'activities') {
            router.replace('/(parent)/progress/activities')
            return
        }

        setActiveTab('homeworks')
    }

    return (
        <ScreenWrapper padded={false} scroll={false}>
            <Header title={t('homework.title')} onBack={() => router.back()} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ProgressCard
                    title={t('homework.title')}
                    description={t('homework.cards.progressDescription', { completed: 2, total: 5 })}
                    percentage={40}
                    mascotImage={require('@/assets/images/mascot/rafeeq_reading.png')}
                />

                <View style={styles.tabsWrap}>
                    <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
                </View>

                <View style={[styles.toggleContainer, isRTL && styles.toggleContainerRTL]}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, filter === 'todo' && styles.activeToggle]}
                        onPress={() => setFilter('todo')}
                    >
                        <Text style={[styles.toggleText, filter === 'todo' && styles.activeText]}>
                            {t('homework.todo')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, filter === 'done' && styles.activeToggle]}
                        onPress={() => setFilter('done')}
                    >
                        <Text style={[styles.toggleText, filter === 'done' && styles.activeText]}>
                            {t('homework.done')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.listSection}>
                    <Text variant="heading" style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                        {t('homework.forToday')}
                    </Text>
                    <QuizCard
                        title={t('homework.cards.counting')}
                        questionsCount={5}
                        durationMinutes={10}
                        status={filter === 'todo' ? 'start' : 'repeat'}
                        icon={require('@/assets/images/icons/math.png')}
                        iconBgColor="#D1FAE5"
                        iconTintColor="#059669"
                        onPress={() => router.push('/(parent)/progress/HomeworkDetail')}
                    />

                    {filter === 'todo' ? (
                        <>
                            <Text variant="heading" style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                                {t('homework.notFinishedSince')}
                            </Text>
                            <QuizCard
                                title={t('homework.cards.counting')}
                                questionsCount={5}
                                durationMinutes={10}
                                status="start"
                                icon={require('@/assets/images/icons/math.png')}
                                iconBgColor="#D1FAE5"
                                onPress={() => {}}
                            />
                        </>
                    ) : null}
                </View>
            </ScrollView>
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: 120,
    },
    tabsWrap: {
        marginTop: theme.spacing.lg,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.backgroundLight,
        borderRadius: theme.radius.lg,
        padding: 4,
        marginTop: theme.spacing.lg,
    },
    toggleContainerRTL: {
        flexDirection: 'row-reverse',
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: theme.radius.md,
    },
    activeToggle: { backgroundColor: theme.colors.primary },
    toggleText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        color: theme.colors.textSecondary,
    },
    activeText: { color: theme.colors.white },
    listSection: { paddingBottom: 100 },
    sectionTitle: {
        fontSize: 14,
        marginVertical: theme.spacing.md,
        color: theme.colors.textPrimary,
        textAlign: 'left',
    },
    textRTL: {
        textAlign: 'right',
    },
})
