"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { ReactNode } from "react";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-[#0B0F1A] flex flex-col">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#F5C044]/[0.03] blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full bg-[#2dd4bf]/[0.03] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-[#f472b6]/[0.03] blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex-1 max-w-lg mx-auto w-full px-4 pt-6 pb-32 relative"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
