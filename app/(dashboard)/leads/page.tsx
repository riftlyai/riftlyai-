import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LeadTable from "@/components/dashboard/lead-table";

export default async function LeadsPage() {
  const supabase = createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("broker_id", session.user.id)
    .order("created_at", { ascending: false });

  const totalLeads = leads?.length ?? 0;
  const qualified = leads?.filter((lead) => lead.status === "qualified" || lead.status === "booked").length ?? 0;
  const booked = leads?.filter((lead) => lead.status === "booked").length ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold text-white">Lead pipeline</h1>
          <p className="text-sm text-white/60">Monitor every enquiry Riftly captured from your connected forms.</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-wide text-white/50">Total</p>
            <p className="text-xl font-semibold text-white">{totalLeads}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-wide text-white/50">Qualified</p>
            <p className="text-xl font-semibold text-white">{qualified}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-wide text-white/50">Booked</p>
            <p className="text-xl font-semibold text-white">{booked}</p>
          </div>
        </div>
      </section>

      <LeadTable leads={leads ?? []} />
    </main>
  );
}
