import React, { useState } from 'react'
import { View, StyleSheet, Image, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { theme } from '@/theme'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/Appstore'
import { Text } from '@/components/modal/shared/Text'
import Header from '@/components/modal/shared/Header'
import Card from '@/components/modal/shared/Card'
import Badge from '@/components/modal/shared/Badge'
import { Button } from '@/components/modal/shared/Button'
import KeepGoingBanner from '@/components/modal/shared/KeepGoingBanner'
import BottomNav from '@/components/modal/shared/BottomNav'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import SubmitHWModal from '@/components/variants/SubmitHWModal'
import SubmitSuccessModal from '@/components/variants/SubmitSuccessModal'
import DownloadDoneModal from '@/components/variants/DownloadDoneModal'

export default function HomeworkDetail() {
    const { t } = useTranslation()
    const isRTL = useAppStore((state) => state.isRTL)
    const [showSubmitModal, setShowSubmitModal] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showDownloadModal, setShowDownloadModal] = useState(false)

    return (
        <ScreenWrapper padded={false}>
            <Header title={t('homework.title')} onBack={() => router.back()} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Card variant="outlined" style={styles.mainCard}>
                    <View style={styles.iconContainer}>
                        <Image source={require('@/assets/images/icons/math.png')} style={styles.icon} />
                    </View>
                    <Text style={styles.title}>{t('homework.cards.counting')}</Text>
                    <Text style={[styles.meta, isRTL && styles.textRTL]}>
                        {t('homework.cards.mathMeta', { questions: 5, mins: 10 })}
                    </Text>

                    <View style={styles.badgeRow}>
                        <Badge label="H.W 3" variant="blue" />
                        <Badge label={`${t('common.level')} 3`} variant="purple" />
                        <Badge label={t('homework.status.not_submitted')} variant="orange" />
                    </View>
                </Card>

                <Button
                    label={t('homework.openHw')}
                    onPress={() => setShowSubmitModal(true)}
                    variant="primary"
                    style={styles.actionBtn}
                    textStyle={styles.actionBtnText}
                />

                <Button
                    label={t('common.download')}
                    onPress={() => setShowDownloadModal(true)}
                    variant="secondary"
                    style={styles.actionBtn}
                    textStyle={styles.actionBtnText}
                />

                <View style={styles.bannerWrapper}>
                    <KeepGoingBanner
                        completed={2}
                        total={5}
                        unit={t('homework.keepGoingUnit')}
                        period={t('homework.keepGoingPeriod')}
                    />
                </View>
            </ScrollView>

            <BottomNav />

            <SubmitHWModal
                visible={showSubmitModal}
                onSubmit={() => {
                    setShowSubmitModal(false)
                    setShowSuccessModal(true)
                }}
            />

            <SubmitSuccessModal
                visible={showSuccessModal}
                hwName="H.W 3"
                onClose={() => setShowSuccessModal(false)}
            />

            <DownloadDoneModal
                visible={showDownloadModal}
                activityName="Activity 1"
                onClose={() => setShowDownloadModal(false)}
            />
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
        alignItems: 'stretch',
        gap: theme.spacing.md,
    },
    mainCard: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: theme.colors.successLight,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    icon: {
        width: 44,
        height: 44,
    },
    title: {
        fontSize: 18,
        fontFamily: 'Lexend_700Bold',
        textAlign: 'center',
    },
    meta: {
        color: theme.colors.textMuted,
        marginTop: 8,
        fontSize: theme.typography.fontSize.sm,
        textAlign: 'center',
    },
    textRTL: {
        textAlign: 'center',
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    actionBtn: {
        width: '100%',
        borderRadius: 50,
    },
    actionBtnText: {
        fontSize: 16,
    },
    bannerWrapper: {
        width: '100%',
        marginTop: 4,
    },
})
