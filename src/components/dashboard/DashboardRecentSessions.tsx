"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2 } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { useToastStore } from "@/store/useToastStore";
import { getSubjectFromList } from "@/lib/subjects";
import { formatDurationFromSeconds } from "@/lib/utils";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { StudySession } from "@/types";

function SessionRow({ session, onDelete }: { session: StudySession; onDelete: () => void }) {
  const subjects = useStudyStore((s) => s.subjects);
  const sub = getSubjectFromList(subjects, session.subjectId);
  const isToday = session.date === new Date().toISOString().split("T")[0];
  const dateObj = new Date(session.date);
  const label = isToday
    ? "Aujourd'hui"
    : dateObj.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group"
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: sub.color, boxShadow: `0 0 5px ${sub.color}60` }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-300 truncate">{sub.label}</p>
        <p className="text-[10px] text-slate-600">{label}</p>
      </div>
      <span className="text-xs font-semibold text-slate-400 tabular-nums">
        {formatDurationFromSeconds(session.duration)}
      </span>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
      >
        <Trash2 size={12} />
      </button>
    </motion.div>
  );
}

export function DashboardRecentSessions() {
  const sessions = useStudyStore((s) => s.sessions);
  const deleteSession = useStudyStore((s) => s.deleteSession);
  const addToast = useToastStore((s) => s.addToast);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const recent = [...sessions]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10);

  function handleDelete() {
    if (!pendingDelete) return;
    deleteSession(pendingDelete);
    setPendingDelete(null);
    addToast("Session supprimée", "success");
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5 h-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Dernières sessions</h3>
          {recent.length > 0 && (
            <span className="text-xs text-slate-500">{recent.length} sessions</span>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
              <Clock size={18} className="text-slate-600" />
            </div>
            <p className="text-sm text-slate-500">Aucune session</p>
            <p className="text-xs text-slate-600 mt-0.5">Lance le timer pour commencer</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            <AnimatePresence initial={false}>
              {recent.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  onDelete={() => setPendingDelete(session.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <ConfirmModal
        open={pendingDelete !== null}
        title="Supprimer cette session ?"
        description="Cette action est irréversible. Les stats seront mises à jour automatiquement."
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
