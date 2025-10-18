import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarDays, PhoneCall, RefreshCw } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import LeadTable from "@/components/dashboard/lead-table";
import BookingTimeline from "@/components/dashboard/booking-timeline";
import ConversationHighlights from "@/components/dashboard/conversation-highlights";

export default async function DashboardPage() {
  const supabase = createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  const brokerId = session.user.id;

  const [{ data: leads }, { data: bookings }, { data: conversations }] = await Promise.all([
    supabase
      .from("leads")
      .select("*")
      .eq("broker_id", brokerId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("bookings")
      .select("*")
      .eq("broker_id", brokerId)
      .order("scheduled_at", { ascending: true })
      .limit(10),
    supabase
      .from("conversation_logs")
      .select("*")
      .eq("broker_id", brokerId)
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  const totalLeads = leads?.length ?? 0;
  const qualifiedLeads = leads?.filter((lead) => lead.status === "qualified" || lead.status === "booked").length ?? 0;
  const bookedConsultations = leads?.filter((lead) => lead.status === "booked").length ?? 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm uppercase tracking-widest text-brand-200">Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold text-white sm:text-4xl">Welcome back</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/60">
            Track new mortgage leads, monitor AI conversations, and confirm scheduled consultations.
          </p>
        </div>
        <Link
          href="/settings/integrations"
          className="inline-flex items-center gap-2 rounded-lg border border-brand-400/50 bg-brand-500/20 px-4 py-2 text-sm font-medium text-brand-100 transition hover:bg-brand-500/30"
        >
          Manage integrations
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-brand-500/20 p-2">
              <RefreshCw className="h-5 w-5 text-brand-200" />
            </span>
            <div>
              <p className="text-sm text-white/60">Leads captured</p>
              <p className="text-2xl font-semibold text-white">{totalLeads}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-emerald-500/20 p-2">
              <PhoneCall className="h-5 w-5 text-emerald-200" />
            </span>
            <div>
              <p className="text-sm text-white/60">Qualified leads</p>
              <p className="text-2xl font-semibold text-white">{qualifiedLeads}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-indigo-500/20 p-2">
              <CalendarDays className="h-5 w-5 text-indigo-200" />
            </span>
            <div>
              <p className="text-sm text-white/60">Booked consultations</p>
              <p className="text-2xl font-semibold text-white">{bookedConsultations}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <LeadTable leads={leads ?? []} />
        <BookingTimeline bookings={bookings ?? []} />
      </section>

      <ConversationHighlights conversations={conversations ?? []} />
    </main>
  );
}
