import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { generateQualificationQuestions, summarizeConversation, composeWhatsappFollowUp } from "@/lib/integrations/openai";
import { sendWhatsappIntroMessage, initiateQualificationCall, sendWhatsappMessage } from "@/lib/integrations/twilio";
import { createCalendarEvent } from "@/lib/integrations/google-calendar";
import type { LeadWebhookPayload } from "@/lib/types/leads";
import { getServerEnv } from "@/lib/env";

const leadWebhookSchema = z.object({
  broker_id: z.string().uuid(),
  source: z.string().optional(),
  contact_channel: z.enum(["voice", "whatsapp"]).default("voice"),
  lead: z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    metadata: z.record(z.unknown()).optional()
  })
});

export type LeadWorkflowResult = {
  leadId: string;
  qualificationQuestions: string[];
};

export async function handleLeadWebhook(payload: LeadWebhookPayload): Promise<LeadWorkflowResult> {
  const parsed = leadWebhookSchema.parse(payload);
  const supabase = createServiceRoleClient();

  const { data: broker, error: brokerError } = await supabase
    .from("brokers")
    .select("*")
    .eq("id", parsed.broker_id)
    .single();

  if (brokerError || !broker) {
    throw new Error("Broker record not found for incoming lead.");
  }

  const { data: insertedLead, error: insertError } = await supabase
    .from("leads")
    .insert({
      broker_id: parsed.broker_id,
      first_name: parsed.lead.first_name,
      last_name: parsed.lead.last_name,
      email: parsed.lead.email,
      phone: parsed.lead.phone,
      status: "new",
      source: parsed.source ?? "webhook",
      metadata: parsed.lead.metadata ?? null
    })
    .select()
    .single();

  if (insertError || !insertedLead) {
    throw new Error(`Failed to create lead: ${insertError?.message ?? "Unknown error"}`);
  }

  await supabase.from("lead_events").insert({
    lead_id: insertedLead.id,
    event_type: "lead_received",
    payload: parsed as unknown as Record<string, unknown>
  });

  const qualificationQuestions = await generateQualificationQuestions(parsed.lead);

  if (parsed.contact_channel === "whatsapp" && parsed.lead.phone) {
    await sendWhatsappIntroMessage(parsed.lead.phone, {
      firstName: parsed.lead.first_name ?? undefined,
      lastName: parsed.lead.last_name ?? undefined,
      brokerName: broker.name ?? broker.email,
      brokerCompany: "Riftly AI"
    });

    if (qualificationQuestions.length > 0) {
      await sendWhatsappMessage(
        parsed.lead.phone,
        `Great! Let's get started.\nQuestion 1: ${qualificationQuestions[0]}`
      );
    }
  } else if (parsed.lead.phone) {
    const env = getServerEnv();
    const baseUrl = env.PUBLIC_APP_URL ?? "https://your-domain.com";
    const twimlUrl = `${baseUrl}/api/voice/twiml?leadId=${insertedLead.id}`;
    await initiateQualificationCall({
      toPhone: parsed.lead.phone,
      twimlUrl,
      callerId: broker.phone ?? undefined
    });
  }

  await supabase.from("lead_events").insert({
    lead_id: insertedLead.id,
    event_type: "qualification_started",
    payload: {
      channel: parsed.contact_channel,
      question_count: qualificationQuestions.length,
      questions: qualificationQuestions
    }
  });

  return {
    leadId: insertedLead.id,
    qualificationQuestions
  };
}

export async function persistConversationOutcome(params: {
  leadId: string;
  brokerId: string;
  transcript: string;
  scheduledAt?: string;
  meetingLink?: string;
}) {
  const supabase = createServiceRoleClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("id, first_name, last_name, email, phone, broker:brokers(name, company, timezone, calendar_id)")
    .eq("id", params.leadId)
    .single();

  if (!lead) {
    throw new Error("Lead not found while persisting conversation outcome.");
  }

  const summary = await summarizeConversation(params.transcript);
  let scheduledMeetingLink: string | null = null;
  let savedCalendarEventId: string | null = null;

  await supabase.from("conversation_logs").insert({
    broker_id: params.brokerId,
    lead_id: params.leadId,
    transcript: params.transcript,
    summary: summary.summary,
    qualification_score: summary.qualificationScore
  });

  await supabase
    .from("leads")
    .update({
      status: summary.qualificationScore > 70 ? "qualified" : "contacted",
      intent_score: summary.qualificationScore
    })
    .eq("id", params.leadId);

  if (params.scheduledAt) {
    const startTime = params.scheduledAt;
    const endTime = new Date(new Date(startTime).getTime() + 30 * 60 * 1000).toISOString();

    const event = await createCalendarEvent({
      startTime,
      endTime,
      summary: "Mortgage consultation",
      description: summary.summary,
      attendees: lead.email
        ? [
            {
              email: lead.email,
              displayName: `${lead.first_name ?? ""} ${lead.last_name ?? ""}`.trim() || undefined
            }
          ]
        : undefined,
      location: params.meetingLink
    });

    scheduledMeetingLink = event.hangoutLink ?? params.meetingLink ?? null;
    savedCalendarEventId = event.id ?? null;

    await supabase.from("bookings").insert({
      lead_id: params.leadId,
      broker_id: params.brokerId,
      scheduled_at: startTime,
      meeting_link: scheduledMeetingLink,
      status: "confirmed"
    });

    await supabase.from("lead_events").insert({
      lead_id: params.leadId,
      event_type: "consultation_booked",
      payload: {
        calendar_event_id: savedCalendarEventId,
        summary: event.summary,
        meeting_link: scheduledMeetingLink
      }
    });

    if (lead.phone) {
      const followUpMessage = await composeWhatsappFollowUp({
        lead: {
          first_name: lead.first_name ?? undefined,
          last_name: lead.last_name ?? undefined,
          email: lead.email ?? undefined,
          phone: lead.phone ?? undefined
        },
        summary: summary.summary,
        bookingLink: scheduledMeetingLink ?? ""
      });

      await sendWhatsappMessage(lead.phone, followUpMessage);
    }
  }

  return {
    summary: summary.summary,
    qualificationScore: summary.qualificationScore,
    meetingLink: scheduledMeetingLink,
    calendarEventId: savedCalendarEventId
  };
}
