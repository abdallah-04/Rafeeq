import React, { useState } from 'react'
import { View, Image, StyleSheet, StatusBar, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { theme } from '@/theme'
import { useTranslation } from 'react-i18next'

import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import ChildSelector from '@/components/modal/parent/ChildSelector'
import TabBar from '@/components/modal/shared/TabBar'
import { Text } from '@/components/modal/shared/Text'
import StatusBadge from '@/components/modal/parent/StatusBadge'
import { useActiveChildStore } from '@/store/activeChildStore'

interface RecommendedActivity {
    id: string
    title: string
    icon: any
    iconTintColor: string
    durationMinutes: number
}

interface DailyActivity {
    id: string
    title: string
    subtitle: string
    icon: any
    iconBgColor: string
    iconTintColor: string
    status: 'completed' | 'later' | 'new' | 'in_progress'
}

const MOCK_CHILD = {
    name: 'Zaid',
    age: 6,
    avatar: require('@/assets/images/boy.png'),
    badges: [
        { label: 'Level 2', color: '#A78BFA' },
        { label: 'Age 8',   color: '#60A5FA' },
    ],
}

const RECOMMENDED: RecommendedActivity[] = [
    {
        id: '1',
        title: 'Free drawing',
        icon: require('@/assets/images/icons/color.png'),
        iconTintColor: '#7C3AED',
        durationMinutes: 10,
    },
    {
        id: '2',
        title: 'Interactive puzzle',
        icon: require('@/assets/images/icons/shapes.png'),
        iconTintColor: '#7C3AED',
        durationMinutes: 23,
    },
]

const DAILY_ACTIVITIES: DailyActivity[] = [
    {
        id: '1',
        title: 'Breathing exercise',
        subtitle: 'With parents · Morning',
        icon: require('@/assets/images/icons/growth.png'),
        iconBgColor: '#BBF7D0',
        iconTintColor: '#00C688',
        status: 'completed',
    },
    {
        id: '2',
        title: 'Social play',
        subtitle: 'With friends · Evening',
        icon: require('@/assets/images/icons/influencer.png'),
        iconBgColor: '#FDE68A',
        iconTintColor: '#D97706',
        status: 'later',
    },
]

const TABS = ['Progress', 'Quizes', 'Activities', 'Homeworks']

export default function ActivitiesScreen() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('Activities')
    const activeChild = useActiveChildStore((s) => s.activeChild)
    const childName = activeChild?.fullNameAr ?? activeChild?.fullNameEn ?? 'Zaid'
    const childAge  = activeChild?.dateOfBirth ? Math.floor((Date.now()-new Date(activeChild.dateOfBirth).getTime())/(1000*60*60*24*365)) : 6
    const childBadges = [...(activeChild?.level ? [{ label: `Level ${activeChild.level}`, color: '#A78BFA' }] : [{ label: 'Level 2', color: '#A78BFA' }]),{ label: `Age ${childAge}`, color: '#60A5FA' }]

    const handleTabChange = (tab: string) => {
        if (tab === 'Progress') {
            router.replace('/(parent)/progress/progress-page')
            return
        }
        if (tab === 'Quizes') {
            router.replace('/(parent)/progress/quiz')
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
                title={t('activities.title')}
                onBack={() => router.back()}
                rightElement={<HeaderRightButton onPress={() => router.push('/(parent)/settings' as any)} />}
            />

            <ChildSelector
                name={childName}
                age={childAge}
                avatar={require('@/assets/images/boy.png')}
                badges={childBadges}
                onPress={() => {}}
            />

            <TabBar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <Text variant="heading" style={styles.sectionTitle}>
                    ☆ {t('activities.recommendedFor', { name: childName })}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendedList}>
                    {RECOMMENDED.map((item) => (
                        <RecommendedCard
                            key={item.id}
                            item={item}
                            minsLabel={t('activities.mins', { count: item.durationMinutes })}
                            onPress={() => router.push(`/(parent)/activity/${item.id}` as any)}
                        />
                    ))}
                </ScrollView>

                <View style={styles.sectionHeader}>
                    <Text variant="heading" style={styles.sectionTitle}>🏃 {t('activities.daily')}</Text>
                    <TouchableOpacity onPress={() => router.push('/(parent)/activities-all' as any)}>
                        <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
                    </TouchableOpacity>
                </View>

                {DAILY_ACTIVITIES.map((item) => (
                    <DailyCard key={item.id} item={item} onPress={() => router.push(`/(parent)/activity/${item.id}` as any)} />
                ))}
            </ScrollView>
        </ScreenWrapper>
    )
}

function RecommendedCard({ item, minsLabel, onPress }: { item: RecommendedActivity; minsLabel: string; onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.recommendedCard} onPress={onPress} activeOpacity={0.7}>
            <Image source={item.icon} style={[styles.recommendedIcon, { tintColor: item.iconTintColor }]} resizeMode="contain" />
            <Text style={styles.recommendedTitle}>{item.title}</Text>
            <Text style={styles.recommendedMeta}>· {minsLabel}</Text>
        </TouchableOpacity>
    )
}

function DailyCard({ item, onPress }: { item: DailyActivity; onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.dailyCard} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.dailyIconBox, { backgroundColor: item.iconBgColor }]}>
                <Image source={item.icon} style={[styles.dailyIcon, { tintColor: item.iconTintColor }]} resizeMode="contain" />
            </View>
            <View style={styles.dailyInfo}>
                <Text style={styles.dailyTitle}>{item.title}</Text>
                <Text style={styles.dailySubtitle}>{item.subtitle}</Text>
            </View>
            <StatusBadge variant={item.status} />
        </TouchableOpacity>
    )
}

function HeaderRightButton({ onPress }: { onPress: () => void }) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.settingsBtn}>
            <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    scroll: { flex: 1 },
    scrollContent: {
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
        gap: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Lexend_700Bold',
        color: theme.colors.textPrimary,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    },
    recommendedMeta: {
        fontSize: 12,
        fontFamily: 'Lexend_400Regular',
        color: theme.colors.textMuted,
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
    },
    dailySubtitle: {
        fontSize: 12,
        fontFamily: 'Lexend_400Regular',
        color: theme.colors.textMuted,
    },
    settingsBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    settingsIcon: { fontSize: 20 },
})