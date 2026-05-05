import { useEffect, useRef, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStudyStore } from "../../src/store/useStudyStore";
import { formatTime, getSubjectFromList } from "@vidaris/shared";

export default function TimerScreen() {
  const {
    mode, status, elapsed, remaining, pomodoroPhase, pomoCyclesCompleted,
    subjects, selectedSubjectId, pomodoroConfig,
    setMode, setSubject, startTimer, pauseTimer, resetTimer, tick,
  } = useStudyStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [subjectOpen, setSubjectOpen] = useState(false);

  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status, tick]);

  const subject = getSubjectFromList(subjects, selectedSubjectId);
  const displayTime = mode === "chrono" ? formatTime(elapsed) : formatTime(remaining);
  const totalDuration = pomodoroPhase === "work" ? pomodoroConfig.workDuration : pomodoroPhase === "shortBreak" ? pomodoroConfig.shortBreak : pomodoroConfig.longBreak;
  const progress = mode === "chrono" ? 0 : (remaining / totalDuration) * 100;

  const phaseLabel = pomodoroPhase === "work" ? "Travail" : pomodoroPhase === "shortBreak" ? "Pause courte" : "Grande pause";

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Timer</Text>

        <View style={s.modeRow}>
          {(["pomodoro", "chrono"] as const).map((m) => (
            <TouchableOpacity
              key={m} style={[s.modeBtn, mode === m && s.modeBtnActive]}
              onPress={() => status === "idle" && setMode(m)} disabled={status !== "idle"}
            >
              <Text style={[s.modeBtnText, mode === m && s.modeBtnTextActive]}>
                {m === "pomodoro" ? "Pomodoro" : "Chrono"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {mode === "pomodoro" && (
          <Text style={s.phase}>{phaseLabel} · Cycle {pomoCyclesCompleted + 1}</Text>
        )}

        <View style={s.timerContainer}>
          <View style={s.timerBg}>
            {mode === "pomodoro" && (
              <View style={[s.timerProgress, { transform: [{ rotate: `${(progress / 100) * 360}deg` }] }]} />
            )}
            <Text style={s.timerText}>{displayTime}</Text>
          </View>
        </View>

        {subject && (
          <Pressable style={s.subjectBtn} onPress={() => status !== "running" && setSubjectOpen((v) => !v)}>
            <View style={[s.dot, { backgroundColor: subject.color }]} />
            <Text style={s.subjectBtnText}>{subject.label}</Text>
            <Text style={s.chevron}>{subjectOpen ? "▲" : "▼"}</Text>
          </Pressable>
        )}

        {subjectOpen && (
          <View style={s.subjectList}>
            {subjects.map((sub) => (
              <TouchableOpacity
                key={sub.id} style={[s.subjectItem, selectedSubjectId === sub.id && s.subjectItemActive]}
                onPress={() => { setSubject(sub.id); setSubjectOpen(false); }}
              >
                <View style={[s.dot, { backgroundColor: sub.color }]} />
                <Text style={[s.subjectItemText, { color: selectedSubjectId === sub.id ? sub.color : "#94a3b8" }]}>
                  {sub.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={s.controls}>
          <TouchableOpacity style={s.resetBtn} onPress={resetTimer}>
            <Text style={s.resetBtnText}>↺</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.mainBtn, status === "running" && s.mainBtnPause]}
            onPress={() => status === "running" ? pauseTimer() : startTimer()}
          >
            <Text style={s.mainBtnText}>{status === "running" ? "⏸" : "▶"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a1020" },
  content: { padding: 20, alignItems: "center", paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: "700", color: "#fff", alignSelf: "flex-start", marginBottom: 20 },
  modeRow: { flexDirection: "row", gap: 8, marginBottom: 16, backgroundColor: "#111827", borderRadius: 16, padding: 4 },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  modeBtnActive: { backgroundColor: "#4a9eff" },
  modeBtnText: { color: "#4a5568", fontSize: 14, fontWeight: "600" },
  modeBtnTextActive: { color: "#fff" },
  phase: { color: "#4a9eff", fontSize: 13, marginBottom: 16 },
  timerContainer: { marginVertical: 24 },
  timerBg: { width: 220, height: 220, borderRadius: 110, borderWidth: 3, borderColor: "#1e2d45", alignItems: "center", justifyContent: "center", backgroundColor: "#111827" },
  timerProgress: { position: "absolute", width: 220, height: 220, borderRadius: 110, borderWidth: 3, borderColor: "#4a9eff", borderTopColor: "transparent", borderRightColor: "transparent" },
  timerText: { fontSize: 52, fontWeight: "700", color: "#fff", fontVariant: ["tabular-nums"] },
  subjectBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#111827", borderWidth: 1, borderColor: "#1e2d45", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, width: "100%", marginBottom: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  subjectBtnText: { flex: 1, color: "#fff", fontSize: 14, fontWeight: "500" },
  chevron: { color: "#4a5568", fontSize: 12 },
  subjectList: { width: "100%", backgroundColor: "#111827", borderWidth: 1, borderColor: "#1e2d45", borderRadius: 14, overflow: "hidden", marginBottom: 16 },
  subjectItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  subjectItemActive: { backgroundColor: "#ffffff08" },
  subjectItemText: { fontSize: 14, fontWeight: "500" },
  controls: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 16 },
  resetBtn: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: "#1e2d45", backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },
  resetBtnText: { fontSize: 22, color: "#94a3b8" },
  mainBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#4a9eff", alignItems: "center", justifyContent: "center" },
  mainBtnPause: { backgroundColor: "#f59e0b" },
  mainBtnText: { fontSize: 28, color: "#fff" },
});
