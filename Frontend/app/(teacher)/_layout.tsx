import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';

// Simple icon components (replace with @expo/vector-icons if preferred)
function HomeIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 22, color }}>🏠</Text>;
}
function ProfileIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 22, color }}>👤</Text>;
}
function StudentsIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 22, color }}>🎓</Text>;
}

export default function TeacherLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#508DF7',
        tabBarInactiveTintColor: '#9eaac5',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('teacher.nav.home', 'Home'),
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('teacher.nav.profile', 'Profile'),
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: t('teacher.nav.students', 'Students'),
          tabBarIcon: ({ color }) => <StudentsIcon color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(80,141,247,0.12)',
    height: 72,
    paddingBottom: 10,
    paddingTop: 8,
    shadowColor: '#508DF7',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  tabLabel: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});