// import React, { useState } from 'react'
// import {
//     View,
//     Text,
//     TouchableOpacity,
//     ScrollView,
//     SafeAreaView,
//     StatusBar,
//     StyleSheet,
// } from 'react-native'
// import { router } from 'expo-router'
// import { theme } from '@/theme'

// import ChildSelector from '@/components/modal/parent/ChildSelector'
// import TabBar from '@/components/modal/shared/TabBar'
// import QuizCard from '@/components/modal/parent/quizcard'
// import BottomNav from '@/components/modal/shared/BottomNav'
// import { BadgeVariant } from '@/components/modal/parent/StatusBadge'

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface Quiz {
//     id: string
//     title: string
//     icon: any
//     iconBgColor: string
//     iconTintColor?: string
//     questionsCount: number
//     durationMinutes: number
//     status: BadgeVariant
// }

// // ─── Mock Data ────────────────────────────────────────────────────────────────

// const MOCK_CHILD = {
//     name: 'Zaid',
//     age: 6,
//     avatar: require('@/assets/images/boy.png'),
//     badges: [
//         { label: 'Level 2', color: '#A78BFA' },
//         { label: 'Age 8',   color: '#60A5FA' },
//         { label: 'level2',  color: '#A78BFA' },
//     ],
// }

// const MOCK_QUIZES: Quiz[] = [
//     {
//         id: '1',
//         title: "Color's quiz",
//         icon: require('@/assets/images/icons/color.png'),
//         iconBgColor: '#BBF7D0',
//         iconTintColor: '#00C688',
//         questionsCount: 10,
//         durationMinutes: 5,
//         status: 'completed',
//     },
//     {
//         id: '2',
//         title: 'Numbers (1- 10)',
//         icon: require('@/assets/images/icons/math.png'),
//         iconBgColor: '#FDE68A',
//         iconTintColor: '#D97706',
//         questionsCount: 10,
//         durationMinutes: 5,
//         status: 'in_progress',
//     },
//     {
//         id: '3',
//         title: 'Animals sounds',
//         icon: require('@/assets/images/icons/animal.png'),
//         iconBgColor: '#DDD6FE',
//         iconTintColor: '#7C3AED',
//         questionsCount: 10,
//         durationMinutes: 5,
//         status: 'new',
//     },
//     {
//         id: '4',
//         title: 'Shapes & Colors',
//         icon: require('@/assets/images/icons/shapes.png'),
//         iconBgColor: '#BFDBFE',
//         iconTintColor: '#2563EB',
//         questionsCount: 8,
//         durationMinutes: 4,
//         status: 'new',
//     },
// ]

// const TABS = ['Progress', 'Quizes', 'Activities']

// // ─── Component ────────────────────────────────────────────────────────────────

// export default function QuizesScreen() {
//     const [activeTab, setActiveTab] = useState('Quizes')

//     const handleTabChange = (tab: string) => {
//         if (tab === 'Progress') {
//             router.replace('/(parent)/progress/progress-page')
//             return
//         }
//         if (tab === 'Activities') {
//             router.replace('/(parent)/progress/activities')
//             return
//         }
//         setActiveTab(tab)
//     }

//     return (
//         <SafeAreaView style={styles.safe}>
//             <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />

//             {/* ── Header ── */}
//             <View style={styles.header}>
//                 <TouchableOpacity
//                     onPress={() => router.back()}
//                     style={styles.backBtn}
//                     accessibilityRole="button"
//                     accessibilityLabel="Go back"
//                 >
//                     <Text style={styles.backIcon}>←</Text>
//                 </TouchableOpacity>

//                 <Text style={styles.headerTitle}>Quizes</Text>

//                 <TouchableOpacity
//                     onPress={() => router.push('/(parent)/settings')}
//                     style={styles.settingsBtn}
//                     accessibilityRole="button"
//                     accessibilityLabel="Settings"
//                 >
//                     <Text style={styles.settingsIcon}>⚙️</Text>
//                 </TouchableOpacity>
//             </View>

//             {/* ── Child Selector ── */}
//             <ChildSelector
//                 name={MOCK_CHILD.name}
//                 age={MOCK_CHILD.age}
//                 avatar={MOCK_CHILD.avatar}
//                 badges={MOCK_CHILD.badges}
//                 onPress={() => {
//                     // TODO: open child switcher modal
//                 }}
//             />

//             {/* ── Tab Bar ── */}
//             <TabBar
//                 tabs={TABS}
//                 activeTab={activeTab}
//                 onTabChange={handleTabChange}
//             />

//             {/* ── Content ── */}
//             <ScrollView
//                 style={styles.scroll}
//                 contentContainerStyle={styles.scrollContent}
//                 showsVerticalScrollIndicator={false}
//             >
//                 {/* Section Header */}
//                 <View style={styles.sectionHeader}>
//                     <Text style={styles.sectionTitle}>✏️ This week's quizes</Text>
//                     <TouchableOpacity
//                         onPress={() => router.push('/(parent)/quizes-all' as any)}
//                         accessibilityRole="link"
//                     >
//                         <Text style={styles.seeAll}>See all</Text>
//                     </TouchableOpacity>
//                 </View>

//                 {/* Quiz Cards */}
//                 {MOCK_QUIZES.map((quiz) => (
//                     <QuizCard
//                         key={quiz.id}
//                         icon={quiz.icon}
//                         iconBgColor={quiz.iconBgColor}
//                         iconTintColor={quiz.iconTintColor}
//                         title={quiz.title}
//                         questionsCount={quiz.questionsCount}
//                         durationMinutes={quiz.durationMinutes}
//                         status={quiz.status}
//                         onPress={() => router.push(`/(parent)/progress/quiz/${quiz.id}` as any)}
//                     />
//                 ))}
//             </ScrollView>

//             {/* ── Bottom Navigation ── */}
//             <BottomNav />
//         </SafeAreaView>
//     )
// }

// // ─── Styles ───────────────────────────────────────────────────────────────────

// const styles = StyleSheet.create({
//     safe: {
//         flex: 1,
//         backgroundColor: theme.colors.background,
//     },

//     // Header
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: theme.spacing.xl,
//         paddingVertical: theme.spacing.md,
//         backgroundColor: theme.colors.white,
//         borderBottomWidth: 1,
//         borderBottomColor: theme.colors.border,
//     },
//     backBtn: {
//         width: 40,
//         height: 40,
//         justifyContent: 'center',
//     },
//     backIcon: {
//         fontSize: 22,
//         color: theme.colors.textPrimary,
//     },
//     headerTitle: {
//         fontSize: 18,
//         fontFamily: 'Lexend_700Bold',
//         fontWeight: '700',
//         color: theme.colors.textPrimary,
//     },
//     settingsBtn: {
//         width: 40,
//         height: 40,
//         justifyContent: 'center',
//         alignItems: 'flex-end',
//     },
//     settingsIcon: {
//         fontSize: 20,
//     },

//     // Scroll
//     scroll: {
//         flex: 1,
//     },
//     scrollContent: {
//         paddingHorizontal: theme.spacing.xl,
//         paddingTop: theme.spacing.lg,
//         paddingBottom: theme.spacing.xl,
//     },

//     // Section Header
//     sectionHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: theme.spacing.md,
//     },
//     sectionTitle: {
//         fontSize: 16,
//         fontFamily: 'Lexend_700Bold',
//         fontWeight: '700',
//         color: theme.colors.textPrimary,
//     },
//     seeAll: {
//         fontSize: 13,
//         fontFamily: 'Lexend_400Regular',
//         color: theme.colors.primary,
//     },
// })

import React, { useState } from 'react'
import {
            View,
            TouchableOpacity,
            ScrollView,
            SafeAreaView,
            StatusBar,
            StyleSheet,
        } from 'react-native'
import { router } from 'expo-router'
import { theme } from '@/theme'

import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import ChildSelector from '@/components/modal/parent/ChildSelector'
import TabBar from '@/components/modal/shared/TabBar'
import QuizCard from '@/components/modal/parent/quizcard'
import { Text } from '@/components/modal/shared/Text'

// ─── Types & Mock Data ────────────────────────────────────────────────────────
interface Quiz {
    id: string
    title: string
    icon: any
    iconBgColor: string
    iconTintColor?: string
    questionsCount: number
    durationMinutes: number
    status: 'completed' | 'in_progress' | 'new'
}

const MOCK_CHILD = {
    name: 'Zaid',
    age: 6,
    avatar: require('@/assets/images/boy.png'),
    badges: [
        { label: 'Level 2', color: '#A78BFA' },
        { label: 'Age 8',   color: '#60A5FA' },
        { label: 'level2',  color: '#A78BFA' },
    ],
}

const MOCK_QUIZZES: Quiz[] = [
    {
        id: '1',
        title: "Color's quiz",
        icon: require('@/assets/images/icons/color.png'),
        iconBgColor: '#BBF7D0',
        iconTintColor: '#00C688',
        questionsCount: 10,
        durationMinutes: 5,
        status: 'completed',
    },
    {
        id: '2',
        title: 'Numbers (1-10)',
        icon: require('@/assets/images/icons/math.png'),
        iconBgColor: '#FDE68A',
        iconTintColor: '#D97706',
        questionsCount: 10,
        durationMinutes: 5,
        status: 'in_progress',
    },
    {
        id: '3',
        title: 'Animals sounds',
        icon: require('@/assets/images/icons/animal.png'),
        iconBgColor: '#DDD6FE',
        iconTintColor: '#7C3AED',
        questionsCount: 10,
        durationMinutes: 5,
        status: 'new',
    },
]

const TABS = ['Progress', 'Quizes', 'Activities', 'Homeworks']

export default function QuizzesScreen() {
    const [activeTab, setActiveTab] = useState('Quizes')

    const handleTabChange = (tab: string) => {
        if (tab === 'Progress') {
        router.replace('/(parent)/progress/progress-page')
        return
        }
        if (tab === 'Activities') {
        router.replace('/(parent)/progress/activities')
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
            title="Quizes"
            onBack={() => router.back()}
            rightElement={<HeaderRightButton onPress={() => router.push('/(parent)/settings')} />}
        />

        <ChildSelector
            name={MOCK_CHILD.name}
            age={MOCK_CHILD.age}
            avatar={MOCK_CHILD.avatar}
            badges={MOCK_CHILD.badges}
            onPress={() => {}}
        />

        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <View style={styles.sectionHeader}>
            <Text variant="heading" style={styles.sectionTitle}>✏️ This week's quizzes</Text>
            <TouchableOpacity onPress={() => router.push('/(parent)/quizes-all')}>
                <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
            </View>

            {MOCK_QUIZZES.map((quiz) => (
            <QuizCard
                key={quiz.id}
                {...quiz}
                onPress={() => router.push(`/(parent)/progress/quiz/${quiz.id}`)}
            />
            ))}
        </ScrollView>

        </ScreenWrapper>
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
    settingsBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    settingsIcon: { fontSize: 20 },
})