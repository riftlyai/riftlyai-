import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getServerEnv } from "@/lib/env";
import { generateQualificationQuestions } from "@/lib/integrations/openai";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const leadId = url.searchParams.get("leadId");
  const questionIndex = Number.parseInt(url.searchParams.get("q") ?? "0", 10);

  if (!leadId) {
    return NextResponse.json({ error: "Missing leadId." }, { status: 400 });
  }

  const formData = await request.formData();
  const response = formData.get("SpeechResult")?.toString() ?? "";
  const confidence = Number.parseFloat(formData.get("Confidence")?.toString() ?? "0");

  const supabase = createServiceRoleClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("id, metadata, first_name, last_name, broker:brokers(name, email)")
    .eq("id", leadId)
    .single();

  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  const { data: qualificationEvent } = await supabase
    .from("lead_events")
    .select("id, payload, created_at")
    .eq("lead_id", leadId)
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
      lead_id: leadId,
      event_type: "qualification_started",
      payload: {
        channel: "voice",
        question_count: questions.length,
        questions
      }
    });
  }

  if (response) {
    await supabase.from("lead_events").insert({
      lead_id: leadId,
      event_type: "qualification_response",
      payload: {
        question_index: questionIndex,
        question: questions[questionIndex] ?? null,
        answer: response,
        confidence
      }
    });
  }

  const nextIndex = questionIndex + 1;
  const env = getServerEnv();
  const baseUrl = env.PUBLIC_APP_URL ?? "https://example.com";

  if (nextIndex >= questions.length) {
    const brokerName = lead.broker?.name ?? lead.broker?.email ?? "your advisor";

    const closingTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Thanks for your answers. ${brokerName} will review them and confirm your consultation shortly.</Say>
  <Hangup />
</Response>`;

    await supabase
      .from("leads")
      .update({ status: "contacted" })
      .eq("id", leadId);

    return new Response(closingTwiml, {
      headers: { "Content-Type": "text/xml" }
    });
  }

  const gatherAction = `${baseUrl}/api/voice/gather?leadId=${leadId}&q=${nextIndex}`;
  const nextQuestionTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${gatherAction}" method="POST" speechTimeout="auto" language="en-US" enhanced="true">
    <Pause length="0.5" />
    <Say voice="Polly.Joanna">Question ${nextIndex + 1}. ${questions[nextIndex]}</Say>
  </Gather>
  <Say voice="Polly.Joanna">We didn't catch that. Let's try once more.</Say>
  <Redirect method="POST">${gatherAction}</Redirect>
</Response>`;

  return new Response(nextQuestionTwiml, {
    headers: { "Content-Type": "text/xml" }
  });
}
