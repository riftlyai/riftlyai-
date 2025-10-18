import OpenAI from "openai";
import { getServerEnv } from "@/lib/env";
import type { LeadWebhookPayload } from "@/lib/types/leads";

type QualificationSummary = {
  summary: string;
  qualificationScore: number;
  recommendedNextSteps: string[];
};

let cachedClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!cachedClient) {
    const env = getServerEnv();
    cachedClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY
    });
  }

  return cachedClient;
}

export async function generateQualificationQuestions(payload: LeadWebhookPayload["lead"]) {
  const client = getOpenAIClient();

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You are an AI assistant for a mortgage brokerage. Produce a JSON array of 5 short qualification questions tailored to the borrower based on any provided context."
      },
      {
        role: "user",
        content: JSON.stringify(payload ?? {})
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "qualification_questions",
        schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "string"
              }
            }
          },
          required: ["questions"],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.output?.[0];
  if (content?.type === "output_text") {
    const parsed = JSON.parse(content.text) as { questions: string[] };
    return parsed.questions;
  }

  return [
    "What is your current goal for this mortgage or refinance?",
    "How soon are you hoping to complete the mortgage process?",
    "What is your estimated purchase price or refinance amount?",
    "Do you have a target monthly payment or budget?",
    "Have you previously worked with a broker or lender for this request?"
  ];
}

export async function summarizeConversation(transcript: string): Promise<QualificationSummary> {
  const client = getOpenAIClient();

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You are an AI sales assistant. Create a concise summary (<80 words), assign a qualification score (0-100) and list 3 recommended next steps based on the conversation transcript."
      },
      {
        role: "user",
        content: transcript
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "qualification_summary",
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            qualificationScore: { type: "number" },
            recommendedNextSteps: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["summary", "qualificationScore", "recommendedNextSteps"],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.output?.[0];
  if (content?.type !== "output_text") {
    throw new Error("Unexpected OpenAI response format while summarising conversation.");
  }

  const parsed = JSON.parse(content.text) as QualificationSummary;
  return parsed;
}

export async function composeWhatsappFollowUp(params: {
  lead: LeadWebhookPayload["lead"];
  summary: string;
  bookingLink: string;
}) {
  const client = getOpenAIClient();

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Write a short, friendly WhatsApp follow-up message confirming a meeting with a mortgage advisor."
      },
      {
        role: "user",
        content: JSON.stringify(params)
      }
    ]
  });

  const content = response.output?.[0];
  if (content?.type !== "output_text") {
    throw new Error("Failed to generate WhatsApp follow-up message.");
  }

  return content.text.trim();
}
