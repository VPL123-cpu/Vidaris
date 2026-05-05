import { useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../src/lib/supabase";
import { useStudyStore } from "../../src/store/useStudyStore";
import {
  getTotalMinutesForDate, getTodayKey, calculateStreak, formatDuration,
  getWeekDates, getStreakMessage,
} from "@vidaris/shared";

export default function DashboardScreen() {
  const { sessions, subjects, streakConfig, hydrate } = useStudyStore();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) hydrate(user.id);
    });
  }, [hydrate]);

  const today = getTodayKey();
  const todayMinutes = getTotalMinutesForDate(sessions, today);
  const streak = calculateStreak(sessions, streakConfig.minMinutes);
  const weekDates = getWeekDates();
  const weekMinutes = weekDates.reduce((acc, d) => acc + getTotalMinutesForDate(sessions, d), 0);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text style={s.title}>Vidaris</Text>
        <Text style={s.subtitle}>{getStreakMessage(streak)}</Text>

        <View style={s.kpiRow}>
          <View style={s.kpi}>
            <Text style={s.kpiValue}>{formatDuration(todayMinutes)}</Text>
            <Text style={s.kpiLabel}>Aujourd'hui</Text>
          </View>
          <View style={s.kpi}>
            <Text style={s.kpiValue}>{streak}j</Text>
            <Text style={s.kpiLabel}>Streak</Text>
          </View>
          <View style={s.kpi}>
            <Text style={s.kpiValue}>{formatDuration(weekMinutes)}</Text>
            <Text style={s.kpiLabel}>Cette semaine</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Matières</Text>
        {subjects.length === 0 ? (
          <Text style={s.empty}>Aucune matière. Crée-en une dans l'onglet Matières.</Text>
        ) : (
          subjects.map((subject) => {
            const weekMins = getWeekDates().reduce(
              (acc, d) => acc + getTotalMinutesForDate(sessions.filter((s) => s.subjectId === subject.id), d),
              0
            );
            const progress = subject.goal > 0 ? Math.min((weekMins / subject.goal) * 100, 100) : 0;
            return (
              <View key={subject.id} style={s.subjectRow}>
                <View style={[s.dot, { backgroundColor: subject.color }]} />
                <View style={s.subjectInfo}>
                  <Text style={s.subjectLabel}>{subject.label}</Text>
                  <View style={s.progressBg}>
                    <View style={[s.progressFill, { width: `${progress}%` as `${number}%`, backgroundColor: subject.color }]} />
                  </View>
                </View>
                <Text style={[s.subjectMins, { color: subject.color }]}>{weekMins}min</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a1020" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: "700", color: "#fff", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#4a9eff", marginBottom: 24 },
  kpiRow: { flexDirection: "row", gap: 12, marginBottom: 28 },
  kpi: { flex: 1, backgroundColor: "#111827", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1e2d45" },
  kpiValue: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 4 },
  kpiLabel: { fontSize: 11, color: "#4a5568" },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#fff", marginBottom: 12 },
  empty: { color: "#4a5568", fontSize: 14, fontStyle: "italic" },
  subjectRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12, backgroundColor: "#111827", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#1e2d45" },
  dot: { width: 10, height: 10, borderRadius: 5 },
  subjectInfo: { flex: 1 },
  subjectLabel: { color: "#fff", fontSize: 14, fontWeight: "500", marginBottom: 6 },
  progressBg: { height: 4, backgroundColor: "#1e2d45", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  subjectMins: { fontSize: 13, fontWeight: "600" },
});
