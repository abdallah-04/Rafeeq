import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';

const MENU_ITEMS = [
  { id: 'account',   icon: '👤', labelKey: 'teacher.profile.account',    label: 'Account Info' },
  { id: 'class',     icon: '🏫', labelKey: 'teacher.profile.class',      label: 'Class Settings' },
  { id: 'notifs',    icon: '🔔', labelKey: 'teacher.profile.notifs',     label: 'Notifications' },
  { id: 'language',  icon: '🌐', labelKey: 'teacher.profile.language',   label: 'Language' },
  { id: 'privacy',   icon: '🔒', labelKey: 'teacher.profile.privacy',    label: 'Privacy Policy' },
  { id: 'logout',    icon: '🚪', labelKey: 'teacher.profile.logout',     label: 'Log Out', danger: true },
];

export default function TeacherProfileScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const logout = useAuthStore((s) => s.logout);
  const setLanguage = useAuthStore((s) => s.setLanguage);

  const handleMenuPress = (id: string) => {
    if (id === 'logout') {
      logout();
      router.replace('/(auth)/login' as any);
    }
  };

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Avatar + name */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MA</Text>
          </View>
          <Text style={styles.name}>{t('teacher.profile.name', 'Mr. Ahmad')}</Text>
          <Text style={styles.role}>{t('teacher.profile.role', 'Special Education Teacher')}</Text>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>{t('teacher.profile.students', 'Students')}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>62%</Text>
              <Text style={styles.statLabel}>{t('teacher.profile.avgProgress', 'Avg Progress')}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Grade 2</Text>
              <Text style={styles.statLabel}>{t('teacher.profile.grade', 'Grade')}</Text>
            </View>
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                isRTL && styles.rowReverse,
                i < MENU_ITEMS.length - 1 && styles.menuItemBorder,
              ]}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item.id)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                {t(item.labelKey, item.label)}
              </Text>
              <Text style={[styles.menuArrow, isRTL && styles.menuArrowRTL]}>
                {isRTL ? '‹' : '›'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Language toggle */}
        <View style={styles.langRow}>
          {(['en', 'ar'] as const).map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[styles.langBtn, i18n.language === lang && styles.langBtnActive]}
              onPress={() => handleLanguageChange(lang)}
            >
              <Text style={[styles.langBtnText, i18n.language === lang && styles.langBtnTextActive]}>
                {lang === 'en' ? 'English' : 'العربية'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  scrollContent: { paddingBottom: 40 },
  rowReverse: { flexDirection: 'row-reverse' },

  profileHeader: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#BBDEFB', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 4, borderColor: '#fff', shadowColor: '#508DF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  avatarText: { fontFamily: 'Lexend_700Bold', fontSize: 28, color: '#1a1a2e' },
  name: { fontFamily: 'Lexend_700Bold', fontSize: 22, color: '#1a1a2e', marginBottom: 4 },
  role: { fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#6B7280', marginBottom: 16 },
  statRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20, gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontFamily: 'Lexend_700Bold', fontSize: 16, color: '#508DF7' },
  statLabel: { fontFamily: 'Lexend_400Regular', fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  divider: { width: 1, height: 32, backgroundColor: '#E8EEFF' },

  menuCard: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 16, gap: 14 },
  menuItemBorder: { borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0' },
  menuIcon: { fontSize: 20, width: 28 },
  menuLabel: { flex: 1, fontFamily: 'Lexend_500Medium', fontSize: 15, color: '#1a1a2e' },
  menuLabelDanger: { color: '#EF4444' },
  menuArrow: { fontSize: 20, color: '#C4C4C4' },
  menuArrowRTL: { transform: [{ scaleX: -1 }] },

  langRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, gap: 10 },
  langBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1.5, borderColor: '#E8EEFF' },
  langBtnActive: { backgroundColor: '#508DF7', borderColor: '#508DF7' },
  langBtnText: { fontFamily: 'Lexend_600SemiBold', fontSize: 14, color: '#9CA3AF' },
  langBtnTextActive: { color: '#fff' },
});
