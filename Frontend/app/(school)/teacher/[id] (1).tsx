import { Colors, Radius, Spacing } from "@/theme";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Mock Data ────────────────────────────────────────────────
const MOCK_TEACHERS: Record<string, {
  id: string;
  name: string;
  nameAr: string;
  status: string;
  childCount: number;
  progress: number;
  grade: string;
  section: string;
  phone: string;
  nationalId: string;
  joinDate: string;
}> = {
  "1": {
    id: "1",
    name: "Ahmad Sami",
    nameAr: "أحمد سامي",
    status: "Active",
    childCount: 3,
    progress: 62,
    grade: "Grade 2",
    section: "Section A",
    phone: "+962 7X XXX XXXX",
    nationalId: "98XXXXXXXX",
    joinDate: "Sep 2024",
  },
  "2": {
    id: "2",
    name: "Tala Kamal",
    nameAr: "تالا كمال",
    status: "Active",
    childCount: 3,
    progress: 62,
    grade: "Grade 3",
    section: "Section B",
    phone: "+962 7X XXX XXXX",
    nationalId: "97XXXXXXXX",
    joinDate: "Oct 2024",
  },
};

const MOCK_STUDENTS = [
  { id: "1", name: "Ayoub Maher", level: 3, difficulty: "ADD",  progress: 62, status: "Active" },
  { id: "2", name: "Mona Ramzi",  level: 5, difficulty: "ADHD", progress: 62, status: "Active" },
  { id: "3", name: "Nagham Marq", level: 1, difficulty: "IFD",  progress: 48, status: "Active" },
];

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  ADD:  { bg: "#EFF6FF", text: "#3B82F6" },
  ADHD: { bg: "#FDF4FF", text: "#A855F7" },
  IFD:  { bg: "#FFF7ED", text: "#F97316" },
};

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View style={[statStyles.card, { borderTopColor: color }]}>
      <Text style={statStyles.icon}>{icon}</Text>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: "center",
    gap: 4,
    borderTopWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: { fontSize: 20 },
  value: {
    fontFamily: "Lexend-Bold",
    fontSize: 18,
    fontWeight: "700",
  },
  label: {
    fontFamily: "Lexend-Regular",
    fontSize: 10,
    color: Colors.textMedium,
    textAlign: "center",
  },
});

// ─── Student Row ──────────────────────────────────────────────
function StudentRow({ student }: { student: typeof MOCK_STUDENTS[0] }) {
  const diffColor = DIFFICULTY_COLORS[student.difficulty] ?? {
    bg: "#F3F4F6",
    text: "#6B7280",
  };

  return (
    <TouchableOpacity
      style={rowStyles.row}
      onPress={() => router.push(`/(school)/student/${student.id}` as any)}
      accessibilityRole="button"
      accessibilityLabel={student.name}
    >
      {/* Avatar */}
      <View style={rowStyles.avatar}>
        <Text style={rowStyles.avatarText}>{student.name.charAt(0)}</Text>
      </View>

      {/* Info */}
      <View style={rowStyles.info}>
        <View style={rowStyles.topRow}>
          <Text style={rowStyles.name}>{student.name}</Text>
          <View style={rowStyles.activeBadge}>
            <Text style={rowStyles.activeText}>{student.status}</Text>
          </View>
        </View>
        <View style={rowStyles.tagsRow}>
          <View style={rowStyles.levelBadge}>
            <Text style={rowStyles.levelText}>Level {student.level}</Text>
          </View>
          <View style={[rowStyles.diffBadge, { backgroundColor: diffColor.bg }]}>
            <Text style={[rowStyles.diffText, { color: diffColor.text }]}>
              {student.difficulty}
            </Text>
          </View>
        </View>
        <View style={rowStyles.progressBg}>
          <View
            style={[rowStyles.progressFill, { width: `${student.progress}%` }]}
          />
        </View>
        <Text style={rowStyles.progressText}>{student.progress}%</Text>
      </View>
    </TouchableOpacity>
  );
}

