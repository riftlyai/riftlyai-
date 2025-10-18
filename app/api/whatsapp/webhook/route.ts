import { createServiceRoleClient } from "@/lib/supabase/server";
import { generateQualificationQuestions } from "@/lib/integrations/openai";
import { persistConversationOutcome } from "@/lib/workflows/lead-intake";

function formatScheduleMessage(dateIso: string) {
  const date = new Date(dateIso);
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const from = formData.get("From")?.toString();
  const body = formData.get("Body")?.toString() ?? "";

  if (!from) {
    return new Response("Missing sender.", { status: 400 });
  }

  const phone = from.replace("whatsapp:", "");

  const supabase = createServiceRoleClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("id, broker_id, first_name, last_name, email, metadata, broker:brokers(name, email, company, timezone)")
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lead) {
    return new Response("Lead not found.", { status: 404 });
  }

  const { data: qualificationEvent } = await supabase
    .from("lead_events")
    .select("payload")
    .eq("lead_id", lead.id)
    .eq("event_type", "qualification_started")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let questions =
    (qualificationEvent?.payload as null | { questions?: string[] })?.questions ??
    (qualificationEvent?.payload as null | { question_list?: string[] })?.question_list;

  if (!questions || questions.length === 0) {
    questions = await generateQualificationQuestions({
      first_name: lead.first_name ?? undefined,
      last_name: lead.last_name ?? undefined,
      metadata: (lead.metadata as Record<string, unknown> | null) ?? undefined
    });

    await supabase.from("lead_events").insert({
      lead_id: lead.id,
      event_type: "qualification_started",
      payload: {
        channel: "whatsapp",
        question_count: questions.length,
        questions
      }
    });
  }

  const { data: priorResponses } = await supabase
    .from("lead_events")
    .select("id")
    .eq("lead_id", lead.id)
    .eq("event_type", "qualification_response")
    .contains("payload", { channel: "whatsapp" });

  const currentIndex = priorResponses?.length ?? 0;

  if (body.trim().length > 0) {
    await supabase.from("lead_events").insert({
      lead_id: lead.id,
      event_type: "qualification_response",
      payload: {
        channel: "whatsapp",
        question_index: currentIndex,
        question: questions[currentIndex] ?? null,
        answer: body
      }
    });
  }

  const nextIndex = currentIndex + 1;

  if (nextIndex < questions.length) {
    const nextQuestion = questions[nextIndex];
    const responseTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thanks! Question ${nextIndex + 1}: ${nextQuestion}</Message>
</Response>`;

    return new Response(responseTwiml, {
      headers: { "Content-Type": "text/xml" }
    });
  }

  const { data: allResponses } = await supabase
    .from("lead_events")
    .select("payload")
    .eq("lead_id", lead.id)
    .eq("event_type", "qualification_response")
    .contains("payload", { channel: "whatsapp" })
    .order("created_at", { ascending: true });

  const transcript = allResponses
    ?.map((event, index) => {
      const payload = event.payload as {
        question?: string;
        answer?: string;
      };

      return `Question ${index + 1}: ${payload.question ?? "N/A"}\nLead: ${payload.answer ?? ""}`;
    })
    .join("\n---\n");

  const consultationStart = new Date();
  consultationStart.setDate(consultationStart.getDate() + 1);
  consultationStart.setHours(10, 0, 0, 0);

  const outcome = await persistConversationOutcome({
    leadId: lead.id,
    brokerId: lead.broker_id,
    transcript: transcript ?? body,
    scheduledAt: consultationStart.toISOString()
  });

  const confirmationTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>
Thank you! I've shared your answers with ${lead.broker?.name ?? "your advisor"}.
Your consultation is pencilled for ${formatScheduleMessage(consultationStart.toISOString())}.
We'll send a calendar invite and confirmation shortly. Score: ${outcome.qualificationScore}.
  </Message>
</Response>`;

  return new Response(confirmationTwiml, {
    headers: { "Content-Type": "text/xml" }
  });
}
