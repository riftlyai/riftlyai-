# Riftly AI – Lead Catcher for Mortgage Brokers (MVP)

### Product Requirements Document (PRD)

**Version:** 1.0  
**Objective:** Build a minimum viable product that automatically engages new mortgage leads via phone or WhatsApp, qualifies them through a natural AI conversation, and books consultations directly into a broker’s calendar.

---

## 1\. Product Overview

**Product Name:** Riftly AI – Lead Catcher  
**Target User:** Mortgage brokers and small brokerages (1–5 advisors).  
**Primary Goal:** Increase the number of qualified consultations from existing lead sources by automating instant response and booking.

Riftly connects to lead forms, calls each new enquiry within seconds, and books qualified clients directly into the broker’s calendar — reducing lead wastage and improving conversion rates.

---

## 2\. Core Use Case

**Scenario:**

1. A potential borrower fills out a mortgage enquiry form.  
2. Riftly receives the lead data via webhook.  
3. The AI immediately calls or messages the lead.  
4. It asks short, mortgage-specific qualification questions.  
5. If the lead is suitable, Riftly books a consultation in the broker’s calendar.  
6. The broker sees all details, call summaries, and booking data in their dashboard.

---

## 3\. MVP Scope

### Included

- Lead intake via webhook.  
- Outbound AI call or WhatsApp message.  
- Natural conversation flow with 4–5 qualification questions.  
- Calendar booking (Google Calendar integration).  
- Broker dashboard with lead list, booking status, and summaries.  
- Email or WhatsApp confirmation notifications.

### Excluded (Future Versions)

- Multi-CRM integration (HubSpot, Pipedrive, GoHighLevel).  
- Multi-language or custom AI voice.  
- Advanced analytics or reporting.  
- White-label functionality.

---

## 4\. System Architecture Overview

**Frontend:**

- Framework: Next.js (React) \+ TailwindCSS  
- Auth & Database: Supabase Auth  
- Dashboard Views:  
  - Leads list  
  - Booking calendar  
  - Conversation summaries

**Backend:**

- Tech Stack: Node.js or FastAPI  
- Database: Supabase (PostgreSQL)  
- Voice Engine: ElevenLabs Realtime API (Text-to-Speech)  
- Conversation Logic: OpenAI Realtime API (Reasoning \+ Response)  
- Communication Layer: Twilio Voice & WhatsApp APIs  
- Calendar Integration: Google Calendar API

**Data Flow:**

