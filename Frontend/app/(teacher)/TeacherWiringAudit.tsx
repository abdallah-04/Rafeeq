import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity,
  ScrollView, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/modal/shared/Text'


const WIRES = [
  {
    id: 'w1',
    label: 'Wire 1 — Students list → Quick Access → Dashboard',
    checks: [
      { id: 'w1a', text: 'students.tsx: card onPress → /(teacher)/student-quick-access?studentId=1' },
      { id: 'w1b', text: 'index.tsx: card onPress → /(teacher)/student-quick-access?studentId=1' },
      { id: 'w1c', text: 'student-quick-access.tsx: Dashboard grid item → /(teacher)/Student_dashboard?studentId=1' },
      { id: 'w1d', text: 'TEACHER_STUDENTS_MAP lookup returns correct student on all 3 IDs' },
    ],
    route: '/(teacher)/student-quick-access',
    params: { studentId: '1' },
  },
  {
    id: 'w2',
    label: 'Wire 2 — Dashboard → Notes → Add Note → back',
    checks: [
      { id: 'w2a', text: 'Student_dashboard.tsx: Notes btn → /(teacher)/notes?studentId=1' },
      { id: 'w2b', text: 'notes.tsx: "+ Add" btn → /(teacher)/add-note?studentId=1' },
      { id: 'w2c', text: 'add-note.tsx: Add btn (valid) → router.back()' },
      { id: 'w2d', text: 'Notes tabs: Teacher\'s Feed / Parent Notes both render correct items' },
    ],
    route: '/(teacher)/notes',
    params: { studentId: '1' },
  },
  {
    id: 'w3',
    label: 'Wire 3 — Dashboard → H.W → Detail modal',
    checks: [
      { id: 'w3a', text: 'Student_dashboard.tsx: Add H.W btn → /(teacher)/homework?studentId=1' },
      { id: 'w3b', text: 'homework.tsx: "+ Add" toggles inline form' },
      { id: 'w3c', text: 'homework.tsx: Details btn on HW card shows detail (inline)' },
      { id: 'w3d', text: 'New HW added → appears at top of H.W History list' },
    ],
    route: '/(teacher)/homework',
    params: { studentId: '1' },
  },
  {
    id: 'w4',
    label: 'Wire 4 — Dashboard → Reports → Report Detail modal',
    checks: [
      { id: 'w4a', text: 'Student_dashboard.tsx: Add Reports btn → /(teacher)/reports?studentId=1' },
      { id: 'w4b', text: 'reports.tsx: "+ Add" toggles inline form' },
      { id: 'w4c', text: 'reports.tsx: download btn on report card fires correctly' },
      { id: 'w4d', text: 'New report added → appears at top of Uploaded Reports list' },
    ],
    route: '/(teacher)/reports',
    params: { studentId: '1' },
  },
  {
    id: 'w5',
    label: 'Wire 5 — Quick Access → Monthly Exam → Q flow → Score modal',
    checks: [
      { id: 'w5a', text: 'student-quick-access.tsx: Monthly Exam → /(teacher)/monthly-exam?studentId=1' },
      { id: 'w5b', text: 'monthly-exam.tsx: phase="info" shows exam info card' },
      { id: 'w5c', text: 'Start Exam btn → phase="quiz", Q1 renders visual carrots' },
      { id: 'w5d', text: 'Q1 answer selected → blue border highlight' },
      { id: 'w5e', text: 'Next Question → Q2 text question renders' },
      { id: 'w5f', text: 'Next Question → Q3 A/B/C/D + Finish button + penguin emoji' },
      { id: 'w5g', text: 'Finish → ScoreModal visible with score X/3' },
      { id: 'w5h', text: 'ScoreModal Okay → router.back()' },
      { id: 'w5i', text: 'Countdown timer counts 00:16 → 00:00 and stops' },
    ],
    route: '/(teacher)/monthly-exam',
    params: { studentId: '1' },
  },
  {
    id: 'w6',
    label: 'Wire 6 — Quick Access → Road Map',
    checks: [
      { id: 'w6a', text: 'student-quick-access.tsx: Road Map → /(teacher)/road-map?studentId=1' },
      { id: 'w6b', text: 'road-map.tsx: Days 1-3 show green checkmark nodes' },
      { id: 'w6c', text: 'Day 4 node (current) shows reading penguin 📖, blue ring' },
      { id: 'w6d', text: 'Days 5-6 show pending nodes (number visible)' },
      { id: 'w6e', text: 'Day 7 shows crown 👑 node' },
    ],
    route: '/(teacher)/road-map',
    params: { studentId: '1' },
  },
  {
    id: 'w7',
    label: 'Wire 7 — Day work modals fire at correct triggers',
    checks: [
      { id: 'w7a', text: 'Day 4 tap → "What to do today" modal (Let\'s go!)' },
      { id: 'w7b', text: 'Day 5 tap → "Day 5 Work / Task 7 & H.W 5" modal (Okay)' },
      { id: 'w7c', text: 'Day 6 tap → "Day 6 Work / Quiz 3 & H.W 5" modal (Okay)' },
      { id: 'w7d', text: 'Day 7 tap → "Day 7 Work / Exam 1" modal (Okay)' },
      { id: 'w7e', text: 'Days 1-3 tap → no modal fires (done state)' },
      { id: 'w7f', text: 'Today Quiz modal shows: 3 Questions / Quiz 2 / 10 mins / Start' },
      { id: 'w7g', text: 'Great Job modal shows task + date correctly' },
    ],
    route: '/(teacher)/road-map',
    params: { studentId: '1' },
  },
  {
    id: 'w8',
    label: 'Wire 8 — Mock data renders in EN and AR',
    checks: [
      { id: 'w8a', text: 'Switch to AR in profile.tsx → all screens flip to RTL' },
      { id: 'w8b', text: 'index.tsx: "Welcome, Mr. Ahmad" → "مرحباً، الأستاذ أحمد"' },
      { id: 'w8c', text: 'students.tsx: student names render, tags flip to right' },
      { id: 'w8d', text: 'notes.tsx: note text + author right-aligned in AR' },
      { id: 'w8e', text: 'homework.tsx: header, labels, placeholders all in AR' },
      { id: 'w8f', text: 'reports.tsx: header, labels, placeholders all in AR' },
      { id: 'w8g', text: 'monthly-exam.tsx: question text renders in AR' },
      { id: 'w8h', text: 'road-map.tsx: nav title "شجرة أيوب" in AR' },
      { id: 'w8i', text: 'Back buttons flip: ← becomes → in RTL' },
    ],
    route: '/(teacher)/(tabs)/profile',
    params: {},
  },
];

