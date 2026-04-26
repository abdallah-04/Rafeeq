import React, { useState, useEffect, useCallback } from 'react'
import { Image, ScrollView, TouchableOpacity, View, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/theme'
import { Text } from '@/components/modal/shared/Text'
import { Button } from '@/components/modal/shared/Button'
import Card from '@/components/modal/shared/Card'
import Header from '@/components/modal/shared/Header'
import Avatar from '@/components/modal/shared/Avatar'
import Badge from '@/components/modal/shared/Badge'
import { apiGetTeachers, TeacherResponse } from '@/services/api'
import { useModal } from '@/components/modal/ModalProvider'
import { pickLocalizedName } from '@/utils/localizedName'

const { colors, spacing, radius } = theme

function TeacherCard({ teacher, t, isRTL }: { teacher: TeacherResponse; t: any; isRTL: boolean }) {
  const displayName = pickLocalizedName(isRTL, teacher.fullNameAr, teacher.fullNameEn)
  return (
    <TouchableOpacity onPress={() => router.push(`/(school)/teacher/${teacher.id}` as any)} activeOpacity={0.7}>
      <Card variant="elevated" style={styles.card}>
        <View style={styles.cardRow}>
          <Avatar name={displayName} size="md" />
          <View style={styles.cardInfo}>
            <View style={styles.cardTopRow}>
              <Text variant="label" color="textPrimary">{displayName}</Text>
              <Badge label={t('teachers.active')} variant="green" />
            </View>
            <Text variant="caption" color="textSecondary">{teacher.phone ?? '—'}</Text>
            <Text variant="caption" color="textMuted">ID: {teacher.nationalId}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  )
}

function EmptyState({ t }: { t: any }) {
  return (
    <View style={styles.emptyContainer}>
      <Image source={require('@/assets/images/mascot/rafeeq_clabbing.png')} style={styles.emptyImage} resizeMode="contain" />
      <Text variant="heading" color="textPrimary" style={styles.centered}>{t('teachers.emptyTitle')}</Text>
      <Text variant="caption" color="textSecondary" style={styles.emptySubtitle}>{t('teachers.emptySubtitle')}</Text>
      <Card variant="outlined" padded={false} style={styles.ghostCard}>{null}</Card>
      <Card variant="outlined" padded={false} style={styles.ghostCard}>{null}</Card>
      <Button label={t('teachers.addFirst')} onPress={() => router.push('/(school)/add-teacher')} style={styles.ctaBtn} />
    </View>
  )
}

export default function TeachersScreen() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { show } = useModal()
  const [teachers,   setTeachers]   = useState<TeacherResponse[]>([])
  const [isLoading,  setIsLoading]  = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setTeachers(await apiGetTeachers())
    } catch {
      show('error', { variant: 'invalidInfo' })
    } finally {
      setIsLoading(false); setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (isLoading) return <SafeAreaView style={styles.safe}><ActivityIndicator style={{ marginTop: 60 }} size="large" color={colors.primary} /></SafeAreaView>

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <Header title={t('teachers.title')} onBack={() => router.back()}
        rightElement={<TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(school)/add-teacher')} activeOpacity={0.8}><Ionicons name="add" size={22} color={colors.white} /></TouchableOpacity>}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} />}>
        {teachers.length === 0 ? <EmptyState t={t} /> : (
          <View style={styles.list}>
            {teachers.map(tc => <TeacherCard key={tc.id} teacher={tc} t={t} isRTL={isRTL} />)}
            <TouchableOpacity style={styles.ghostCardAdd} onPress={() => router.push('/(school)/add-teacher')} activeOpacity={0.7}>
              <Ionicons name="add" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  addBtn: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  list: { gap: spacing.md },
  card: { borderWidth: 1, borderColor: colors.border },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardInfo: { flex: 1, gap: spacing.xs },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  emptyContainer: { alignItems: 'center', gap: spacing.md, paddingTop: spacing.lg },
  emptyImage: { width: 120, height: 120 },
  centered: { textAlign: 'center' },
  emptySubtitle: { textAlign: 'center', lineHeight: 20, paddingHorizontal: spacing.lg },
  ghostCard: { width: '100%', height: 72, borderStyle: 'dashed', backgroundColor: colors.backgroundLight },
  ctaBtn: { width: '100%', marginTop: spacing.sm },
  ghostCardAdd: { height: 72, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', backgroundColor: colors.backgroundLight, alignItems: 'center', justifyContent: 'center' },
})
