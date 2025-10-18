# Riftly AI – Lead Catcher MVP

A Next.js + Supabase application that captures inbound mortgage leads, engages them via AI-driven voice calls or WhatsApp, qualifies prospects, and books consultations directly into a broker's calendar.

## Tech stack

- Next.js 14 (App Router, TypeScript, TailwindCSS)
- Supabase (auth, PostgreSQL, row-level security)
- OpenAI Responses API for conversation logic
- ElevenLabs Realtime/Text-to-Speech for voice prompts
- Twilio Voice & WhatsApp APIs for outreach
- Google Calendar API for scheduling

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create environment variables** – copy `.env.example` to `.env.local` and fill in the values described below.
3. **Provision Supabase schema** – run the SQL in `supabase/migrations/0001_initial.sql` inside your Supabase project.
4. **Start the app**
   ```bash
   npm run dev
   ```

## Environment variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_ANON_KEY` | Supabase anon key for client calls. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server-side workflows (never expose to browser). |
| `OPENAI_API_KEY` | Used to generate qualification questions, summaries, and WhatsApp copy. |
| `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID` | Optional if you plan to synthesise voice prompts. |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | Auth credentials for Voice & WhatsApp APIs. |
| `TWILIO_CALLER_ID` | Voice phone number registered with Twilio. |
| `TWILIO_WHATSAPP_NUMBER` | WhatsApp-enabled Twilio number. |
| `GOOGLE_CLIENT_EMAIL` / `GOOGLE_PRIVATE_KEY` | Service account used for calendar bookings. |
| `GOOGLE_CALENDAR_ID` | Calendar where meetings should be created. |
| `RIFTLY_WEBHOOK_SECRET` | Optional shared secret for inbound lead webhooks. |
| `PUBLIC_APP_URL` | Public URL of this app (used by Twilio callback URLs). |

## Supabase configuration

- Enable email+password authentication in Supabase Auth.
- Execute the SQL migration to create `brokers`, `leads`, `bookings`, `conversation_logs`, and `lead_events` tables with RLS policies.
- Each authenticated user should have a matching `brokers` row (the app upserts profile data via the Integrations page).

## Twilio setup

- Purchase or verify a **voice-capable** number and enable WhatsApp on a number.
- Point the **Voice** webhook to `POST {PUBLIC_APP_URL}/api/voice/twiml?leadId={lead_id}`.
- Point the **Voice status callback** to `{PUBLIC_APP_URL}/api/voice/transcription?leadId={lead_id}`.
- Point the **WhatsApp inbound** webhook to `POST {PUBLIC_APP_URL}/api/whatsapp/webhook`.

## Google Calendar

- Create a service account and share the destination calendar with its client email.
- Use the service account credentials in environment variables.
- Set `GOOGLE_CALENDAR_ID` to either `primary` or the specific calendar ID.

## Lead intake webhook

Send `POST` requests to `/api/webhooks/lead` with JSON payloads shaped like:

```json
{
  "broker_id": "{supabase-auth-user-id}",
  "source": "Facebook Ads",
  "contact_channel": "whatsapp",
  "lead": {
    "first_name": "Jamie",
    "last_name": "Doe",
    "email": "jamie@example.com",
    "phone": "+441234567890",
    "metadata": { "loanAmount": 350000 }
  }
}
```

Include the `x-riftly-signature` header if `RIFTLY_WEBHOOK_SECRET` is set. The endpoint stores the lead, triggers Twilio outreach (voice or WhatsApp), and records qualification events.

## Development workflow

- Run `npm run dev` to start Next.js locally.
- Use the Supabase dashboard or SQL editor to inspect tables.
- Configure Twilio and Google callbacks to hit your local tunnel (e.g. `ngrok`) during development.
- Review lead activity, bookings, and conversation summaries on the `/dashboard`, `/leads`, and `/bookings` pages once data flows in.

## Testing ideas

- Manually post sample lead payloads to `/api/webhooks/lead` to verify Supabase inserts and Twilio outreach.
- Use Twilio's testing tools to simulate voice and WhatsApp interactions.
- Confirm calendar events are created for booked consultations.
# RiftlyAI

This is the initial commit for the RiftlyAI project.  
More details will be added soon.