// ─── Main screen ───────────────────────────────────────────────
export default function TeacherWiringAudit() {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ w1: true });

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleWire = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalChecks = WIRES.flatMap((w) => w.checks).length;
  const doneChecks = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((doneChecks / totalChecks) * 100);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>M2 Wiring Audit</Text>
          <Text style={styles.headerSub}>Day 6–7 · Teacher Navigation</Text>
        </View>
        <View style={styles.pctBadge}>
          <Text style={styles.pctText}>{pct}%</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.progressLabel}>
        {doneChecks} / {totalChecks} checks passed
      </Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {WIRES.map((wire) => {
          const wireDone = wire.checks.every((c) => checked[c.id]);
          const isOpen = expanded[wire.id];

          return (
            <View key={wire.id} style={styles.wireBlock}>
              {/* Wire header */}
              <TouchableOpacity
                style={[styles.wireHeader, wireDone && styles.wireHeaderDone]}
                onPress={() => toggleWire(wire.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.wireDot}>{wireDone ? '✅' : '⬜'}</Text>
                <Text style={[styles.wireLabel, wireDone && styles.wireLabelDone]}>
                  {wire.label}
                </Text>
                <Text style={styles.wireChevron}>{isOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.wireBody}>
                  {/* Go to screen button */}
                  <TouchableOpacity
                    style={styles.goBtn}
                    onPress={() =>
                      router.push({ pathname: wire.route as any, params: wire.params })
                    }
                  >
                    <Text style={styles.goBtnText}>→ Open Screen</Text>
                  </TouchableOpacity>

                  {/* Checks */}
                  {wire.checks.map((check) => (
                    <TouchableOpacity
                      key={check.id}
                      style={styles.checkRow}
                      onPress={() => toggle(check.id)}
                      activeOpacity={0.75}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          checked[check.id] && styles.checkboxChecked,
                        ]}
                      >
                        {checked[check.id] && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.checkText,
                          checked[check.id] && styles.checkTextDone,
                        ]}
                      >
                        {check.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Done banner */}
        {pct === 100 && (
          <View style={styles.doneBanner}>
            <Text style={styles.doneBannerIcon}>🎉</Text>
            <Text style={styles.doneBannerText}>
              All M2 Day 6–7 wires verified!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  backIcon: { fontSize: 18, color: '#508DF7' },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: 'Lexend_700Bold', fontSize: 17, color: '#1a1a2e' },
  headerSub: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  pctBadge: {
    backgroundColor: '#508DF7', borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  pctText: { fontFamily: 'Lexend_700Bold', fontSize: 13, color: '#fff' },

  progressTrack: {
    marginHorizontal: 20, height: 6, backgroundColor: '#E8EEFF',
    borderRadius: 99, overflow: 'hidden', marginBottom: 4,
  },
  progressFill: {
    height: '100%', backgroundColor: '#508DF7', borderRadius: 99,
  },
  progressLabel: {
    fontFamily: 'Lexend_400Regular', fontSize: 11,
    color: '#9CA3AF', textAlign: 'right',
    paddingHorizontal: 20, marginBottom: 12,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  wireBlock: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  wireHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
    backgroundColor: '#fff',
  },
  wireHeaderDone: { backgroundColor: '#F0FDF4' },
  wireDot: { fontSize: 18 },
  wireLabel: {
    flex: 1,
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: '#1a1a2e',
    lineHeight: 18,
  },
  wireLabelDone: { color: '#16A34A' },
  wireChevron: { fontSize: 12, color: '#9CA3AF' },

  wireBody: { paddingHorizontal: 14, paddingBottom: 14 },

  goBtn: {
    backgroundColor: '#EEF4FF', borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 14,
    alignSelf: 'flex-start', marginBottom: 12,
  },
  goBtnText: { fontFamily: 'Lexend_600SemiBold', fontSize: 12, color: '#508DF7' },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F5F5F5',
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: '#D1D9EF',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1, flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: '#508DF7', borderColor: '#508DF7' },
  checkmark: { fontSize: 13, color: '#fff', fontWeight: '700' },
  checkText: {
    flex: 1,
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
  },
  checkTextDone: { color: '#9CA3AF', textDecorationLine: 'line-through' },

  doneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    gap: 10,
    marginTop: 8,
  },
  doneBannerIcon: { fontSize: 32 },
  doneBannerText: { fontFamily: 'Lexend_700Bold', fontSize: 16, color: '#16A34A' },
});