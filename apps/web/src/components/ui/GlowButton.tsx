"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlowButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: "gold" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}

export function GlowButton({
  children,
  variant = "gold",
  size = "md",
  glow = true,
  className,
  disabled,
  ...props
}: GlowButtonProps) {
  const base =
    "relative inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 select-none cursor-pointer";

  const variants = {
    gold: "bg-[#F5C044] text-[#0B0F1A] hover:bg-[#f7cb6a]",
    ghost: "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white",
    outline:
      "border border-white/10 text-slate-300 hover:border-white/20 hover:text-white bg-transparent",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-6 py-3 text-base gap-2",
    lg: "px-8 py-4 text-lg gap-2.5",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        glow && variant === "gold" && !disabled && "shadow-[0_0_24px_rgba(245,192,68,0.35)]",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}
