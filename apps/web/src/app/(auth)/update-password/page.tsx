"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/store/useToastStore";
import { GlowButton } from "@/components/ui/GlowButton";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const hash = window.location.hash;

    if (hash.includes("type=recovery")) {
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token }).then(() => {
          window.history.replaceState(null, "", window.location.pathname);
          setReady(true);
        });
        return;
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
      else router.replace("/login");
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      addToast("Les mots de passe ne correspondent pas.", "error");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      addToast("Erreur lors de la mise à jour du mot de passe.", "error");
    } else {
      addToast("Mot de passe mis à jour !", "success");
      router.replace("/dashboard");
    }
  }

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0F1A]">
        <div className="w-6 h-6 rounded-full border-2 border-[#F5C044]/30 border-t-[#F5C044] animate-spin" />
      </div>
    );
  }

  const isValid = password.length >= 6 && password === confirm;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#F5C044]/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-[#2dd4bf]/[0.04] rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm relative"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5C044] to-[#e8a820] flex items-center justify-center mb-3 shadow-[0_0_32px_rgba(245,192,68,0.4)]">
            <GraduationCap size={22} className="text-[#0B0F1A]" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold text-white">Nouveau mot de passe</h1>
          <p className="text-slate-400 text-sm mt-1">Choisis un nouveau mot de passe sécurisé</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Nouveau mot de passe</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min. 6 caractères"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#F5C044]/40 focus:bg-[#F5C044]/[0.03] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="text-xs text-red-400 mt-1">Au moins 6 caractères requis</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="Répète ton mot de passe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#F5C044]/40 focus:bg-[#F5C044]/[0.03] transition-all"
                />
              </div>
              {confirm.length > 0 && password !== confirm && (
                <p className="text-xs text-red-400 mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>
          </div>

          <GlowButton
            type="submit"
            variant="gold"
            size="md"
            className="w-full"
            disabled={loading || !isValid}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-[#0B0F1A]/30 border-t-[#0B0F1A] animate-spin" />
                Mise à jour...
              </span>
            ) : (
              "Enregistrer le mot de passe"
            )}
          </GlowButton>
        </form>
      </motion.div>
    </div>
  );
}
