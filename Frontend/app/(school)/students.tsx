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


type Difficulty = "ADD" | "ADHD" | "IFD";
type Status = "Active" | "Inactive";

interface Student {
  id: string;
  name: string;
  level: number;
  difficulty: Difficulty;
  status: Status;
  progress: number;
}


const MOCK_STUDENTS: Student[] = [
  { id: "1", name: "Ayoub Maher", level: 3, difficulty: "ADD",  status: "Active", progress: 62 },
  { id: "2", name: "Mona Ramzi",  level: 5, difficulty: "ADHD", status: "Active", progress: 62 },
  { id: "3", name: "Nagham Marq", level: 1, difficulty: "IFD",  status: "Active", progress: 62 },
];


const DIFFICULTY_COLORS: Record<Difficulty, { bg: string; text: string }> = {
  ADD:  { bg: "#EFF6FF", text: "#3B82F6" },
  ADHD: { bg: "#FDF4FF", text: "#A855F7" },
  IFD:  { bg: "#FFF7ED", text: "#F97316" },
};


function EmptyState({ t }: { t: any }) {
  return (
    <View style={styles.emptyContainer}>
      <Image
        source={require("@/assets/images/mascot/rafeeq_clabbing.png")}
        style={styles.emptyPenguin}
        resizeMode="contain"
      />
      <Text style={styles.emptyTitle}>{t("students.emptyTitle")}</Text>
      <Text style={styles.emptySubtitle}>{t("students.emptySubtitle")}</Text>
      <View style={styles.ghostCard} />
      <View style={styles.ghostCard} />
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => router.push("/(school)/add-student")}
      >
        <Text style={styles.ctaButtonText}>{t("students.addFirst")}</Text>
      </TouchableOpacity>
    </View>
  );
}


function StudentCard({ student, t }: { student: Student; t: any }) {
  const diffColor = DIFFICULTY_COLORS[student.difficulty];

  return (
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() => router.push(`/(school)/student/${student.id}`)}
      accessibilityRole="button"
      accessibilityLabel={student.name}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
      </View>

      <View style={styles.studentInfo}>

        <View style={styles.topRow}>
          <Text style={styles.studentName}>{student.name}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{t("students.active")}</Text>
          </View>
        </View>

        <View style={styles.tagsRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>
              {t("students.level")} {student.level}
            </Text>
          </View>
          <View style={[styles.diffBadge, { backgroundColor: diffColor.bg }]}>
            <Text style={[styles.diffText, { color: diffColor.text }]}>
              {student.difficulty}
            </Text>
          </View>
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${student.progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{student.progress}%</Text>

      </View>
    </TouchableOpacity>
  );
}


function PopulatedList({ students, t }: { students: Student[]; t: any }) {
  return (
    <View style={styles.listContainer}>
      {students.map((student) => (
        <StudentCard key={student.id} student={student} t={t} />
      ))}
      <TouchableOpacity
        style={styles.ghostCardAdd}
        onPress={() => router.push("/(school)/add-student")}
      >
        <Text style={styles.ghostCardPlus}>+</Text>
      </TouchableOpacity>
    </View>
  );
}


export default function StudentsScreen() {
  const { t } = useTranslation();
  const [students] = useState(MOCK_STUDENTS); 

  const isEmpty = students.length === 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("students.title")}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/(school)/add-student")}
          accessibilityRole="button"
          accessibilityLabel={t("students.addStudent")}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {isEmpty ? (
          <EmptyState t={t} />
        ) : (
          <PopulatedList students={students} t={t} />
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
  emptyPenguin: {
    width: 120,
    height: 120,
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
    height: 88,
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
  studentCard: {
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
  studentInfo: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  studentName: {
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
  tagsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: "#EFF6FF",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  levelText: {
    fontSize: 11,
    fontFamily: "Lexend-SemiBold",
    color: "#3B82F6",
    fontWeight: "600",
  },
  diffBadge: {
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  diffText: {
    fontSize: 11,
    fontFamily: "Lexend-SemiBold",
    fontWeight: "600",
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
    height: 88,
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