import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { theme } from '@/theme';
import { Text } from '@/components/modal/shared/Text';
import { Button } from '@/components/modal/shared/Button';
import BackButton from '@/components/modal/shared/BackButton';
import Avatar from '@/components/modal/shared/Avatar';
import ProgressBar from '@/components/modal/shared/progressBar';
import { useModal } from '@/components/modal/ModalProvider';
import Footer from '@/components/modal/shared/Footer';

const { colors, spacing, typography, radius } = theme;

/* ── Types ── */
interface Child {
    id: string;
    name: string;
    age: number;
    progress: number;
    imageUri?: string;
    }

/* ── Child Card ── */
function ChildCard({ child }: { child: Child }) {
    return (
        <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.replace('/(parent)/Home-parent')}
        >
        <Avatar imageUri={child.imageUri} name={child.name} size="md" />

        <View style={styles.cardInfo}>
            <Text style={styles.cardName}>
            {child.name}, {child.age} years
            </Text>
            <ProgressBar value={child.progress} height={6} showLabel={false} />
        </View>

        <Text style={styles.cardPercent}>{child.progress}%</Text>
        </TouchableOpacity>
    );
}

/* ── Add Slot ── */
function AddSlot({ onPress }: { onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.slot} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.slotCircle}>
            <Text style={styles.slotPlus}>+</Text>
        </View>

        <View style={styles.slotLines}>
            <View style={styles.slotLine} />
            <View style={[styles.slotLine, { width: '55%' }]} />
        </View>
        </TouchableOpacity>
    );
}

/* ── Screen ── */
export default function MyChildrenListScreen() {
    const { show } = useModal();

    const handleAdd = () => show('addChild');

    const children: Child[] = [
        {
        id: '1',
        name: 'Ahmad',
        age: 8,
        progress: 75,
        },
        {
        id: '2',
        name: 'Lina',
        age: 6,
        progress: 40,
        },
    ];

    return (
        <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />

        {/* Header */}
        <View style={styles.header}>
            <BackButton onPress={router.back} />
            <Text style={styles.headerTitle}>My children</Text>
            <View style={{ width: 36 }} />
        </View>

        <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
        >
            {/* Mascot */}
            <Image
            source={require('@/assets/images/mascot/rafeeq_like.png')}
            style={styles.mascot}
            resizeMode="contain"
            />

            <Text style={styles.listTitle}>Manage your children</Text>

            {/* List */}
            <View style={styles.list}>
            {children.map((child) => (
                <ChildCard key={child.id} child={child} />
            ))}

            <AddSlot onPress={handleAdd} />
            </View>

            {/* Button */}
            <Button
            label="Add more children"
            onPress={handleAdd}
            style={styles.btn}
        />

        {/* Footer */}
        <Footer
            onLanguagePress={() => {}}
            onPrivacyPress={() => {}}
            onTermsPress={() => {}}
            currentLanguage="English (US)"  />
        </ScrollView>
        </SafeAreaView>
    );
}

/* ── Styles ── */
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },

    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.textPrimary,
    },

    scroll: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        alignItems: 'center',
        gap: spacing.md,
    },

    mascot: {
        width: 100,
        height: 100,
    },

    listTitle: {
        fontSize: typography.fontSize['2xl'],
        fontFamily: typography.fontFamily.bold,
        color: colors.primary,
        textAlign: 'center',
    },

    list: {
        width: '100%',
        gap: spacing.md,
        marginTop: spacing.sm,
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: 1.5,
        borderColor: colors.border,
        padding: spacing.md,
        gap: spacing.md,
    },

    cardInfo: {
        flex: 1,
        gap: spacing.xs,
    },

    cardName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.textPrimary,
    },

    cardPercent: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.bold,
        color: colors.primary,
    },

    slot: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
        borderStyle: 'dashed',
        borderRadius: radius.xl,
        padding: spacing.md,
        gap: spacing.md,
    },

    slotCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1.5,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },

    slotPlus: {
        fontSize: 22,
        color: colors.primary,
    },

    slotLines: {
        flex: 1,
        gap: spacing.xs,
    },

    slotLine: {
        height: 10,
        backgroundColor: colors.backgroundLight,
        borderRadius: radius.full,
        width: '75%',
    },

    btn: {
        width: '100%',
        marginTop: spacing.sm,
    },

    footer: {
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.lg,
    },

    footerLinks: {
        flexDirection: 'row',
        gap: spacing.sm,
    },

    footerLink: {
        fontSize: typography.fontSize.xs,
        color: colors.textMuted,
    },

    footerDot: {
        fontSize: typography.fontSize.xs,
        color: colors.textMuted,
    },
});