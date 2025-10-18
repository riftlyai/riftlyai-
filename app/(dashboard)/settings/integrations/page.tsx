import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { updateIntegrationSettings } from "./actions";

export default async function IntegrationsPage() {
  const supabase = createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  const { data: broker } = await supabase
    .from("brokers")
    .select("company, phone, timezone, calendar_id, preferences")
    .eq("id", session.user.id)
    .maybeSingle();

  const preferences = (broker?.preferences as { twilio_number?: string; whatsapp_number?: string } | null) ?? {};

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-white">Integration settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/60">
          Connect your communication channels so Riftly can contact leads, run AI conversations, and book meetings in
          the right calendar.
        </p>

        <form action={updateIntegrationSettings} className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="col-span-2 grid gap-4 rounded-xl border border-white/10 bg-slate-950/50 p-6">
            <h2 className="text-lg font-semibold text-white">Business profile</h2>
            <label className="text-sm text-white/60" htmlFor="company">
              Company name
              <input
                id="company"
                name="company"
                defaultValue={broker?.company ?? ""}
                className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-white"
                placeholder="Riftly Mortgage Brokers"
              />
            </label>
            <label className="text-sm text-white/60" htmlFor="phone">
              Caller ID phone number
              <input
                id="phone"
                name="phone"
                defaultValue={broker?.phone ?? ""}
                className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-white"
                placeholder="+441234567890"
              />
            </label>
            <label className="text-sm text-white/60" htmlFor="timezone">
              Default timezone
              <input
                id="timezone"
                name="timezone"
                defaultValue={broker?.timezone ?? "Europe/London"}
                className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-white"
                placeholder="Europe/London"
              />
            </label>
            <label className="text-sm text-white/60" htmlFor="calendar_id">
              Google Calendar ID
              <input
                id="calendar_id"
                name="calendar_id"
                defaultValue={broker?.calendar_id ?? ""}
                className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-white"
                placeholder="primary"
              />
            </label>
          </div>

          <div className="col-span-2 grid gap-4 rounded-xl border border-white/10 bg-slate-950/50 p-6">
            <h2 className="text-lg font-semibold text-white">Twilio credentials</h2>
            <label className="text-sm text-white/60" htmlFor="twilio_number">
              Voice caller ID
              <input
                id="twilio_number"
                name="twilio_number"
                defaultValue={preferences.twilio_number ?? ""}
                className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-white"
                placeholder="+441234567890"
              />
            </label>
            <label className="text-sm text-white/60" htmlFor="whatsapp_number">
              WhatsApp-enabled number
              <input
                id="whatsapp_number"
                name="whatsapp_number"
                defaultValue={preferences.whatsapp_number ?? ""}
                className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-white"
                placeholder="+441234567890"
              />
            </label>
            <p className="text-xs text-white/50">
              Configure environment variables for Twilio SID/Auth Token in <code>.env.local</code>. Riftly reuses these
              values for voice calls and WhatsApp outreach.
            </p>
          </div>

          <div className="col-span-2 flex items-center justify-end">
            <button className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-400">
              Save settings
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold text-white">1. Connect Supabase</h3>
          <p className="mt-2 text-sm text-white/60">
            Add the project URL, anon key, and service role key to <code>.env.local</code>. Run the SQL in
            <code>supabase/migrations/0001_initial.sql</code> to provision tables and policies.
          </p>
        </article>
        <article className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold text-white">2. Configure Twilio</h3>
          <p className="mt-2 text-sm text-white/60">
            Enable WhatsApp and purchase a voice number. Point the voice webhook to <code>/api/voice/twiml</code> and the
            WhatsApp inbound webhook to <code>/api/whatsapp/webhook</code>.
          </p>
        </article>
        <article className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold text-white">3. Authorise Google Calendar</h3>
          <p className="mt-2 text-sm text-white/60">
            Create a service account, share the target calendar with it, and paste the email, private key, and calendar
            ID into your environment variables to enable bookings.
          </p>
        </article>
      </section>
    </main>
  );
}
