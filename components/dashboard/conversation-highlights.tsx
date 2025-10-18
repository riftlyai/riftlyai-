import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/lib/supabase/types";

type ConversationLog = Database["public"]["Tables"]["conversation_logs"]["Row"];

export default function ConversationHighlights({ conversations }: { conversations: ConversationLog[] }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-white">AI conversation summaries</h2>
          <p className="text-sm text-white/50">
            Latest call or WhatsApp transcripts condensed into actionable bullet points.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 p-10 text-center text-white/60">
            <p>No conversations yet</p>
            <p className="text-sm text-white/40">Summaries will appear after Riftly AI speaks with a new lead.</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <article key={conversation.id} className="space-y-3 rounded-xl border border-white/10 bg-slate-950/40 p-5">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/50">
                <p>Lead: {conversation.lead_id.slice(0, 8)}</p>
                <p>{formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}</p>
              </div>
              <p className="text-sm text-white/80">
                <strong className="text-white">Summary:</strong> {conversation.summary ?? "Awaiting summary"}
              </p>
              <p className="text-xs text-white/60 whitespace-pre-line">{conversation.transcript.slice(0, 400)}...</p>
              {conversation.qualification_score !== null ? (
                <p className="text-xs font-medium text-brand-200">
                  Qualification score: {conversation.qualification_score}/100
                </p>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
