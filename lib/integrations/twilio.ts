import Twilio from "twilio";
import type { LeadContactPreferences } from "@/lib/types/leads";
import { getServerEnv } from "@/lib/env";

type TwilioClient = ReturnType<typeof Twilio>;

function getTwilioClient(): TwilioClient {
  const env = getServerEnv();
  return Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
}

export async function sendWhatsappMessage(toPhone: string, body: string) {
  const env = getServerEnv();
  const client = getTwilioClient();

  if (!env.TWILIO_WHATSAPP_NUMBER) {
    throw new Error("TWILIO_WHATSAPP_NUMBER is not configured.");
  }

  return client.messages.create({
    from: `whatsapp:${env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${toPhone}`,
    body
  });
}

export async function sendWhatsappIntroMessage(
  toPhone: string,
  preferences: LeadContactPreferences & { brokerName: string }
) {
  const body = `Hi ${preferences.firstName ?? "there"}, I'm ${preferences.brokerName}'s digital assistant from ${
    preferences.brokerCompany ?? "Riftly AI"
  }. Thanks for your mortgage enquiry! Can I ask a few quick questions to understand your needs?`;

  return sendWhatsappMessage(toPhone, body);
}

export async function initiateQualificationCall(params: {
  toPhone: string;
  twimlUrl: string;
  callerId?: string;
}) {
  const env = getServerEnv();
  const client = getTwilioClient();

  const fromNumber = params.callerId ?? env.TWILIO_CALLER_ID;
  if (!fromNumber) {
    throw new Error("A caller ID or TWILIO_CALLER_ID environment variable must be provided.");
  }

  return client.calls.create({
    from: fromNumber,
    to: params.toPhone,
    url: params.twimlUrl
  });
}
