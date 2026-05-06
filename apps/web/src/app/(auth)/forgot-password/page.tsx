"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GlowButton } from "@/components/ui/GlowButton";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    setLoading(false);
    setSent(true);
  }

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
          <h1 className="text-xl font-bold text-white">Mot de passe oublié</h1>
          <p className="text-slate-400 text-sm mt-1">
            {sent ? "Vérifie ta boîte mail" : "On t'envoie un lien de réinitialisation"}
          </p>
        </div>

        {sent ? (
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#2dd4bf]/10 flex items-center justify-center mx-auto">
              <Mail size={18} className="text-[#2dd4bf]" />
            </div>
            <p className="text-sm text-slate-300">
              Un email a été envoyé à <span className="text-white font-medium">{email}</span>
            </p>
            <p className="text-xs text-slate-500">Clique sur le lien dans l'email pour créer un nouveau mot de passe.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5">
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ton@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#F5C044]/40 focus:bg-[#F5C044]/[0.03] transition-all"
                />
              </div>
            </div>

            <GlowButton
              type="submit"
              variant="gold"
              size="md"
              className="w-full"
              disabled={loading || !email}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-[#0B0F1A]/30 border-t-[#0B0F1A] animate-spin" />
                  Envoi...
                </span>
              ) : (
                "Envoyer le lien"
              )}
            </GlowButton>
          </form>
        )}

        <p className="text-center text-sm text-slate-500 mt-5">
          <Link href="/login" className="text-[#F5C044] hover:text-[#f7cb6a] font-medium transition-colors">
            ← Retour à la connexion
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
