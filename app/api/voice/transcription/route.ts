import { createServiceRoleClient } from "@/lib/supabase/server";
import { persistConversationOutcome } from "@/lib/workflows/lead-intake";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const leadId = url.searchParams.get("leadId");

  if (!leadId) {
    return new Response("Missing leadId parameter.", { status: 400 });
  }

  const formData = await request.formData();
  const transcript = formData.get("TranscriptionText")?.toString() ?? "";
  const recordingUrl = formData.get("RecordingUrl")?.toString() ?? null;

  const supabase = createServiceRoleClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .select("broker_id")
    .eq("id", leadId)
    .single();

  if (error || !lead) {
    return new Response("Lead not found.", { status: 404 });
  }

  const consultationStart = new Date();
  consultationStart.setDate(consultationStart.getDate() + 1);
  consultationStart.setHours(10, 0, 0, 0);

  const outcome = await persistConversationOutcome({
    leadId,
    brokerId: lead.broker_id,
    transcript,
    scheduledAt: consultationStart.toISOString()
  });

  await supabase.from("lead_events").insert({
    lead_id: leadId,
    event_type: "call_transcription_received",
    payload: {
      recording_url: recordingUrl,
      scheduled_at: consultationStart.toISOString(),
      qualification_score: outcome.qualificationScore
    }
  });

  return new Response("OK", { status: 200 });
}