const rowStyles = StyleSheet.create({
  row: {
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
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontFamily: "Lexend-Bold",
    fontWeight: "700",
    color: Colors.primary,
  },
  info: { flex: 1 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  name: {
    fontSize: 14,
    fontFamily: "Lexend-Bold",
    fontWeight: "700",
    color: Colors.textDark,
  },
  activeBadge: {
    backgroundColor: "#E6F9F0",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  activeText: {
    fontSize: 11,
    fontFamily: "Lexend-SemiBold",
    color: "#22C55E",
    fontWeight: "600",
  },
  tagsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: 7,
  },
  levelBadge: {
    backgroundColor: "#EFF6FF",
    borderRadius: 99,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  levelText: {
    fontSize: 11,
    fontFamily: "Lexend-SemiBold",
    color: "#3B82F6",
    fontWeight: "600",
  },
  diffBadge: {
    borderRadius: 99,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  diffText: {
    fontSize: 11,
    fontFamily: "Lexend-SemiBold",
    fontWeight: "600",
  },
  progressBg: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 99,
  },
  progressText: {
    fontSize: 11,
    fontFamily: "Lexend-SemiBold",
    color: Colors.textMedium,
    textAlign: "right",
    marginTop: 3,
  },
});

// ─── Main Screen ──────────────────────────────────────────────
export default function TeacherDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teacher = MOCK_TEACHERS[id ?? "1"] ?? MOCK_TEACHERS["1"];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{teacher.name}</Text>
        {/* Edit button */}
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile card ── */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{teacher.name.charAt(0)}</Text>
          </View>
          <Text style={styles.teacherName}>{teacher.name}</Text>
          <Text style={styles.teacherNameAr}>{teacher.nameAr}</Text>

          {/* Status badge */}
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{teacher.status}</Text>
          </View>

          {/* Grade + Section */}
          <View style={styles.classRow}>
            <View style={styles.classBadge}>
              <Text style={styles.classBadgeText}>🏫 {teacher.grade}</Text>
            </View>
            <View style={styles.classBadge}>
              <Text style={styles.classBadgeText}>📋 {teacher.section}</Text>
            </View>
          </View>
        </View>

        {/* ── Stat cards ── */}
        <View style={styles.statsRow}>
          <StatCard
            icon="👨‍🎓"
            value={String(teacher.childCount)}
            label="Students"
            color={Colors.primary}
          />
          <StatCard
            icon="📈"
            value={`${teacher.progress}%`}
            label="Avg Progress"
            color="#22C55E"
          />
          <StatCard
            icon="📅"
            value={teacher.joinDate}
            label="Joined"
            color="#FFB84C"
          />
        </View>

        {/* ── Info rows ── */}
        <View style={styles.infoCard}>
          {[
            { icon: "📞", label: "Phone",       value: teacher.phone },
            { icon: "🪪", label: "National ID", value: teacher.nationalId },
            { icon: "🏫", label: "Grade",       value: teacher.grade },
            { icon: "📋", label: "Section",     value: teacher.section },
          ].map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <Text style={styles.infoIcon}>{item.icon}</Text>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* ── Students section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t("teacherDetail.students", "Students")}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(school)/add-student")}
            style={styles.addStudentBtn}
          >
            <Text style={styles.addStudentText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {MOCK_STUDENTS.map((student) => (
          <StudentRow key={student.id} student={student} />
        ))}

        {/* ── Danger zone ── */}
        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>
            {t("teacherDetail.dangerZone", "Account Actions")}
          </Text>
          <TouchableOpacity style={styles.deactivateBtn}>
            <Text style={styles.deactivateText}>
              {t("teacherDetail.deactivate", "Deactivate Teacher")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeBtn}>
            <Text style={styles.removeText}>
              {t("teacherDetail.remove", "Remove Teacher")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backIcon: {
    fontSize: 22,
    color: Colors.textDark,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Lexend-Bold",
    fontWeight: "700",
    color: Colors.textDark,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  editIcon: {
    fontSize: 16,
  },

  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },

  // Profile card
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    gap: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
    borderWidth: 3,
    borderColor: Colors.primary + "33",
  },
  avatarText: {
    fontSize: 30,
    fontFamily: "Lexend-Bold",
    fontWeight: "700",
    color: Colors.primary,
  },
  teacherName: {
    fontSize: 20,
    fontFamily: "Lexend-Bold",
    fontWeight: "700",
    color: Colors.textDark,
  },
  teacherNameAr: {
    fontSize: 15,
    fontFamily: "Lexend-Regular",
    color: Colors.textMedium,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E6F9F0",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 99,
    marginTop: Spacing.sm,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#22C55E",
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Lexend-SemiBold",
    color: "#22C55E",
    fontWeight: "600",
  },
  classRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  classBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  classBadgeText: {
    fontSize: 12,
    fontFamily: "Lexend-SemiBold",
    color: Colors.textDark,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },

  // Info card
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  infoIcon: {
    fontSize: 16,
    width: 24,
  },
  infoLabel: {
    fontFamily: "Lexend-Regular",
    fontSize: 13,
    color: Colors.textMedium,
    flex: 1,
  },
  infoValue: {
    fontFamily: "Lexend-SemiBold",
    fontSize: 13,
    color: Colors.textDark,
    fontWeight: "600",
  },

  // Students section
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Lexend-Bold",
    fontWeight: "700",
    color: Colors.textDark,
  },
  addStudentBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
  },
  addStudentText: {
    fontFamily: "Lexend-SemiBold",
    fontSize: 13,
    color: Colors.white,
    fontWeight: "600",
  },

  // Danger zone
  dangerCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    marginTop: Spacing.sm,
  },
  dangerTitle: {
    fontFamily: "Lexend-Bold",
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: Spacing.sm,
  },
  deactivateBtn: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },
  deactivateText: {
    fontFamily: "Lexend-SemiBold",
    fontSize: 14,
    color: "#F97316",
    fontWeight: "600",
  },
  removeBtn: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    fontFamily: "Lexend-Bold",
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "700",
  },
});
