import React from 'react'
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useTranslation } from 'react-i18next'
import Badge from '@/components/modal/shared/Badge'
import ProgressBar from '@/components/modal/shared/progressBar'
import { theme } from '@/theme'
import { Text } from '@/components/modal/shared/Text'
import Avatar from '@/components/modal/shared/Avatar'
import BottomNav from '@/components/modal/shared/BottomNav'
import Card from '@/components/modal/shared/Card'
import CalendarStrip from './calender'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import { useAppStore } from '@/store/Appstore'

const { colors, spacing, typography, radius } = theme

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
}

const PARENT_NAME = 'Ayoub'

function ChildCard({ t, isRTL }: { t: (key: string, opts?: any) => string; isRTL: boolean }) {
    return (
        <Card variant="elevated" padded style={cardStyles.container}>
            <View style={[cardStyles.topRow, isRTL && cardStyles.topRowRTL]}>
                <Avatar name={CHILD.name} imageUri={CHILD.imageUri} size="md" />
                <View style={cardStyles.info}>
                    <Text variant="body" style={[cardStyles.name, isRTL && cardStyles.textRTL]}>
                        {CHILD.name}
                    </Text>
                    <View style={[cardStyles.badges, isRTL && cardStyles.badgesRTL]}>
                        <Badge label={`${t('parent.home.childCard.level')} ${CHILD.level}`} variant="blue" />
                        <Badge label={`${t('parent.home.childCard.age')} ${CHILD.age}`} variant="green" />
                        <Badge label={CHILD.disability} variant="orange" />
                    </View>
                </View>
                <Text variant="body" style={cardStyles.percent}>{CHILD.progress}%</Text>
            </View>

            <ProgressBar value={CHILD.progress} height={8} showLabel={false} />

            <View style={[cardStyles.statsRow, isRTL && cardStyles.statsRowRTL]}>
                <View style={cardStyles.stat}>
                    <Image
                        source={require('@/assets/images/icons/check-mark.png')}
                        style={[cardStyles.stsimg, { tintColor: colors.success }]}
                    />
                    <Text variant="caption" style={cardStyles.statText}>
                        {CHILD.tasks} {t('parent.home.childCard.tasks')}
                    </Text>
                </View>
                <View style={cardStyles.divider} />
                <View style={cardStyles.stat}>
                    <Image
                        source={require('@/assets/images/icons/calendar.png')}
                        style={[cardStyles.stsimg, { tintColor: colors.textSecondary }]}
                    />
                    <Text variant="caption" style={cardStyles.statText}>
                        {CHILD.daysInRow} {t('parent.home.childCard.streak')}
                    </Text>
                </View>
                <View style={cardStyles.divider} />
                <View style={cardStyles.stat}>
                    <Image
                        source={require('@/assets/images/icons/ribbon.png')}
                        style={[cardStyles.stsimg, { tintColor: colors.warning }]}
                    />
                    <Text variant="caption" style={cardStyles.statText}>
                        {CHILD.achievements} {t('parent.home.childCard.achievements')}
                    </Text>
                </View>
            </View>
        </Card>
    )
}

const cardStyles = StyleSheet.create({
    container: {
        gap: spacing.md,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.9,
        shadowRadius: 7,
        elevation: 6,
        shadowColor: theme.colors.black,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    topRowRTL: {
        flexDirection: 'row-reverse',
    },
    info: {
        flex: 1,
        gap: spacing.xs,
    },
    name: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.textPrimary,
        textAlign: 'left',
    },
    textRTL: {
        textAlign: 'right',
    },
    badges: {
        flexDirection: 'row',
        gap: spacing.xs,
        flexWrap: 'wrap',
    },
    badgesRTL: {
        flexDirection: 'row-reverse',
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
        margin: spacing.sm,
        marginBottom: 0,
    },
    statsRowRTL: {
        flexDirection: 'row-reverse',
    },
    stsimg: {
        width: 19,
        height: 19,
    },
    stat: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 9,
        fontFamily: typography.fontFamily.regular,
        color: colors.textSecondary,
    },
    divider: {
        width: 1,
        height: 19,
        backgroundColor: colors.border,
    },
})

