import { format, formatDistanceToNow } from "date-fns";
import type { Database } from "@/lib/supabase/types";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];

const statusCopy: Record<Booking["status"], { label: string; color: string }> = {
  pending: { label: "Pending confirmation", color: "text-amber-200" },
  confirmed: { label: "Confirmed", color: "text-emerald-200" },
  cancelled: { label: "Cancelled", color: "text-rose-200" }
};

export default function BookingTimeline({ bookings }: { bookings: Booking[] }) {
  return (
    <section className="h-full rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Upcoming consultations</h2>
        <p className="text-sm text-white/50">Consultations booked by Riftly AI for your team.</p>
      </div>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/20 p-8 text-center text-white/60">
            <p>No consultations booked yet</p>
            <p className="text-sm text-white/40">
              Riftly AI will automatically schedule meetings when qualified leads are detected.
            </p>
          </div>
        ) : (
          bookings.map((booking) => (
            <article key={booking.id} className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">Scheduled</p>
              <p className="text-base font-semibold text-white">
                {format(new Date(booking.scheduled_at), "EEE, MMM d • HH:mm")}
              </p>
              <p className="text-xs text-white/50">
                {formatDistanceToNow(new Date(booking.scheduled_at), { addSuffix: true })}
              </p>
              <p className={`mt-2 text-xs font-medium ${statusCopy[booking.status].color}`}>
                {statusCopy[booking.status].label}
              </p>
              {booking.meeting_link ? (
                <a
                  href={booking.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-brand-200 hover:text-brand-100"
                >
                  Join meeting
                </a>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
