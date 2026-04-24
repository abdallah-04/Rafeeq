import React, { useMemo } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import Card from '@/components/modal/shared/Card'
import BottomNav from '@/components/modal/shared/BottomNav'
import { Text } from '@/components/modal/shared/Text'
import { theme } from '@/theme'
import { useAuthStore } from '@/store/authStore'

const { colors, spacing, typography, radius } = theme

type CardKey = 'centers' | 'specialists' | 'services' | 'contact'

interface SupportCenter {
  id: string
  name: string
  subtitle: string
  distance: string
  accent: string
  tint: string
  icon: keyof typeof Ionicons.glyphMap
}

export default function ExpertAdviceScreen() {
  const isRTL = useAuthStore((s) => s.isRTL)

  const copy = useMemo(
    () =>
      isRTL
        ? {
            title: 'التعليم الخاص',
            pageTitle: 'دعم التعليم الخاص',
            description:
              'دليل مبسط يساعد الأهل في الوصول إلى المراكز والأخصائيين والخدمات الداعمة بطريقة واضحة وسريعة.',
            sectionTitle: 'مراكز وخبراء قريبون',
            sectionHint: 'موصى بهم',
            actions: { call: 'اتصال', message: 'رسالة', directions: 'اتجاهات' },
            quickCards: [
              { key: 'centers' as CardKey, title: 'مراكز قريبة', description: 'مراكز تقييم ودعم مناسبة لاحتياج طفلك.' },
              { key: 'specialists' as CardKey, title: 'أخصائيون', description: 'الوصول إلى مختصين في النطق والسلوك والتعلم.' },
              { key: 'services' as CardKey, title: 'خدمات داعمة', description: 'جلسات، خطط تدريبية، وأنشطة مساندة.' },
              { key: 'contact' as CardKey, title: 'تواصل سريع', description: 'خيارات سهلة للاستفسار والحجز والمتابعة.' },
            ],
            centers: [
              {
                id: '1',
                name: 'مركز رفيق للدعم التربوي',
                subtitle: 'تقييم أولي، جلسات فردية، وخطة متابعة للأسرة.',
                distance: '2.4 كم',
                accent: '#DBEAFE',
                tint: '#2563EB',
                icon: 'school-outline' as const,
              },
              {
                id: '2',
                name: 'أخصائية نطق ولغة',
                subtitle: 'جلسات دعم لغوي ومتابعة أسبوعية للأهل.',
                distance: '3.1 كم',
                accent: '#FCE7F3',
                tint: '#DB2777',
                icon: 'person-outline' as const,
              },
              {
                id: '3',
                name: 'خدمة إرشاد أسري',
                subtitle: 'إرشادات منزلية بسيطة لدعم التعلم اليومي.',
                distance: 'متاح أونلاين',
                accent: '#FEF3C7',
                tint: '#D97706',
                icon: 'compass-outline' as const,
              },
            ] as SupportCenter[],
          }
        : {
            title: 'Special Education',
            pageTitle: 'Special Education Support',
            description:
              'A simple parent guide to nearby centers, specialists, and support services presented in a calm V0-style layout.',
            sectionTitle: 'Nearby Centers & Experts',
            sectionHint: 'Recommended',
            actions: { call: 'Call', message: 'Message', directions: 'Directions' },
            quickCards: [
              { key: 'centers' as CardKey, title: 'Nearby Centers', description: 'Find assessment and support centers that fit your child’s needs.' },
              { key: 'specialists' as CardKey, title: 'Specialists', description: 'Reach speech, behavior, and learning specialists quickly.' },
              { key: 'services' as CardKey, title: 'Support Services', description: 'Sessions, home plans, and extra learning support.' },
              { key: 'contact' as CardKey, title: 'Quick Contact', description: 'Simple options for questions, booking, and follow-up.' },
            ],
            centers: [
              {
                id: '1',
                name: 'Rafeeq Support Center',
                subtitle: 'Initial assessment, individual sessions, and a simple family plan.',
                distance: '2.4 km',
                accent: '#DBEAFE',
                tint: '#2563EB',
                icon: 'school-outline' as const,
              },
              {
                id: '2',
                name: 'Speech & Language Specialist',
                subtitle: 'Language support sessions with weekly parent follow-up.',
                distance: '3.1 km',
                accent: '#FCE7F3',
                tint: '#DB2777',
                icon: 'person-outline' as const,
              },
              {
                id: '3',
                name: 'Family Guidance Service',
                subtitle: 'Practical at-home guidance to support daily learning.',
                distance: 'Online',
                accent: '#FEF3C7',
                tint: '#D97706',
                icon: 'compass-outline' as const,
              },
            ] as SupportCenter[],
          },
    [isRTL]
  )

  const quickCards = useMemo(
    () => [
      { key: 'centers' as CardKey, icon: 'business-outline' as const, accent: '#DBEAFE', tint: '#2563EB' },
      { key: 'specialists' as CardKey, icon: 'medkit-outline' as const, accent: '#FCE7F3', tint: '#DB2777' },
      { key: 'services' as CardKey, icon: 'sparkles-outline' as const, accent: '#FEF3C7', tint: '#D97706' },
      { key: 'contact' as CardKey, icon: 'chatbubbles-outline' as const, accent: '#DCFCE7', tint: '#16A34A' },
    ],
    []
  )

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/(parent)/Home-parent' as any)
  }

  return (
    <ScreenWrapper padded={false} scroll={false}>
      <Header title={copy.title} onBack={handleBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" style={styles.heroCard}>
          <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>{copy.pageTitle}</Text>
          <Text style={[styles.heroDescription, isRTL && styles.textRTL]}>{copy.description}</Text>
        </Card>

        <View style={[styles.grid, isRTL && styles.gridRTL]}>
          {quickCards.map((item, index) => (
            <Card key={item.key} variant="default" style={styles.quickCard}>
              <View style={[styles.quickIconBox, { backgroundColor: item.accent }]}>
                <Ionicons name={item.icon} size={22} color={item.tint} />
              </View>
              <Text style={[styles.quickTitle, isRTL && styles.textRTL]}>
                {copy.quickCards[index].title}
              </Text>
              <Text style={[styles.quickDescription, isRTL && styles.textRTL]}>
                {copy.quickCards[index].description}
              </Text>
            </Card>
          ))}
        </View>

        <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{copy.sectionTitle}</Text>
          <Text style={styles.sectionHint}>{copy.sectionHint}</Text>
        </View>

        {copy.centers.map((center) => (
          <Card key={center.id} variant="elevated" style={styles.centerCard}>
            <View style={[styles.centerTopRow, isRTL && styles.centerTopRowRTL]}>
              <View style={[styles.centerIconBox, { backgroundColor: center.accent }]}>
                <Ionicons name={center.icon} size={24} color={center.tint} />
              </View>
              <View style={styles.centerBody}>
                <Text style={[styles.centerName, isRTL && styles.textRTL]}>{center.name}</Text>
                <Text style={[styles.centerSubtitle, isRTL && styles.textRTL]}>
                  {center.subtitle}
                </Text>
              </View>
              <View style={styles.distancePill}>
                <Text style={styles.distanceText}>{center.distance}</Text>
              </View>
            </View>

            <View style={[styles.actionsRow, isRTL && styles.actionsRowRTL]}>
              <TouchableOpacity style={[styles.actionButton, styles.actionOutline]} activeOpacity={0.8}>
                <Text style={styles.actionOutlineText}>{copy.actions.call}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.actionSecondary]} activeOpacity={0.8}>
                <Text style={styles.actionSecondaryText}>{copy.actions.message}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.actionPrimary]} activeOpacity={0.8}>
                <Text style={styles.actionPrimaryText}>{copy.actions.directions}</Text>
              </TouchableOpacity>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 120,
    gap: spacing.lg,
  },
  heroCard: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  heroTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'left',
    marginBottom: spacing.xs,
  },
  heroDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
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
    gap: spacing.md,
  },
  gridRTL: {
    flexDirection: 'row-reverse',
  },
  quickCard: {
    width: '47%',
    minHeight: 150,
    padding: spacing.md,
  },
  quickIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'left',
    marginBottom: 6,
  },
  quickDescription: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
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
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'left',
  },
  sectionHint: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.primary,
  },
  centerCard: {
    gap: spacing.md,
  },
  centerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'left',
  },
  centerSubtitle: {
    marginTop: 4,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'left',
  },
  distancePill: {
    backgroundColor: colors.primaryLighter,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  distanceText: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionsRowRTL: {
    flexDirection: 'row-reverse',
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  actionOutline: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  actionSecondary: {
    backgroundColor: colors.primaryLighter,
    borderColor: colors.primaryLighter,
  },
  actionPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionOutlineText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
  },
  actionSecondaryText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  actionPrimaryText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.white,
  },
})
