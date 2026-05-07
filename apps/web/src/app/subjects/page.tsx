"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useStudyStore } from "@/store/useStudyStore";
import { useToastStore } from "@/store/useToastStore";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { hexToRgba } from "@/lib/subjects";
import { getWeekDates, getTotalMinutesForSubject, formatDuration } from "@/lib/utils";
import { Subject } from "@/types";

const PRESET_COLORS = [
  "#f97316", "#2dd4bf", "#f472b6", "#a78bfa",
  "#34d399", "#60a5fa", "#fb7185", "#fbbf24",
  "#c084fc", "#38bdf8", "#4ade80", "#f43f5e",
];

interface SubjectFormProps {
  initial?: Partial<Subject>;
  onSave: (data: { label: string; color: string; goal: number }) => void;
  onCancel: () => void;
}

function SubjectForm({ initial, onSave, onCancel }: SubjectFormProps) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [color, setColor] = useState(initial?.color ?? PRESET_COLORS[0]);
  const [goal, setGoal] = useState(initial?.goal ?? 420);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-[#161d2e] border border-[#F5C044]/20 rounded-2xl p-5 space-y-4"
    >
      <p className="text-sm font-semibold text-white">{initial?.id ? "Modifier la matière" : "Nouvelle matière"}</p>

      <div>
        <label className="text-xs text-slate-400 font-medium mb-1.5 block">Nom</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex: Physique-Chimie"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#F5C044]/40 transition-colors"
        />
      </div>

      <div>
        <label className="text-xs text-slate-400 font-medium mb-1.5 block">Couleur</label>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-lg transition-all duration-150 flex-shrink-0 ${
                color === c ? "ring-2 ring-white/60 ring-offset-2 ring-offset-[#161d2e] scale-110" : "hover:scale-105"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border border-white/10"
            title="Couleur personnalisée"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 font-medium mb-1.5 block">
          Objectif hebdomadaire : <span className="text-white font-semibold">{formatDuration(goal)}</span>
        </label>
        <input
          type="range"
          min={60}
          max={1200}
          step={30}
          value={goal}
          onChange={(e) => setGoal(Number(e.target.value))}
          className="w-full accent-[#F5C044] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
          <span>1h</span>
          <span>20h</span>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
        >
          <X size={14} /> Annuler
        </button>
        <button
          onClick={() => label.trim() && onSave({ label: label.trim(), color, goal })}
          disabled={!label.trim()}
          className="flex-1 py-2 rounded-xl bg-[#F5C044] text-[#0B0F1A] text-sm font-semibold transition-all hover:bg-[#f7cb6a] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          <Check size={14} /> Enregistrer
        </button>
      </div>
    </motion.div>
  );
}

interface SubjectCardProps {
  subject: Subject;
  weekMinutes: number;
  totalMinutes: number;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function SubjectCard({ subject, weekMinutes, totalMinutes, isEditing, onEdit, onDelete }: SubjectCardProps) {
  const pct = Math.min((weekMinutes / subject.goal) * 100, 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, height: 0 }}
      className={`bg-[#111827] rounded-xl p-4 hover:border-white/10 transition-all group border ${
        isEditing ? "border-[#F5C044]/30" : "border-white/[0.06]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: hexToRgba(subject.color, 0.15), color: subject.color }}
          >
            {subject.label.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{subject.label}</p>
            <p className="text-[10px] text-slate-500">Obj. : {formatDuration(subject.goal)}/sem</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
          <button
            onClick={onEdit}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={onDelete}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1 mb-3">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">Cette semaine</span>
          <span style={{ color: pct >= 100 ? subject.color : "#94a3b8" }}>
            {formatDuration(weekMinutes)} / {formatDuration(subject.goal)}
          </span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              backgroundColor: subject.color,
              boxShadow: pct > 5 ? `0 0 6px ${subject.color}50` : "none",
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.05] text-[11px]">
        <div>
          <span className="font-semibold text-slate-300">{formatDuration(weekMinutes)}</span>
          <span className="text-slate-600 ml-1">sem.</span>
        </div>
        <div>
          <span className="font-semibold text-slate-300">{formatDuration(totalMinutes)}</span>
          <span className="text-slate-600 ml-1">total</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function SubjectsPage() {
  const subjects = useStudyStore((s) => s.subjects);
  const sessions = useStudyStore((s) => s.sessions);
  const addSubject = useStudyStore((s) => s.addSubject);
  const updateSubject = useStudyStore((s) => s.updateSubject);
  const deleteSubject = useStudyStore((s) => s.deleteSubject);
  const addToast = useToastStore((s) => s.addToast);

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const weekDates = getWeekDates();
  const editingSubject = editingId ? subjects.find((s) => s.id === editingId) : null;

  function handleAdd(data: { label: string; color: string; goal: number }) {
    addSubject({ label: data.label, color: data.color, bgColor: hexToRgba(data.color, 0.15), goal: data.goal });
    setShowAdd(false);
    addToast(`Matière "${data.label}" ajoutée`, "success");
  }

  function handleEdit(id: string, data: { label: string; color: string; goal: number }) {
    updateSubject(id, data);
    setEditingId(null);
    addToast("Matière mise à jour", "success");
  }

  function handleDelete() {
    if (!deletingId) return;
    const sub = subjects.find((s) => s.id === deletingId);
    deleteSubject(deletingId);
    setDeletingId(null);
    addToast(`"${sub?.label}" supprimée`, "info");
  }

  return (
    <PageContainer maxWidth="xl">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Matières</h2>
            <p className="text-slate-400 text-sm mt-0.5">{subjects.length} matière{subjects.length > 1 ? "s" : ""} configurée{subjects.length > 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => { setShowAdd(true); setEditingId(null); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F5C044] text-[#0B0F1A] text-sm font-semibold hover:bg-[#f7cb6a] transition-colors shadow-[0_0_16px_rgba(245,192,68,0.25)]"
          >
            <Plus size={16} strokeWidth={2.5} />
            Nouvelle matière
          </button>
        </div>

        {/* Formulaire d'ajout */}
        <AnimatePresence>
          {showAdd && (
            <SubjectForm
              onSave={handleAdd}
              onCancel={() => setShowAdd(false)}
            />
          )}
        </AnimatePresence>

        {/* Formulaire d'édition — affiché hors de la grille */}
        <AnimatePresence>
          {editingId && editingSubject && (
            <SubjectForm
              initial={editingSubject}
              onSave={(data) => handleEdit(editingId, data)}
              onCancel={() => setEditingId(null)}
            />
          )}
        </AnimatePresence>

        {/* Grille des cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {subjects.map((sub) => (
              <SubjectCard
                key={sub.id}
                subject={sub}
                weekMinutes={getTotalMinutesForSubject(sessions, sub.id, weekDates)}
                totalMinutes={getTotalMinutesForSubject(sessions, sub.id)}
                isEditing={editingId === sub.id}
                onEdit={() => { setEditingId(sub.id); setShowAdd(false); }}
                onDelete={() => setDeletingId(sub.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {subjects.length === 0 && (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <p className="text-slate-400 font-medium">Aucune matière</p>
            <p className="text-slate-600 text-sm">Crée ta première matière pour commencer</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 text-sm transition-colors"
            >
              <Plus size={14} /> Ajouter
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        open={deletingId !== null}
        title="Supprimer cette matière ?"
        description="Toutes les sessions associées resteront, mais ne seront plus liées à cette matière dans les graphiques."
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </PageContainer>
  );
}
