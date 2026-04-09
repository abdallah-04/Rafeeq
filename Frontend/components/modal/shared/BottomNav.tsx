import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { usePathname, router } from 'expo-router';
import { Text } from '@/components/modal/shared/Text';
import { theme } from '@/theme';

const { colors, spacing, typography } = theme;

const INACTIVE_COLOR = '#94A3B8';

const TABS = [
    { label: 'Home',    icon: require('@/assets/images/icons/home-page.png'), route: '/(parent)/Home-parent'    },
    { label: 'Explore', icon: require('@/assets/images/icons/compass.png'),   route: '/(parent)/explore'        },
    { label: 'Chatbot', icon: require('@/assets/images/icons/chat-ai.png'),   route: '/(parent)/chatbot'        },
    { label: 'Profile', icon: require('@/assets/images/icons/account.png'),   route: '/(parent)/profile'        },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <View style={styles.container}>
            {TABS.map((tab) => {
                const routePath = tab.route.replace(/\/\([^)]+\)/g, '');
                const isActive = pathname === routePath || pathname.startsWith(routePath + '/');
                return (
                    <TouchableOpacity
                        key={tab.route}
                        style={styles.tab}
                        onPress={() => router.push(tab.route as any)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                            <Image
                                source={tab.icon}
                                style={[styles.icon, { tintColor: isActive ? colors.primary : INACTIVE_COLOR }]}
                            />
                        </View>
                        <Text style={[styles.label, isActive && styles.labelActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: spacing.md,
        paddingTop: spacing.sm,
    },

    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },

    iconWrap: {
        width: 42,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },

    iconWrapActive: {
        backgroundColor: colors.primaryLighter,
    },

    icon: {
        width: 22,
        height: 22,
    },

    label: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: INACTIVE_COLOR,
    },

    labelActive: {
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary,
    },
});
