"use client";

import { useEffect } from "react";

export default function RootPage() {
  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) {
      window.location.replace("/update-password" + window.location.hash);
    } else {
      window.location.replace("/dashboard");
    }
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-[#0B0F1A]">
      <div className="w-6 h-6 rounded-full border-2 border-[#F5C044]/30 border-t-[#F5C044] animate-spin" />
    </div>
  );
}
