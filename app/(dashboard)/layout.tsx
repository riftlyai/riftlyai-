import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import TopNav from "@/components/navigation/top-nav";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  const { data: broker } = await supabase
    .from("brokers")
    .select("id")
    .eq("id", session.user.id)
    .maybeSingle();

  if (!broker) {
    await supabase.from("brokers").insert({
      id: session.user.id,
      email: session.user.email ?? ""
    });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.25),_transparent_55%)]">
      <TopNav
        userEmail={session.user.email ?? "team@riftly.ai"}
        links={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/leads", label: "Leads" },
          { href: "/bookings", label: "Bookings" },
          { href: "/settings/integrations", label: "Integrations" }
        ]}
      />
      <div className="px-6 pb-12 pt-4">{children}</div>
    </div>
  );
}
