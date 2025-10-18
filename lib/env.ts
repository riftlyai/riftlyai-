import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Supabase service role key is required."),
  OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required."),
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_VOICE_ID: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().min(1, "Twilio account SID is required."),
  TWILIO_AUTH_TOKEN: z.string().min(1, "Twilio auth token is required."),
  TWILIO_WHATSAPP_NUMBER: z.string().optional(),
  TWILIO_CALLER_ID: z.string().optional(),
  GOOGLE_CLIENT_EMAIL: z.string().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_CALENDAR_ID: z.string().optional(),
  RIFTLY_WEBHOOK_SECRET: z.string().optional(),
  PUBLIC_APP_URL: z.string().optional()
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(`Invalid server environment configuration: ${parsed.error.toString()}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
