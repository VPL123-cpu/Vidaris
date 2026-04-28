"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Timer, BarChart2, BookOpen,
  Target, Settings, ChevronLeft, ChevronRight, GraduationCap, User, Users,
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useStudyStore } from "@/store/useStudyStore";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/timer", icon: Timer, label: "Timer" },
  { href: "/stats", icon: BarChart2, label: "Statistiques" },
  { href: "/subjects", icon: BookOpen, label: "Matières" },
  { href: "/goals", icon: Target, label: "Objectifs" },
  { href: "/social", icon: Users, label: "Social" },
];
const BOTTOM_ITEMS = [
  { href: "/settings", icon: Settings, label: "Paramètres" },
];

function NavItem({ href, icon: Icon, label, isActive, collapsed, onClick }: {
  href: string; icon: React.ElementType; label: string;
  isActive: boolean; collapsed: boolean; onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className="relative group block">
      <motion.div
        className={cn(
          "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150",
          isActive ? "text-white bg-white/10" : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
        )}
        whileTap={{ scale: 0.97 }}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute inset-0 rounded-xl bg-[#F5C044]/10 border border-[#F5C044]/20"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        <span className={cn("relative z-10 flex-shrink-0", isActive && "text-[#F5C044]")}>
          <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
        </span>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#1a2235] border border-white/10 rounded-lg text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            {label}
          </div>
        )}
      </motion.div>
    </Link>
  );
}

function SidebarContent({ collapsed, onNav }: { collapsed: boolean; onNav?: () => void }) {
  const pathname = usePathname();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const timerStatus = useStudyStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const isLive = timerStatus === "running";

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]", collapsed && "justify-center px-3")}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F5C044] to-[#e8a820] flex items-center justify-center flex-shrink-0 shadow-[0_0_16px_rgba(245,192,68,0.3)]">
          <GraduationCap size={16} className="text-[#0B0F1A]" strokeWidth={2.5} />
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="text-base font-bold text-white tracking-tight whitespace-nowrap overflow-hidden"
            >
              Vidaris
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Live indicator */}
      <AnimatePresence>
        {isLive && !collapsed && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mx-3 mt-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-xs font-semibold text-emerald-400">Session active</span>
            </div>
          </motion.div>
        )}
        {isLive && collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center mt-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 pb-2"
            >Navigation</motion.p>
          )}
        </AnimatePresence>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item}
            isActive={pathname === item.href || (item.href === "/dashboard" && pathname === "/")}
            collapsed={collapsed} onClick={onNav}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-3 space-y-1 border-t border-white/[0.06] pt-3">
        {BOTTOM_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} isActive={pathname === item.href} collapsed={collapsed} onClick={onNav} />
        ))}
        <div className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-colors mt-2", collapsed && "justify-center")}>
          <div className="w-7 h-7 rounded-lg bg-[#F5C044]/20 flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-[#F5C044]" />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden min-w-0">
                <p className="text-sm font-medium text-slate-200 whitespace-nowrap">{user?.name ?? "Invité"}</p>
                <p className="text-xs text-slate-500 whitespace-nowrap">{user ? "Connecté" : "Mode local"}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#1a2235] border border-white/10 items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all shadow-lg z-10 hidden lg:flex"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </div>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, mobileOpen, setMobileOpen } = useUIStore();
  return (
    <>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden lg:flex flex-col relative h-screen bg-[#0d1526] border-r border-white/[0.06] flex-shrink-0 overflow-visible"
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-[#0d1526] border-r border-white/[0.06] z-50 lg:hidden"
          >
            <SidebarContent collapsed={false} onNav={() => setMobileOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
