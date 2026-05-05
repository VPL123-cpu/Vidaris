import { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Alert, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStudyStore } from "../../src/store/useStudyStore";
import { supabase } from "../../src/lib/supabase";

const COLORS = ["#4a9eff", "#a78bfa", "#34d399", "#f59e0b", "#f87171", "#fb923c", "#e879f9", "#2dd4bf"];

export default function SubjectsScreen() {
  const { subjects, addSubject, deleteSubject } = useStudyStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [goal, setGoal] = useState("120");

  async function handleAdd() {
    if (!label.trim()) return;
    await addSubject({ label: label.trim(), color, bgColor: color + "26", goal: parseInt(goal) || 120 });
    setLabel(""); setColor(COLORS[0]); setGoal("120");
    setModalVisible(false);
  }

  function handleDelete(id: string, label: string) {
    Alert.alert("Supprimer", `Supprimer "${label}" ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => deleteSubject(id) },
    ]);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.header}>
          <Text style={s.title}>Matières</Text>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
            <Text style={s.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>

        {subjects.map((subject) => (
          <View key={subject.id} style={s.subjectRow}>
            <View style={[s.dot, { backgroundColor: subject.color }]} />
            <View style={s.subjectInfo}>
              <Text style={s.subjectLabel}>{subject.label}</Text>
              <Text style={s.subjectGoal}>Objectif : {subject.goal}min/semaine</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(subject.id, subject.label)}>
              <Text style={s.deleteBtn}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={s.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={s.addBtnText}>+ Ajouter une matière</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Nouvelle matière</Text>
            <TextInput
              style={s.input}
              placeholder="Nom (ex: Mathématiques)"
              placeholderTextColor="#4a5568"
              value={label}
              onChangeText={setLabel}
            />
            <TextInput
              style={s.input}
              placeholder="Objectif hebdo (minutes)"
              placeholderTextColor="#4a5568"
              value={goal}
              onChangeText={setGoal}
              keyboardType="numeric"
            />
            <View style={s.colorRow}>
              {COLORS.map((c) => (
                <TouchableOpacity key={c} style={[s.colorDot, { backgroundColor: c }, color === c && s.colorDotActive]} onPress={() => setColor(c)} />
              ))}
            </View>
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={s.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.confirmBtn} onPress={handleAdd}>
                <Text style={s.confirmBtnText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a1020" },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "700", color: "#fff" },
  logoutBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: "#1e2d45" },
  logoutText: { color: "#94a3b8", fontSize: 13 },
  subjectRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#111827", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#1e2d45", marginBottom: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  subjectInfo: { flex: 1 },
  subjectLabel: { color: "#fff", fontSize: 15, fontWeight: "600" },
  subjectGoal: { color: "#4a5568", fontSize: 12, marginTop: 2 },
  deleteBtn: { color: "#ef4444", fontSize: 16, padding: 4 },
  addBtn: { backgroundColor: "#111827", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#4a9eff", borderStyle: "dashed", alignItems: "center", marginTop: 4 },
  addBtnText: { color: "#4a9eff", fontSize: 15, fontWeight: "600" },
  overlay: { flex: 1, backgroundColor: "#000000aa", justifyContent: "flex-end" },
  modal: { backgroundColor: "#0d1526", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderColor: "#1e2d45" },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 20 },
  input: { backgroundColor: "#111827", borderWidth: 1, borderColor: "#1e2d45", borderRadius: 12, padding: 14, color: "#fff", fontSize: 15, marginBottom: 12 },
  colorRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotActive: { borderWidth: 2, borderColor: "#fff" },
  modalBtns: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#1e2d45", alignItems: "center" },
  cancelBtnText: { color: "#94a3b8", fontSize: 15 },
  confirmBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: "#4a9eff", alignItems: "center" },
  confirmBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
