import React, { useMemo, useState } from 'react'
import { View, Image, StyleSheet, StatusBar, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { theme } from '@/theme'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/Appstore'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import ChildSelector from '@/components/modal/parent/ChildSelector'
import TabBar from '@/components/modal/shared/TabBar'
import { Text } from '@/components/modal/shared/Text'
import StatusBadge from '@/components/modal/parent/StatusBadge'

interface RecommendedActivity {
    id: string
    titleKey: string
    icon: any
    iconTintColor: string
    durationMinutes: number
}

interface DailyActivity {
    id: string
    titleKey: string
    subtitleKey: string
    icon: any
    iconBgColor: string
    iconTintColor: string
    status: 'completed' | 'later' | 'new' | 'in_progress'
}

type TabKey = 'progress' | 'quizzes' | 'activities' | 'homeworks'

const MOCK_CHILD = {
    name: 'Ayoub',
    age: 6,
    avatar: require('@/assets/images/boy.png'),
}

const RECOMMENDED: RecommendedActivity[] = [
    {
        id: '1',
        titleKey: 'activities.cards.freeDrawing',
        icon: require('@/assets/images/icons/color.png'),
        iconTintColor: '#7C3AED',
        durationMinutes: 10,
    },
    {
        id: '2',
        titleKey: 'activities.cards.interactivePuzzle',
        icon: require('@/assets/images/icons/shapes.png'),
        iconTintColor: '#7C3AED',
        durationMinutes: 23,
    },
]

const DAILY_ACTIVITIES: DailyActivity[] = [
    {
        id: '1',
        titleKey: 'activities.cards.breathingExercise',
        subtitleKey: 'activities.cards.withParentsMorning',
        icon: require('@/assets/images/icons/growth.png'),
        iconBgColor: '#BBF7D0',
        iconTintColor: '#00C688',
        status: 'completed',
    },
    {
        id: '2',
        titleKey: 'activities.cards.socialPlay',
        subtitleKey: 'activities.cards.withFriendsEvening',
        icon: require('@/assets/images/icons/influencer.png'),
        iconBgColor: '#FDE68A',
        iconTintColor: '#D97706',
        status: 'later',
    },
]

export default function ActivitiesScreen() {
    const { t } = useTranslation()
    const isRTL = useAppStore((state) => state.isRTL)
    const [activeTab, setActiveTab] = useState<TabKey>('activities')

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
        if (nextTab === 'quizzes') {
            router.replace('/(parent)/progress/quiz')
            return
        }
        if (nextTab === 'homeworks') {
            router.replace('/(parent)/progress/homeworks')
            return
        }

        setActiveTab('activities')
    }

    return (
        <ScreenWrapper padded={false} scroll={false}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />

            <Header title={t('activities.title')} onBack={() => router.back()} />

            <ChildSelector
                name={MOCK_CHILD.name}
                age={MOCK_CHILD.age}
                avatar={MOCK_CHILD.avatar}
                badges={childBadges}
                onPress={() => {}}
            />

            <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <Text variant="heading" style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                    {t('activities.recommendedFor', { name: MOCK_CHILD.name })}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendedList}>
                    {RECOMMENDED.map((item) => (
                        <RecommendedCard
                            key={item.id}
                            item={item}
                            title={t(item.titleKey)}
                            minsLabel={t('activities.mins', { count: item.durationMinutes })}
                            isRTL={isRTL}
                        />
                    ))}
                </ScrollView>

                <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
                    <Text variant="heading" style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                        {t('activities.daily')}
                    </Text>
                    <TouchableOpacity activeOpacity={0.7}>
                        <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
                    </TouchableOpacity>
                </View>

                {DAILY_ACTIVITIES.map((item) => (
                    <DailyCard
                        key={item.id}
                        item={item}
                        title={t(item.titleKey)}
                        subtitle={t(item.subtitleKey)}
                        isRTL={isRTL}
                    />
                ))}
            </ScrollView>
        </ScreenWrapper>
    )
}

function RecommendedCard({
    item,
    title,
    minsLabel,
    isRTL,
}: {
    item: RecommendedActivity
    title: string
    minsLabel: string
    isRTL: boolean
}) {
    return (
        <TouchableOpacity style={styles.recommendedCard} activeOpacity={0.7}>
            <Image source={item.icon} style={[styles.recommendedIcon, { tintColor: item.iconTintColor }]} resizeMode="contain" />
            <Text style={[styles.recommendedTitle, isRTL && styles.textRTL]}>{title}</Text>
            <Text style={[styles.recommendedMeta, isRTL && styles.textRTL]}>{minsLabel}</Text>
        </TouchableOpacity>
    )
}

function DailyCard({
    item,
    title,
    subtitle,
    isRTL,
}: {
    item: DailyActivity
    title: string
    subtitle: string
    isRTL: boolean
}) {
    return (
        <TouchableOpacity style={[styles.dailyCard, isRTL && styles.dailyCardRTL]} activeOpacity={0.7}>
            <View style={[styles.dailyIconBox, { backgroundColor: item.iconBgColor }]}>
                <Image source={item.icon} style={[styles.dailyIcon, { tintColor: item.iconTintColor }]} resizeMode="contain" />
            </View>
            <View style={styles.dailyInfo}>
                <Text style={[styles.dailyTitle, isRTL && styles.textRTL]}>{title}</Text>
                <Text style={[styles.dailySubtitle, isRTL && styles.textRTL]}>{subtitle}</Text>
            </View>
            <StatusBadge variant={item.status} />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.lg,
        paddingBottom: 120,
        gap: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Lexend_700Bold',
        color: theme.colors.textPrimary,
        textAlign: 'left',
    },
    textRTL: {
        textAlign: 'right',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionHeaderRTL: {
        flexDirection: 'row-reverse',
    },
    seeAll: {
        fontSize: 13,
        fontFamily: 'Lexend_400Regular',
        color: theme.colors.primary,
    },
    recommendedList: {
        gap: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
    },
    recommendedCard: {
        width: 140,
        backgroundColor: '#EDE9FE',
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        gap: theme.spacing.sm,
        justifyContent: 'flex-end',
        minHeight: 130,
    },
    recommendedIcon: {
        width: 40,
        height: 40,
        marginBottom: 'auto',
    },
    recommendedTitle: {
        fontSize: 14,
        fontFamily: 'Lexend_700Bold',
        color: theme.colors.textPrimary,
        textAlign: 'left',
    },
    recommendedMeta: {
        fontSize: 12,
        fontFamily: 'Lexend_400Regular',
        color: theme.colors.textMuted,
        textAlign: 'left',
    },
    dailyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.spacing.md,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    dailyCardRTL: {
        flexDirection: 'row-reverse',
    },
    dailyIconBox: {
        width: 52,
        height: 52,
        borderRadius: theme.radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dailyIcon: {
        width: 30,
        height: 30,
    },
    dailyInfo: {
        flex: 1,
        gap: 4,
    },
    dailyTitle: {
        fontSize: 15,
        fontFamily: 'Lexend_700Bold',
        color: theme.colors.textPrimary,
        textAlign: 'left',
    },
    dailySubtitle: {
        fontSize: 12,
        fontFamily: 'Lexend_400Regular',
        color: theme.colors.textMuted,
        textAlign: 'left',
    },
})
