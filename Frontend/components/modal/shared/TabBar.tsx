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
    },
    container: {
        paddingHorizontal: theme.spacing.xl,
        gap: theme.spacing.lg,
        flexDirection: 'row',
    },
    tab: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: 4,
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
        marginTop: -1,
    },
})
