import React, { useMemo } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { theme } from '@/theme'
import { useAppStore } from '@/store/Appstore'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import Card from '@/components/modal/shared/Card'
import BottomNav from '@/components/modal/shared/BottomNav'
import { Button } from '@/components/modal/shared/Button'
import { Text } from '@/components/modal/shared/Text'

type QuickAccessKey = 'centers' | 'specialists' | 'services' | 'contact'

interface SupportCenter {
    id: string
    name: string
    subtitle: string
    distance: string
    type: QuickAccessKey
    accent: string
    tint: string
    icon: keyof typeof Ionicons.glyphMap
}

export default function SpecialEducationScreen() {
    const { t } = useTranslation()
    const isRTL = useAppStore((state) => state.isRTL)

    const quickCards = useMemo(
        () => [
            {
                key: 'centers' as QuickAccessKey,
                icon: 'business-outline' as const,
                accent: '#DBEAFE',
                tint: '#2563EB',
            },
            {
                key: 'specialists' as QuickAccessKey,
                icon: 'medkit-outline' as const,
                accent: '#FCE7F3',
                tint: '#DB2777',
            },
            {
                key: 'services' as QuickAccessKey,
                icon: 'sparkles-outline' as const,
                accent: '#FEF3C7',
                tint: '#D97706',
            },
            {
                key: 'contact' as QuickAccessKey,
                icon: 'chatbubbles-outline' as const,
                accent: '#DCFCE7',
                tint: '#16A34A',
            },
        ],
        []
    )

    const centers = useMemo<SupportCenter[]>(
        () => [
            {
                id: '1',
                name: t('specialEducation.centers.items.first.name'),
                subtitle: t('specialEducation.centers.items.first.subtitle'),
                distance: t('specialEducation.centers.items.first.distance'),
                type: 'centers',
                accent: '#DBEAFE',
                tint: '#2563EB',
                icon: 'school-outline',
            },
            {
                id: '2',
                name: t('specialEducation.centers.items.second.name'),
                subtitle: t('specialEducation.centers.items.second.subtitle'),
                distance: t('specialEducation.centers.items.second.distance'),
                type: 'specialists',
                accent: '#FCE7F3',
                tint: '#DB2777',
                icon: 'person-outline',
            },
            {
                id: '3',
                name: t('specialEducation.centers.items.third.name'),
                subtitle: t('specialEducation.centers.items.third.subtitle'),
                distance: t('specialEducation.centers.items.third.distance'),
                type: 'services',
                accent: '#FEF3C7',
                tint: '#D97706',
                icon: 'compass-outline',
            },
        ],
        [t]
    )

    return (
        <ScreenWrapper padded={false} scroll={false}>
            <Header title={t('specialEducation.title')} onBack={() => router.back()} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Card variant="elevated" style={styles.heroCard}>
                    <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>
                        {t('specialEducation.pageTitle')}
                    </Text>
                    <Text style={[styles.heroDescription, isRTL && styles.textRTL]}>
                        {t('specialEducation.description')}
                    </Text>
                </Card>

                <View style={[styles.grid, isRTL && styles.gridRTL]}>
                    {quickCards.map((item) => (
                        <Card key={item.key} variant="default" style={styles.quickCard}>
                            <View style={[styles.quickIconBox, { backgroundColor: item.accent }]}>
                                <Ionicons name={item.icon} size={22} color={item.tint} />
                            </View>
                            <Text style={[styles.quickTitle, isRTL && styles.textRTL]}>
                                {t(`specialEducation.quickCards.${item.key}.title`)}
                            </Text>
                            <Text style={[styles.quickDescription, isRTL && styles.textRTL]}>
                                {t(`specialEducation.quickCards.${item.key}.description`)}
                            </Text>
                        </Card>
                    ))}
                </View>

                <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
                    <Text variant="heading" style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                        {t('specialEducation.sectionTitle')}
                    </Text>
                    <Text style={styles.sectionHint}>{t('specialEducation.sectionHint')}</Text>
                </View>

                {centers.map((center) => (
                    <Card key={center.id} variant="elevated" style={styles.centerCard}>
                        <View style={[styles.centerTopRow, isRTL && styles.centerTopRowRTL]}>
                            <View style={[styles.centerIconBox, { backgroundColor: center.accent }]}>
                                <Ionicons name={center.icon} size={24} color={center.tint} />
                            </View>
                            <View style={styles.centerBody}>
                                <Text style={[styles.centerName, isRTL && styles.textRTL]}>
                                    {center.name}
                                </Text>
                                <Text style={[styles.centerSubtitle, isRTL && styles.textRTL]}>
                                    {center.subtitle}
                                </Text>
                            </View>
                            <View style={styles.distancePill}>
                                <Text style={styles.distanceText}>{center.distance}</Text>
                            </View>
                        </View>

                        <View style={[styles.actionsRow, isRTL && styles.actionsRowRTL]}>
                            <Button
                                label={t('specialEducation.actions.call')}
                                onPress={() => {}}
                                variant="outline"
                                style={styles.actionButton}
                                textStyle={{fontSize: 13}}
                            />
                            <Button
                                label={t('specialEducation.actions.message')}
                                onPress={() => {}}
                                variant="secondary"
                                style={styles.actionButton}
                                 textStyle={{fontSize: 13}}
                            />
                            <Button
                                label={t('specialEducation.actions.directions')}
                                onPress={() => {}}
                                variant="primary"
                                style={styles.actionButton}
                                textStyle={{fontSize: 13}}
                            />
                        </View>
                    </Card>
                ))}
            </ScrollView>

            <BottomNav />
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    content: {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.lg,
        paddingBottom: 120,
        gap: theme.spacing.lg,
    },
    heroCard: {
        backgroundColor: '#FFF7ED',
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    heroTitle: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.textPrimary,
        textAlign: 'left',
        marginBottom: theme.spacing.xs,
    },
    heroDescription: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textSecondary,
        lineHeight: 20,
        textAlign: 'left',
    },
    textRTL: {
        textAlign: 'right',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
    },
    gridRTL: {
        flexDirection: 'row-reverse',
    },
    quickCard: {
        width: '47%',
        minHeight: 150,
        padding: theme.spacing.md,
    },
    quickIconBox: {
        width: 46,
        height: 46,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.sm,
    },
    quickTitle: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.textPrimary,
        textAlign: 'left',
        marginBottom: 6,
    },
    quickDescription: {
        fontSize: theme.typography.fontSize.xs,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textSecondary,
        lineHeight: 18,
        textAlign: 'left',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionHeaderRTL: {
        flexDirection: 'row-reverse',
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.textPrimary,
        textAlign: 'left',
    },
    sectionHint: {
        fontSize: theme.typography.fontSize.xs,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.primary,
    },
    centerCard: {
        gap: theme.spacing.md,
    },
    centerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    centerTopRowRTL: {
        flexDirection: 'row-reverse',
    },
    centerIconBox: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerBody: {
        flex: 1,
    },
    centerName: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.textPrimary,
        textAlign: 'left',
    },
    centerSubtitle: {
        marginTop: 4,
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textSecondary,
        textAlign: 'left',
    },
    distancePill: {
        backgroundColor: theme.colors.primaryLighter,
        borderRadius: theme.radius.full,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 6,
    },
    distanceText: {
        color: theme.colors.primary,
        fontSize: theme.typography.fontSize.xs,
        fontFamily: theme.typography.fontFamily.semiBold,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    actionsRowRTL: {
        flexDirection: 'row-reverse',
    },
    actionButton: {
        fontSize: theme.typography.fontSize.sm,
        flex: 1,
        height: 44,
    },
})
