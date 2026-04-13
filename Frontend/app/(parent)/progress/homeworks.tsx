// 


import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { theme } from '@/theme'

import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import ProgressCard from '@/components/modal/parent/ProgressCard'
import TabBar from '@/components/modal/shared/TabBar'
import { Text } from '@/components/modal/shared/Text'
import QuizCard from '@/components/modal/parent/quizcard'

const TABS = ['Quizes', 'Activities', 'Homeworks']

export default function HomeworksMain() {
  const [activeTab, setActiveTab] = useState('Homeworks')
  const [filter, setFilter] = useState<'todo' | 'done'>('todo')

  return (
    <ScreenWrapper scroll={false}>
      <Header title="Homeworks" onBack={() => router.back()} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress Section */}
        <ProgressCard
          childName="Zaid"
          monthLabel="today"
          description="2 of 5 tasks completed today"
          percentage={40}
          mascotImage={require('@/assets/images/mascot/rafeeq_reading.png')}
        />

        {/* Category Tabs */}
        <View style={{ marginTop: theme.spacing.lg }}>
          <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        </View>

        {/* To Do / Done Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, filter === 'todo' && styles.activeToggle]} 
            onPress={() => setFilter('todo')}
          >
            <Text style={[styles.toggleText, filter === 'todo' && styles.activeText]}>To do</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, filter === 'done' && styles.activeToggle]} 
            onPress={() => setFilter('done')}
          >
            <Text style={[styles.toggleText, filter === 'done' && styles.activeText]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Homework Lists */}
        <View style={styles.listSection}>
          <Text variant="heading" style={styles.sectionTitle}>For today</Text>
          <QuizCard
            title="Counting 1 to 10"
            questionsCount={5}
            durationMinutes={10}
            status={filter === 'todo' ? 'start' : 'repeat'}
            icon={require('@/assets/images/icons/math.png')}
            iconBgColor="#D1FAE5"
            iconTintColor="#059669"
            onPress={() => router.push('/(parent)/progress/HomeworkDetail')}
          />

          {filter === 'todo' && (
            <>
              <Text variant="heading" style={styles.sectionTitle}>Didn't finished since last week</Text>
              <QuizCard
                title="Counting 1 to 10"
                questionsCount={5}
                durationMinutes={10}
                status="start"
                icon={require('@/assets/images/icons/math.png')}
                iconBgColor="#D1FAE5"
                onPress={() => {}}
              />
            </>
          )}
        </View>
      </ScrollView>

    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: theme.radius.lg,
    padding: 4,
    marginTop: theme.spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.radius.md,
  },
  activeToggle: {
    backgroundColor: theme.colors.primary,
  },
  toggleText: {
    fontFamily: 'Lexend_600SemiBold',
    color: theme.colors.textSecondary,
  },
  activeText: {
    color: theme.colors.white,
  },
  listSection: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 14,
    marginVertical: theme.spacing.md,
    color: theme.colors.textPrimary,
  }
})