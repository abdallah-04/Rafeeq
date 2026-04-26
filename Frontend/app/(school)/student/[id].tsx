import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import BackButton from '@/components/BackButton'
import {
  apiGetHomeworkForSchool,
  apiGetReportsForSchool,
  apiGetSchoolStudent,
  ChildResponse,
  HomeworkResponse,
  ReportResponse,
} from '@/services/api'
import { Text } from '@/components/modal/shared/Text'


type Tab = 'grades' | 'hw' | 'progress' | 'reports'

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString(locale === 'ar' ? 'ar-JO' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function InlineEmpty({
  title,
  description,
  isRTL,
}: {
  title: string
  description: string
  isRTL: boolean
}) {
  return (
    <View style={tabStyles.emptyCard}>
      <Text style={[tabStyles.emptyTitle, isRTL && tabStyles.textRight]}>{title}</Text>
      <Text style={[tabStyles.emptyText, isRTL && tabStyles.textRight]}>{description}</Text>
    </View>
  )
}

function GradesTab({ isRTL }: { isRTL: boolean }) {
  return (
    <ScrollView contentContainerStyle={tabStyles.content} showsVerticalScrollIndicator={false}>
      <Text style={[tabStyles.sectionTitle, isRTL && tabStyles.textRight]}>
        {isRTL ? 'الدرجات' : 'Grades'}
      </Text>
      <InlineEmpty
        isRTL={isRTL}
        title={isRTL ? 'لا توجد درجات متاحة' : 'No grades available yet'}
        description={
          isRTL
            ? 'ستظهر الدرجات هنا عند توفر بيانات تقييم حقيقية لهذا الطالب.'
            : 'Grades will appear here when real assessment data becomes available for this student.'
        }
      />
    </ScrollView>
  )
}

function HomeworkTab({
  homework,
  isRTL,
  locale,
}: {
  homework: HomeworkResponse[]
  isRTL: boolean
  locale: string
}) {
  return (
    <ScrollView contentContainerStyle={tabStyles.content} showsVerticalScrollIndicator={false}>
      <Text style={[tabStyles.sectionTitle, isRTL && tabStyles.textRight]}>
        {isRTL ? 'الواجبات والمهام' : 'Homework & Tasks'}
      </Text>

      {homework.length === 0 ? (
        <InlineEmpty
          isRTL={isRTL}
          title={isRTL ? 'لا توجد واجبات حالياً' : 'No homework yet'}
          description={
            isRTL
              ? 'سيتم عرض الواجبات والمهام الحقيقية هنا عند توفرها.'
              : 'Real homework and tasks will appear here when they are available.'
          }
        />
      ) : (
        homework.map((item) => (
          <View key={item.id} style={tabStyles.hwCard}>
            <View style={tabStyles.hwIcon}>
              <Text style={{ fontSize: 18 }}>📚</Text>
            </View>
            <View style={tabStyles.hwInfo}>
              <Text style={[tabStyles.hwTitle, isRTL && tabStyles.textRight]}>{item.title}</Text>
              <Text style={[tabStyles.hwSubject, isRTL && tabStyles.textRight]} numberOfLines={2}>
                {item.description || (isRTL ? 'بدون وصف' : 'No description')}
              </Text>
              <Text style={[tabStyles.hwMeta, isRTL && tabStyles.textRight]}>
                {isRTL ? 'تاريخ الاستحقاق:' : 'Due:'} {formatDate(item.dueDate, locale)}
              </Text>
            </View>
            <View
              style={[
                tabStyles.statusBadge,
                item.status === 'COMPLETED' ? tabStyles.badgeDone : tabStyles.badgePending,
              ]}
            >
              <Text
                style={[
                  tabStyles.statusText,
                  item.status === 'COMPLETED' ? tabStyles.textDone : tabStyles.textPending,
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  )
}

function ProgressTab({ student, isRTL }: { student: ChildResponse; isRTL: boolean }) {
  const level = student.assessedLevel ?? student.level ?? 0
  const progress = Math.min(Math.max(level * 20, 0), 100)

  return (
    <ScrollView contentContainerStyle={tabStyles.content} showsVerticalScrollIndicator={false}>
      <View style={tabStyles.overallCard}>
        <Text style={[tabStyles.overallTitle, isRTL && tabStyles.textRight]}>
          {isRTL ? 'التقدم العام' : 'Overall progress'}
        </Text>
        <Text style={[tabStyles.overallSub, isRTL && tabStyles.textRight]}>
          {isRTL ? 'بناءً على المستوى الحالي' : 'Based on the current level'}
        </Text>
        <View style={[tabStyles.overallRow, isRTL && tabStyles.rowReverse]}>
          <View style={tabStyles.overallTrack}>
            <View style={[tabStyles.overallFill, { width: `${progress}%` }]} />
          </View>
          <Text style={tabStyles.overallPct}>{`${progress}%`}</Text>
        </View>
      </View>

      <View style={tabStyles.progressInfoGrid}>
        <View style={tabStyles.progressInfoCard}>
          <Text style={[tabStyles.progressInfoLabel, isRTL && tabStyles.textRight]}>
            {isRTL ? 'المستوى الحالي' : 'Current level'}
          </Text>
          <Text style={[tabStyles.progressInfoValue, isRTL && tabStyles.textRight]}>
            {student.level ?? '—'}
          </Text>
        </View>
        <View style={tabStyles.progressInfoCard}>
          <Text style={[tabStyles.progressInfoLabel, isRTL && tabStyles.textRight]}>
            {isRTL ? 'المستوى المقيم' : 'Assessed level'}
          </Text>
          <Text style={[tabStyles.progressInfoValue, isRTL && tabStyles.textRight]}>
            {student.assessedLevel ?? '—'}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

function ReportsTab({
  reports,
  isRTL,
  locale,
}: {
  reports: ReportResponse[]
  isRTL: boolean
  locale: string
}) {
  return (
    <ScrollView contentContainerStyle={tabStyles.content} showsVerticalScrollIndicator={false}>
      <Text style={[tabStyles.sectionTitle, isRTL && tabStyles.textRight]}>
        {isRTL ? 'التقارير' : 'Reports'}
      </Text>

      {reports.length === 0 ? (
        <InlineEmpty
          isRTL={isRTL}
          title={isRTL ? 'لا توجد تقارير حالياً' : 'No reports yet'}
          description={
            isRTL
              ? 'ستظهر التقارير الحقيقية هنا عند إضافتها لهذا الطالب.'
              : 'Real reports will appear here when they are created for this student.'
          }
        />
      ) : (
        reports.map((report) => (
          <View key={report.id} style={tabStyles.reportCard}>
            <Text style={[tabStyles.reportTitle, isRTL && tabStyles.textRight]}>{report.title}</Text>
            <Text style={[tabStyles.reportText, isRTL && tabStyles.textRight]}>{report.content}</Text>
            <Text style={[tabStyles.reportTime, isRTL && tabStyles.textRight]}>
              {formatDate(report.createdAt, locale)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  )
}

export default function SchoolStudentDetailScreen() {
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const { id, teacherId } = useLocalSearchParams<{ id: string; teacherId?: string }>()
  const isRTL = i18n.language === 'ar'

  const [student, setStudent] = useState<ChildResponse | null>(null)
  const [homework, setHomework] = useState<HomeworkResponse[]>([])
  const [reports, setReports] = useState<ReportResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('grades')

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
      return
    }

    if (teacherId) {
      router.replace(`/(school)/teacher/${teacherId}` as any)
      return
    }

    router.replace('/(school)/teachers' as any)
  }, [router, teacherId])

  const load = useCallback(async () => {
    try {
      const child = await apiGetSchoolStudent(id ?? '')
      setStudent(child)

      const [homeworkData, reportsData] = await Promise.all([
        apiGetHomeworkForSchool(id ?? '').catch(() => []),
        apiGetReportsForSchool(id ?? '').catch(() => []),
      ])

      setHomework(homeworkData.filter((item) => !item.treeItemId && !item.treeId))
      setReports(reportsData)
    } catch {
      setStudent(null)
      setHomework([])
      setReports([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const tabs: { key: Tab; label: string; labelAr: string }[] = [
    { key: 'grades', label: 'Grades', labelAr: 'الدرجات' },
    { key: 'hw', label: 'Homework', labelAr: 'الواجبات' },
    { key: 'progress', label: 'Progress', labelAr: 'التقدم' },
    { key: 'reports', label: 'Reports', labelAr: 'التقارير' },
  ]

  const displayName = useMemo(() => {
    if (!student) return '—'
    return student.fullNameEn ?? student.fullNameAr ?? '—'
  }, [student])

  const age = useMemo(() => {
    if (!student?.dateOfBirth) return null

    const birthDate = new Date(student.dateOfBirth)
    if (Number.isNaN(birthDate.getTime())) return null

    return Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365))
  }, [student?.dateOfBirth])

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: 60 }} color="#508DF7" />
      </SafeAreaView>
    )
  }

  if (!student) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.navBar, isRTL && styles.rowReverse]}>
          <BackButton onPress={handleBack} />
          <View style={styles.navCenter}>
            <Text style={styles.navTitle}>{t('students.title', 'Student')}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.notFoundText}>{t('students.emptyTitle', 'Student not found')}</Text>
      </SafeAreaView>
    )
  }

  const level = student.level ?? student.assessedLevel
  const progress = Math.min(Math.max((student.assessedLevel ?? student.level ?? 0) * 20, 0), 100)
  const avatarColors = ['#FFD9B3', '#C8E6C9', '#BBDEFB', '#F8BBD0']
  const avatarBg = avatarColors[displayName.charCodeAt(0) % avatarColors.length]
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.navBar, isRTL && styles.rowReverse]}>
        <BackButton onPress={handleBack} />
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>{displayName}</Text>
          {student.learningDifficulty ? (
            <Text style={styles.navSub}>{student.learningDifficulty.replace(/_/g, ' ')}</Text>
          ) : null}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              load()
            }}
          />
        }
      >
        <View style={styles.headerCard}>
          <View style={[styles.headerInner, isRTL && styles.rowReverse]}>
            <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
              <Text style={styles.avatarText}>{initials || '?'}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.studentName, isRTL && styles.textRight]}>{displayName}</Text>
              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressPct}>{`${progress}%`}</Text>
              </View>
              <View style={[styles.tagsRow, isRTL && styles.rowReverse]}>
                {student.learningDifficulty ? (
                  <View style={styles.tagOrange}>
                    <Text style={styles.tagOrangeText}>
                      {student.learningDifficulty.replace(/_/g, ' ')}
                    </Text>
                  </View>
                ) : null}
                {age != null ? (
                  <View style={styles.tagBlue}>
                    <Text style={styles.tagBlueText}>
                      {isRTL ? `${age} سنة` : `${age} Years`}
                    </Text>
                  </View>
                ) : null}
                {level != null ? (
                  <View style={styles.tagPurple}>
                    <Text style={styles.tagPurpleText}>
                      {isRTL ? `Level ${level}`.replace('Level', 'المستوى') : `Level ${level}`}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
          <View style={[styles.metaRow, isRTL && styles.rowReverse]}>
            <Text style={styles.metaText}>
              {student.teacherId
                ? isRTL
                  ? 'المعلم مُعيَّن'
                  : 'Teacher assigned'
                : isRTL
                  ? 'لا يوجد معلم بعد'
                  : 'No teacher yet'}
            </Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>
              {student.status === 'ACTIVE'
                ? isRTL
                  ? 'نشط'
                  : 'Active'
                : isRTL
                  ? 'قيد الانتظار'
                  : 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.tabBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabBarContent}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {isRTL ? tab.labelAr : tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ flex: 1 }}>
          {activeTab === 'grades' && <GradesTab isRTL={isRTL} />}
          {activeTab === 'hw' && (
            <HomeworkTab homework={homework} isRTL={isRTL} locale={i18n.language} />
          )}
          {activeTab === 'progress' && <ProgressTab student={student} isRTL={isRTL} />}
          {activeTab === 'reports' && (
            <ReportsTab reports={reports} isRTL={isRTL} locale={i18n.language} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  navCenter: { alignItems: 'center' },
  navTitle: { fontFamily: 'Lexend_700Bold', fontSize: 17, color: '#1a1a2e' },
  navSub: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  notFoundText: { textAlign: 'center', marginTop: 60, color: '#9CA3AF' },
  headerCard: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#508DF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 12,
  },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(80,141,247,0.15)',
    flexShrink: 0,
  },
  avatarText: { fontFamily: 'Lexend_700Bold', fontSize: 20, color: '#1a1a2e' },
  headerInfo: { flex: 1 },
  studentName: { fontFamily: 'Lexend_700Bold', fontSize: 17, color: '#1a1a2e', marginBottom: 6 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  progressTrack: {
    flex: 1,
    height: 7,
    backgroundColor: '#EEF2FF',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#508DF7', borderRadius: 99 },
  progressPct: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: '#508DF7',
    minWidth: 32,
    textAlign: 'right',
  },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tagOrange: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  tagOrangeText: { fontFamily: 'Lexend_600SemiBold', fontSize: 10, color: '#D97706' },
  tagBlue: { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  tagBlueText: { fontFamily: 'Lexend_600SemiBold', fontSize: 10, color: '#1D4ED8' },
  tagPurple: { backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  tagPurpleText: { fontFamily: 'Lexend_600SemiBold', fontSize: 10, color: '#7C3AED' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  metaText: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#6B7280' },
  metaDot: { color: '#D1D5DB', fontSize: 12 },
  tabBar: { backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E8EEFF' },
  tabBarContent: { paddingHorizontal: 16, paddingVertical: 4, gap: 4 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99 },
  tabBtnActive: { backgroundColor: '#508DF7' },
  tabText: { fontFamily: 'Lexend_500Medium', fontSize: 13, color: '#9CA3AF' },
  tabTextActive: { color: '#fff', fontFamily: 'Lexend_700Bold' },
})

const tabStyles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
  sectionTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 15,
    color: '#1a1a2e',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
    color: '#1a1a2e',
  },
  emptyText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 20,
  },
  hwCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  hwIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hwInfo: { flex: 1 },
  hwTitle: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#1a1a2e' },
  hwSubject: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  hwMeta: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  badgeDone: {
    backgroundColor: '#E6F9F0',
  },
  badgePending: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
  },
  textDone: {
    color: '#22C55E',
  },
  textPending: {
    color: '#E65100',
  },
  overallCard: {
    backgroundColor: '#508DF7',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  overallTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 16,
    color: '#fff',
    marginBottom: 2,
  },
  overallSub: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 10,
  },
  overallRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  overallTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  overallFill: { height: '100%', backgroundColor: '#FFB84C', borderRadius: 99 },
  overallPct: { fontFamily: 'Lexend_700Bold', fontSize: 15, color: '#FFB84C' },
  progressInfoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  progressInfoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  progressInfoLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  progressInfoValue: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: '#1a1a2e',
  },
  reportCard: {
    backgroundColor: '#EEF4FF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  reportTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: '#1a1a2e',
    marginBottom: 6,
  },
  reportText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 6,
  },
  reportTime: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
  },
})
