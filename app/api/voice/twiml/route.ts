import { createServiceRoleClient } from "@/lib/supabase/server";
import { generateQualificationQuestions } from "@/lib/integrations/openai";
import { getServerEnv } from "@/lib/env";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const leadId = url.searchParams.get("leadId");

  if (!leadId) {
    return new Response("Missing leadId parameter.", { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, first_name, last_name, phone, metadata, broker:brokers(name, email, company)")
    .eq("id", leadId)
    .single();

  if (leadError || !lead) {
    return new Response("Lead not found.", { status: 404 });
  }

  const { data: qualificationEvent } = await supabase
    .from("lead_events")
    .select("payload")
    .eq("lead_id", leadId)
    .eq("event_type", "qualification_started")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const existingQuestions =
    (qualificationEvent?.payload as null | { questions?: string[] })?.questions ??
    (qualificationEvent?.payload as null | { question_list?: string[] })?.question_list;

  let questions = existingQuestions;

  if (!questions || questions.length === 0) {
    questions = await generateQualificationQuestions({
      first_name: lead.first_name ?? undefined,
      last_name: lead.last_name ?? undefined,
      metadata: (lead.metadata as Record<string, unknown> | null) ?? undefined
    });

    await supabase.from("lead_events").insert({
      lead_id: leadId,
      event_type: "qualification_started",
      payload: {
        channel: "voice",
        questions,
        question_count: questions.length
      }
    });
  }

  const env = getServerEnv();
  const baseUrl = env.PUBLIC_APP_URL ?? "https://example.com";
  const gatherAction = `${baseUrl}/api/voice/gather?leadId=${leadId}&q=0`;

  const brokerName = lead.broker?.name ?? lead.broker?.email ?? "your mortgage advisor";
  const leadName = lead.first_name ?? lead.last_name ?? "there";

  const greeting = `<Say voice="Polly.Joanna">Hi ${leadName}, I'm the digital assistant for ${brokerName}. Thanks for your mortgage enquiry.</Say>`;
  const instructions =
    "<Say voice=\"Polly.Joanna\">I'll ask a few quick questions so we can match you to the best advisor. You can speak naturally after each question.</Say>";

  const firstQuestion = `<Say voice="Polly.Joanna">Question 1. ${questions[0]}</Say>`;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${greeting}
  <Pause length="1" />
  ${instructions}
  <Gather input="speech" action="${gatherAction}" method="POST" speechTimeout="auto" language="en-US" enhanced="true">
    <Pause length="0.5" />
    ${firstQuestion}
  </Gather>
  <Say voice="Polly.Joanna">If you are still there, say something after the beep.</Say>
  <Record timeout="5" transcribe="true" transcribeCallback="${baseUrl}/api/voice/transcription?leadId=${leadId}" />
  <Say voice="Polly.Joanna">Thanks! ${brokerName} will be in touch shortly.</Say>
</Response>`;

  return new Response(twiml, {
    headers: {
      "Content-Type": "text/xml"
    }
  });
}
