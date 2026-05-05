import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStudyStore } from "../../src/store/useStudyStore";
import {
  getTotalMinutesForDate, getWeekDates, calculateStreak,
  calculateLongestStreak, formatDuration,
} from "@vidaris/shared";

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

export default function StatsScreen() {
  const { sessions, subjects, streakConfig } = useStudyStore();
  const weekDates = getWeekDates();
  const weekData = weekDates.map((date) => ({
    date,
    minutes: getTotalMinutesForDate(sessions, date),
  }));
  const maxMinutes = Math.max(...weekData.map((d) => d.minutes), 1);
  const streak = calculateStreak(sessions, streakConfig.minMinutes);
  const longestStreak = calculateLongestStreak(sessions, streakConfig.minMinutes);
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((acc, s) => acc + Math.floor(s.duration / 60), 0);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Statistiques</Text>

        <View style={s.kpiRow}>
          <View style={s.kpi}>
            <Text style={s.kpiValue}>{streak}j</Text>
            <Text style={s.kpiLabel}>Streak actuel</Text>
          </View>
          <View style={s.kpi}>
            <Text style={s.kpiValue}>{longestStreak}j</Text>
            <Text style={s.kpiLabel}>Record</Text>
          </View>
          <View style={s.kpi}>
            <Text style={s.kpiValue}>{totalSessions}</Text>
            <Text style={s.kpiLabel}>Sessions</Text>
          </View>
          <View style={s.kpi}>
            <Text style={s.kpiValue}>{formatDuration(totalMinutes)}</Text>
            <Text style={s.kpiLabel}>Total</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Cette semaine</Text>
        <View style={s.chart}>
          {weekData.map((day, i) => (
            <View key={day.date} style={s.bar}>
              <Text style={s.barValue}>{day.minutes > 0 ? `${day.minutes}` : ""}</Text>
              <View style={s.barBg}>
                <View
                  style={[s.barFill, { height: `${(day.minutes / maxMinutes) * 100}%` as `${number}%` }]}
                />
              </View>
              <Text style={s.barLabel}>{DAY_LABELS[i]}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>Par matière (semaine)</Text>
        {subjects.map((subject) => {
          const mins = weekDates.reduce(
            (acc, d) => acc + getTotalMinutesForDate(sessions.filter((s) => s.subjectId === subject.id), d),
            0
          );
          const pct = subject.goal > 0 ? Math.min((mins / subject.goal) * 100, 100) : 0;
          return (
            <View key={subject.id} style={s.subjectRow}>
              <View style={s.subjectHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={[s.dot, { backgroundColor: subject.color }]} />
                  <Text style={s.subjectLabel}>{subject.label}</Text>
                </View>
                <Text style={[s.subjectMins, { color: subject.color }]}>{mins}min / {subject.goal}min</Text>
              </View>
              <View style={s.progressBg}>
                <View style={[s.progressFill, { width: `${pct}%` as `${number}%`, backgroundColor: subject.color }]} />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a1020" },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: "700", color: "#fff", marginBottom: 20 },
  kpiRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  kpi: { flex: 1, minWidth: "45%", backgroundColor: "#111827", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#1e2d45" },
  kpiValue: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 4 },
  kpiLabel: { fontSize: 11, color: "#4a5568" },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#fff", marginBottom: 12 },
  chart: { flexDirection: "row", height: 150, alignItems: "flex-end", gap: 8, backgroundColor: "#111827", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1e2d45", marginBottom: 24 },
  bar: { flex: 1, alignItems: "center", height: "100%" },
  barBg: { flex: 1, width: "100%", backgroundColor: "#1e2d45", borderRadius: 4, overflow: "hidden", justifyContent: "flex-end" },
  barFill: { backgroundColor: "#4a9eff", borderRadius: 4 },
  barValue: { fontSize: 9, color: "#4a5568", marginBottom: 2 },
  barLabel: { fontSize: 11, color: "#4a5568", marginTop: 4 },
  subjectRow: { backgroundColor: "#111827", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#1e2d45", marginBottom: 10 },
  subjectHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  subjectLabel: { color: "#fff", fontSize: 14, fontWeight: "500" },
  subjectMins: { fontSize: 12, fontWeight: "600" },
  progressBg: { height: 4, backgroundColor: "#1e2d45", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
});
