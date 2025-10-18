import type { Metadata } from "next";
import { ReactNode } from "react";
import SupabaseProvider from "@/components/supabase-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Riftly AI | Lead Catcher Dashboard",
  description:
    "Riftly AI automates lead engagement for mortgage brokers with instant outreach, qualification, and booking."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-slate-950">
      <body className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_55%)] text-slate-100 antialiased">
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
