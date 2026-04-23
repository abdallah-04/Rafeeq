// 
import React from 'react'
import {
    View,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native'
import { Text } from '@/components/RNText'
import { theme } from '@/theme'
import { useAppStore } from '@/store/Appstore'

type TabItem = {
    key: string
    label: string
}

interface TabBarProps {
    tabs: Array<string | TabItem>
    activeTab: string
    onTabChange: (tab: string) => void
}

export default function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
    const isRTL = useAppStore((state) => state.isRTL)
    const normalizedTabs = tabs.map((tab) =>
        typeof tab === 'string' ? { key: tab, label: tab } : tab
    )

    return (
        <View style={styles.wrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={[styles.container, isRTL && styles.containerRTL]}
            >
                {normalizedTabs.map((tab) => {
                    const isActive = tab.key === activeTab
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => onTabChange(tab.key)}
                            style={[styles.tab, isActive && styles.activeTab]}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: isActive }}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                                {tab.label}
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
    containerRTL: {
        flexDirection: 'row-reverse',
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
        textAlign: 'center',
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
