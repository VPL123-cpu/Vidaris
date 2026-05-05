import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SaasLayout } from "@/components/layout/SaasLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vidaris — Tracker d'études",
  description: "Application de tracking d'études pour prépa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SaasLayout>{children}</SaasLayout>
      </body>
    </html>
  );
}
