import { Colors, Radius, Spacing } from "@/theme";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MOCK_TEACHERS = [
  { id: "1", name: "Ahmad Sami", status: "Active", childCount: 3, progress: 62 },
  { id: "2", name: "Tala Kamal", status: "Active", childCount: 3, progress: 62 },
];


function EmptyState({ t }: { t: any }) {
  return (
    <View style={styles.emptyContainer}>
      <Image
        source={require("@/assets/images/mascot/rafeeq_clabbing.png")}
        style={styles.emptyIllustration}
        resizeMode="contain"
      />
      <Image
        source={require("@/assets/images/mascot/rafeeq_clabbing.png")}
        style={styles.emptyPenguin}
        resizeMode="contain"
      />
      <Text style={styles.emptyTitle}>{t("teachers.emptyTitle")}</Text>
      <Text style={styles.emptySubtitle}>{t("teachers.emptySubtitle")}</Text>
      <View style={styles.ghostCard} />
      <View style={styles.ghostCard} />
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => router.push("/(school)/add-teacher")}
      >
        <Text style={styles.ctaButtonText}>{t("teachers.addFirst")}</Text>
      </TouchableOpacity>
    </View>
  );
}


function TeacherCard({ teacher, t }: { teacher: typeof MOCK_TEACHERS[0]; t: any }) {
  return (
    <TouchableOpacity
      style={styles.teacherCard}
      onPress={() => router.push(`/(school)/teacher/${teacher.id}`)}
      accessibilityRole="button"
      accessibilityLabel={teacher.name}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{teacher.name.charAt(0)}</Text>
      </View>

      <View style={styles.teacherInfo}>
        <View style={styles.teacherTopRow}>
          <Text style={styles.teacherName}>{teacher.name}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{t("teachers.active")}</Text>
          </View>
        </View>
        <Text style={styles.teacherMeta}>
          {teacher.childCount} {t("teachers.children")}
        </Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${teacher.progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{teacher.progress}%</Text>
      </View>
    </TouchableOpacity>
  );
}


function PopulatedList({ teachers, t }: { teachers: typeof MOCK_TEACHERS; t: any }) {
  return (
    <View style={styles.listContainer}>
      {teachers.map((teacher) => (
        <TeacherCard key={teacher.id} teacher={teacher} t={t} />
      ))}
      <TouchableOpacity
        style={styles.ghostCardAdd}
        onPress={() => router.push("/(school)/add-teacher")}
      >
        <Text style={styles.ghostCardPlus}>+</Text>
      </TouchableOpacity>
    </View>
  );
}


export default function TeachersScreen() {
  const { t } = useTranslation();
  const [teachers] = useState(MOCK_TEACHERS); // swap with [] to test empty state

  const isEmpty = teachers.length === 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("teachers.title")}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/(school)/add-teacher")}
          accessibilityRole="button"
          accessibilityLabel={t("teachers.addTeacher")}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {isEmpty ? (
          <EmptyState t={t} />
        ) : (
          <PopulatedList teachers={teachers} t={t} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Lexend-Bold",
    fontWeight: "700",
    color: Colors.textDark,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    fontSize: 24,
    color: Colors.white,
    fontWeight: "300",
    lineHeight: 28,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
  },
  emptyPenguin: {
    width: 80,
    height: 80,
    marginTop: -20,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Lexend-Bold",
    fontWeight: "700",
    color: Colors.textDark,
    textAlign: "center",
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: "Lexend-Regular",
    color: Colors.textMedium,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: Spacing.xl,
  },
  ghostCard: {
    width: "100%",
    height: 72,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: "dashed",
    backgroundColor: Colors.background,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    height: 52,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonText: {
    fontFamily: "Lexend-Bold",
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },

  // Populated list
  listContainer: {
    gap: Spacing.md,
  },
  teacherCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontFamily: "Lexend-Bold",
    fontWeight: "700",
    color: Colors.primary,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  teacherName: {
    fontSize: 15,
    fontFamily: "Lexend-Bold",
    fontWeight: "700",
    color: Colors.textDark,
  },
  statusBadge: {
    backgroundColor: "#E6F9F0",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Lexend-SemiBold",
    color: "#22C55E",
    fontWeight: "600",
  },
  teacherMeta: {
    fontSize: 12,
    fontFamily: "Lexend-Regular",
    color: Colors.textMedium,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 99,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 99,
  },
  progressText: {
    fontSize: 11,
    fontFamily: "Lexend-SemiBold",
    color: Colors.textMedium,
    textAlign: "right",
    marginTop: 4,
  },
  ghostCardAdd: {
    height: 72,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: "dashed",
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostCardPlus: {
    fontSize: 28,
    color: Colors.textLight,
    fontWeight: "300",
  },
});