function QuickAccess({ t, isRTL }: { t: (key: string) => string; isRTL: boolean }) {
    const quickAccessItems = [
        {
            labelKey: 'parent.home.quickAccess.schoolPage',
            icon: require('@/assets/images/icons/school-icon.png'),
            iconColor: colors.primary,
            containerColor: colors.primaryLighter,
            route: '/(parent)/school/school-parent',
        },
        {
            labelKey: 'parent.home.quickAccess.progressReports',
            icon: require('@/assets/images/icons/growth.png'),
            iconColor: '#059669',
            containerColor: '#D1FAE5',
            route: '/(parent)/progress/progress-page',
        },
        {
            labelKey: 'parent.home.quickAccess.tree',
            icon: require('@/assets/images/icons/roadmap.png'),
            iconColor: '#A459D1',
            containerColor: '#F3E8FF',
            route: '/(parent)/roadmap/roadmap',
        },
        {
            labelKey: 'parent.home.quickAccess.specialEd',
            icon: require('@/assets/images/icons/influencer.png'),
            iconColor: '#D97706',
            containerColor: '#FEF3C7',
            route: '/special-education',
        },
    ]

    return (
        <View style={qaStyles.container}>
            <Text variant="heading" style={[qaStyles.title, isRTL && qaStyles.textRTL]}>
                {t('parent.home.quickAccess.title')}
            </Text>
            <View style={qaStyles.grid}>
                {quickAccessItems.map((item) => (
                    <TouchableOpacity
                        key={item.route}
                        style={qaStyles.item}
                        onPress={() => router.push(item.route as any)}
                        activeOpacity={0.6}
                    >
                        <View style={[qaStyles.iconBox, { backgroundColor: item.containerColor }]}>
                            <Image source={item.icon} style={[qaStyles.icon, { tintColor: item.iconColor }]} />
                        </View>
                        <Text variant="label" style={qaStyles.label}>{t(item.labelKey)}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

const qaStyles = StyleSheet.create({
    container: {
        gap: spacing.md,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.textPrimary,
        textAlign: 'left',
    },
    textRTL: {
        textAlign: 'right',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        justifyContent: 'space-between',
    },
    item: {
        width: '47%',
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
        alignItems: 'center',
        gap: spacing.sm,
        shadowColor: '#3b3b3b',
        shadowOpacity: 0.04,
        shadowRadius: 9,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6B7A99',
        shadowOpacity: 0.09,
        shadowRadius: 6,
        elevation: 1.7,
    },
    icon: {
        width: 25,
        height: 25,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.textPrimary,
        textAlign: 'center',
    },
})

export default function HomeScreen() {
    const { t } = useTranslation()
    const isRTL = useAppStore((state) => state.isRTL)

    return (
        <ScreenWrapper padded={false}>
            <StatusBar style="dark" />

            <View style={styles.topBar}>
                <View style={[styles.userRow, isRTL && styles.userRowRTL]}>
                    <Avatar name={PARENT_NAME} size="sm" />
                    <View>
                        <Text variant="caption" style={[styles.welcomeText, isRTL && styles.textRTL]}>
                            {t('parent.home.greeting')}
                        </Text>
                        <Text variant="body" style={[styles.parentName, isRTL && styles.textRTL]}>
                            {PARENT_NAME}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.bellBtn}>
                    <Image source={require('@/assets/images/icons/ringing.png')} style={styles.bell} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator>
                <ChildCard t={t} isRTL={isRTL} />
                <CalendarStrip />
                <QuickAccess t={t} isRTL={isRTL} />
            </ScrollView>

            <BottomNav />
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
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
    userRowRTL: {
        flexDirection: 'row-reverse',
    },
    welcomeText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.textSecondary,
        textAlign: 'left',
    },
    parentName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.textPrimary,
        textAlign: 'left',
    },
    textRTL: {
        textAlign: 'right',
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
        width: 19,
        height: 19,
        tintColor: colors.textPrimary,
    },
    scroll: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
    },
})
