// 
import React from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native'
import { theme } from '@/theme'

interface TabBarProps {
    tabs: string[]
    activeTab: string
    onTabChange: (tab: string) => void
}

export default function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
    return (
        <View style={styles.wrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={styles.container}
            >
                {tabs.map((tab) => {
                    const isActive = tab === activeTab
                    return (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => onTabChange(tab)}
                            style={[styles.tab, isActive && styles.activeTab]}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: isActive }}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>
            <View style={styles.bottomBorder} />
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        marginTop: theme.spacing.sm,
        backgroundColor: theme.colors.white,
    },
    container: {
        paddingHorizontal: theme.spacing.xl,
        flexDirection: 'row',
        gap: theme.spacing.lg,
    },
    tab: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: 6,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: theme.colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontFamily: 'Lexend_500Medium',
        color: theme.colors.textMuted,
    },
    activeTabText: {
        color: theme.colors.primary,
        fontFamily: 'Lexend_600SemiBold',
    },
    bottomBorder: {
        height: 1,
        backgroundColor: theme.colors.border,
    },
})
