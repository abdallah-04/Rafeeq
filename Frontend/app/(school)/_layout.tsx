import { Tabs } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

const { colors } = theme;

export default function SchoolLayout() {
  const { t } = useTranslation();

  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            height: 64,
          },
          tabBarLabelStyle: {
            fontFamily: 'Lexend-SemiBold',
            fontSize: 11,
          },
        }}
      >
        <Tabs.Screen
          name="teachers"
          options={{
            title: t('tabs.teachers'),
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? 'people' : 'people-outline'}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('tabs.profile'),
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? 'person-circle' : 'person-circle-outline'}
                size={24}
                color={color}
              />
            ),
          }}
        />

        {/* Non-tab screens — routable but no tab button and no tab bar */}
        <Tabs.Screen name="students" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="add-teacher" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="add-teacher-empty" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="add-student" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="teacher/[id]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="student/[id]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      </Tabs>
    </SafeAreaProvider>
  );
}
