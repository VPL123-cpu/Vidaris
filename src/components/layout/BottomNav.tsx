"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, BarChart2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Accueil" },
  { href: "/stats", icon: BarChart2, label: "Stats" },
  { href: "/settings", icon: Settings, label: "Réglages" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-[#161d2e]/90 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} className="relative">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex flex-col items-center justify-center px-5 py-2.5 rounded-xl transition-all duration-200 gap-1",
                  isActive
                    ? "text-[#F5C044]"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-[#F5C044]/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="relative z-10"
                />
                <span className="text-[10px] font-medium relative z-10 leading-none">
                  {label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
