import clsx from "clsx";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/lib/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

const statusStyles: Record<Lead["status"], string> = {
  new: "bg-brand-500/10 text-brand-100 border border-brand-400/40",
  contacted: "bg-slate-500/10 text-slate-100 border border-slate-400/30",
  qualified: "bg-emerald-500/10 text-emerald-100 border border-emerald-400/40",
  booked: "bg-indigo-500/10 text-indigo-100 border border-indigo-400/40",
  closed: "bg-slate-700/40 text-slate-200 border border-slate-500/60",
  unresponsive: "bg-rose-500/10 text-rose-100 border border-rose-400/40"
};

function statusLabel(status: Lead["status"]) {
  switch (status) {
    case "new":
      return "New";
    case "contacted":
      return "Contacted";
    case "qualified":
      return "Qualified";
    case "booked":
      return "Booked";
    case "closed":
      return "Closed";
    case "unresponsive":
      return "Unresponsive";
    default:
      return status;
  }
}

function formatName(lead: Lead) {
  const parts = [lead.first_name, lead.last_name].filter(Boolean);
  return parts.length ? parts.join(" ") : "Unnamed lead";
}

export default function LeadTable({ leads }: { leads: Lead[] }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Recent leads</h2>
          <p className="text-sm text-white/50">Latest 20 enquiries captured from your connected lead sources.</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 p-10 text-center text-white/60">
            <p>No leads captured yet</p>
            <p className="text-sm text-white/40">Connect a lead form to see qualification activity in real time.</p>
          </div>
        ) : (
          leads.map((lead) => (
            <article
              key={lead.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-slate-950/40 p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{formatName(lead)}</p>
                <p className="truncate text-xs text-white/50">
                  {lead.email ?? "—"} · {lead.phone ?? "No phone"}
                </p>
              </div>

              <div className="hidden shrink-0 lg:block">
                <p className="text-right text-xs text-white/50">Source</p>
                <p className="text-right text-sm text-white">{lead.source ?? "Webhook"}</p>
              </div>

              <div className="hidden shrink-0 sm:block">
                <p className="text-right text-xs text-white/50">Captured</p>
                <p className="text-right text-sm text-white">
                  {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                </p>
              </div>

              <span
                className={clsx(
                  "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium uppercase",
                  statusStyles[lead.status]
                )}
              >
                {statusLabel(lead.status)}
              </span>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
