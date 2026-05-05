import type { Metadata } from "next";
import { ToastContainer } from "@/components/ui/ToastContainer";

export const metadata: Metadata = { title: "Vidaris — Connexion" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
