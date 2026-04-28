"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { Trash2, Bell, Timer, Flame, Info, Palette, Zap, AlertTriangle, X } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { useToastStore } from "@/store/useToastStore";
import { GlowButton } from "@/components/ui/GlowButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

function Toggle({
  value,
  onChange,
  danger = false,
}: {
  value: boolean;
  onChange: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
        value
          ? danger
            ? "bg-red-500"
            : "bg-[#F5C044]"
          : "bg-white/10"
      }`}
    >
      <motion.span
        initial={{ x: value ? 22 : 2 }}
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

function DurationControl({
  label,
  value,
  onChange,
  min = 60,
  max = 3600,
  step = 60,
  color = "#F5C044",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  color?: string;
}) {
  const minutes = Math.floor(value / 60);
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/[0.05] last:border-0 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="text-xs mt-0.5" style={{ color }}>
          {minutes} min
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-7 h-7 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-sm font-bold flex items-center justify-center"
        >
          −
        </button>
        <span className="text-sm font-bold text-white tabular-nums w-10 text-center">
          {minutes}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-7 h-7 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-sm font-bold flex items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
  danger = false,
  hardcore = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  danger?: boolean;
  hardcore?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl px-5 border ${
        hardcore
          ? "bg-[#1a0f0f] border-red-500/20"
          : danger
          ? "bg-[#111827] border-red-500/10"
          : "bg-[#111827] border-white/[0.06]"
      }`}
    >
      <div
        className={`flex items-center gap-2.5 py-4 border-b ${
          hardcore ? "border-red-500/10" : "border-white/[0.05]"
        }`}
      >
        <Icon
          size={15}
          className={
            hardcore
              ? "text-red-400"
              : danger
              ? "text-red-400/60"
              : "text-slate-400"
          }
        />
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            hardcore
              ? "text-red-400"
              : danger
              ? "text-red-400/60"
              : "text-slate-500"
          }`}
        >
          {title}
        </span>
      </div>
      {children}
    </motion.div>
  );
}

function HardcoreWarningModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1a0f0f] border border-red-500/25 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <button
                onClick={onCancel}
                className="text-slate-600 hover:text-slate-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <h3 className="text-base font-bold text-white mb-2">
              Activer le mode Hardcore ?
            </h3>
            <p className="text-sm text-slate-400 mb-1 leading-relaxed">
              Mode exigeant. Progression plus rapide mais punition plus forte.
            </p>
            <ul className="text-xs text-red-400/80 space-y-1 mt-3 mb-5">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
                Streak cassé → reset XP partiel
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
                Impossible de skip les pauses pomodoro
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
                Objectif quotidien obligatoire
              </li>
            </ul>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              >
                Activer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function SettingsPage() {
  const sessions = useStudyStore((s) => s.sessions);
  const clearSessions = useStudyStore((s) => s.clearSessions);
  const pomodoroConfig = useStudyStore((s) => s.pomodoroConfig);
  const updatePomodoroConfig = useStudyStore((s) => s.updatePomodoroConfig);
  const streakConfig = useStudyStore((s) => s.streakConfig);
  const updateStreakConfig = useStudyStore((s) => s.updateStreakConfig);
  const hardcoreMode = useStudyStore((s) => s.hardcoreMode);
  const toggleHardcoreMode = useStudyStore((s) => s.toggleHardcoreMode);
  const addToast = useToastStore((s) => s.addToast);

  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showHardcoreWarning, setShowHardcoreWarning] = useState(false);

  function handleClearSessions() {
    clearSessions();
    setConfirmReset(false);
    addToast("Toutes les sessions ont été supprimées", "info");
  }

  function handleHardcoreToggle() {
    if (!hardcoreMode) {
      setShowHardcoreWarning(true);
    } else {
      toggleHardcoreMode();
      addToast("Mode Hardcore désactivé", "info");
    }
  }

  function confirmHardcore() {
    setShowHardcoreWarning(false);
    toggleHardcoreMode();
    addToast("Mode Hardcore activé 🔥 Bonne chance.", "success");
  }

  return (
    <PageContainer maxWidth="md">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Paramètres</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Configure l'application selon tes préférences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <div className="space-y-4">
            {/* Pomodoro config */}
            <SectionCard title="Pomodoro" icon={Timer}>
              <DurationControl
                label="Durée de travail"
                value={pomodoroConfig.workDuration}
                onChange={(v) => updatePomodoroConfig({ workDuration: v })}
                min={300}
                max={7200}
                step={300}
                color="#F5C044"
              />
              <DurationControl
                label="Pause courte"
                value={pomodoroConfig.shortBreak}
                onChange={(v) => updatePomodoroConfig({ shortBreak: v })}
                min={60}
                max={1800}
                step={60}
                color="#2dd4bf"
              />
              <DurationControl
                label="Grande pause"
                value={pomodoroConfig.longBreak}
                onChange={(v) => updatePomodoroConfig({ longBreak: v })}
                min={300}
                max={3600}
                step={300}
                color="#a78bfa"
              />
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Cycles avant grande pause
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Nombre de pomodoros
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updatePomodoroConfig({
                        cyclesBeforeLongBreak: Math.max(
                          1,
                          pomodoroConfig.cyclesBeforeLongBreak - 1
                        ),
                      })
                    }
                    className="w-7 h-7 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 text-sm font-bold flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="text-sm font-bold text-white w-6 text-center">
                    {pomodoroConfig.cyclesBeforeLongBreak}
                  </span>
                  <button
                    onClick={() =>
                      updatePomodoroConfig({
                        cyclesBeforeLongBreak: Math.min(
                          8,
                          pomodoroConfig.cyclesBeforeLongBreak + 1
                        ),
                      })
                    }
                    className="w-7 h-7 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 text-sm font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Streak config */}
            <SectionCard title="Série (Streak)" icon={Flame}>
              <div className="flex items-center justify-between py-4 border-b border-white/[0.05]">
                <div className="mr-4">
                  <p className="text-sm font-medium text-slate-200">
                    Activer la série
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Suivi des jours consécutifs
                  </p>
                </div>
                <Toggle
                  value={streakConfig.enabled}
                  onChange={() =>
                    updateStreakConfig({ enabled: !streakConfig.enabled })
                  }
                />
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Minimum quotidien
                  </p>
                  <p className="text-xs mt-0.5 text-orange-400">
                    {streakConfig.minMinutes} min
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateStreakConfig({
                        minMinutes: Math.max(10, streakConfig.minMinutes - 10),
                      })
                    }
                    className="w-7 h-7 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-sm font-bold flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="text-sm font-bold text-white tabular-nums w-10 text-center">
                    {streakConfig.minMinutes}
                  </span>
                  <button
                    onClick={() =>
                      updateStreakConfig({
                        minMinutes: Math.min(
                          240,
                          streakConfig.minMinutes + 10
                        ),
                      })
                    }
                    className="w-7 h-7 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-sm font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-4">
            {/* Hardcore mode */}
            <SectionCard title="Mode Hardcore" icon={Zap} hardcore={hardcoreMode}>
              <div className="flex items-start justify-between py-4 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200">
                    Activer le mode Hardcore
                  </p>
                  <p className="text-xs text-red-400/70 mt-0.5 leading-relaxed">
                    Punitions plus sévères, progression plus intense.
                  </p>
                </div>
                <Toggle
                  value={hardcoreMode}
                  onChange={handleHardcoreToggle}
                  danger
                />
              </div>
              {hardcoreMode && (
                <div className="pb-4 space-y-1.5">
                  {[
                    "Reset XP partiel si streak cassé",
                    "Pas de skip de pause pomodoro",
                    "Objectif quotidien obligatoire",
                  ].map((rule) => (
                    <div
                      key={rule}
                      className="flex items-center gap-2 text-xs text-red-400/70"
                    >
                      <span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
                      {rule}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Notifications */}
            <SectionCard title="Notifications" icon={Bell}>
              <div className="flex items-center justify-between py-4 border-b border-white/[0.05]">
                <div className="mr-4">
                  <p className="text-sm font-medium text-slate-200">
                    Rappels de session
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Notification en fin de timer
                  </p>
                </div>
                <Toggle
                  value={notifications}
                  onChange={() => setNotifications((v) => !v)}
                />
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="mr-4">
                  <p className="text-sm font-medium text-slate-200">Sons</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Bip à la fin du timer
                  </p>
                </div>
                <Toggle
                  value={sound}
                  onChange={() => setSound((v) => !v)}
                />
              </div>
            </SectionCard>

            <SectionCard title="Apparence" icon={Palette}>
              <div className="flex items-center justify-between py-4">
                <div className="mr-4">
                  <p className="text-sm font-medium text-slate-200">Thème</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sombre uniquement
                  </p>
                </div>
                <span className="text-xs text-slate-400 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex-shrink-0">
                  Dark
                </span>
              </div>
            </SectionCard>

            <SectionCard title="Données" icon={Trash2} danger>
              <div className="py-4 space-y-3">
                <p className="text-xs text-slate-500">
                  {sessions.length} sessions enregistrées. Cette action est
                  irréversible.
                </p>
                <GlowButton
                  variant="outline"
                  size="sm"
                  glow={false}
                  onClick={() => setConfirmReset(true)}
                  className="border-red-500/20 text-red-400 hover:border-red-500/40 hover:bg-red-500/5"
                >
                  <Trash2 size={13} />
                  Effacer toutes les données
                </GlowButton>
              </div>
            </SectionCard>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-2.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
        >
          <Info size={14} className="text-slate-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-600 leading-relaxed">
            Les données sont stockées localement dans votre navigateur.
            Connectez-vous pour synchroniser entre appareils.
          </p>
        </motion.div>
      </div>

      <ConfirmModal
        open={confirmReset}
        title="Effacer toutes les sessions ?"
        description={`${sessions.length} sessions seront supprimées définitivement. Vos stats reviennent à zéro.`}
        confirmLabel="Tout supprimer"
        onConfirm={handleClearSessions}
        onCancel={() => setConfirmReset(false)}
      />

      <HardcoreWarningModal
        open={showHardcoreWarning}
        onConfirm={confirmHardcore}
        onCancel={() => setShowHardcoreWarning(false)}
      />
    </PageContainer>
  );
}
