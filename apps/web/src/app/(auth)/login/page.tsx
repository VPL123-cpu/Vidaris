"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";
import { GlowButton } from "@/components/ui/GlowButton";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError, user } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  useEffect(() => {
    if (error) {
      addToast(error, "error");
      clearError();
    }
  }, [error, addToast, clearError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login(email, password);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background blobs */}
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
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5C044] to-[#e8a820] flex items-center justify-center mb-3 shadow-[0_0_32px_rgba(245,192,68,0.4)]">
            <GraduationCap size={22} className="text-[#0B0F1A]" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold text-white">Vidaris</h1>
          <p className="text-slate-400 text-sm mt-1">Connecte-toi pour retrouver ta progression</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5 space-y-4">
            {/* Email */}
            <div>
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

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
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
            </div>
          </div>

          <GlowButton
            type="submit"
            variant="gold"
            size="md"
            className="w-full"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-[#0B0F1A]/30 border-t-[#0B0F1A] animate-spin" />
                Connexion...
              </span>
            ) : (
              "Se connecter"
            )}
          </GlowButton>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="text-[#F5C044] hover:text-[#f7cb6a] font-medium transition-colors">
            Créer un compte
          </Link>
        </p>

      </motion.div>
    </div>
  );
}
