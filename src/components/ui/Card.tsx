import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glass?: boolean;
}

export function Card({ children, glass = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        glass
          ? "card-glass"
          : "bg-[#111827] border-white/[0.06]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
