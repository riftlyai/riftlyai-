export type ContactChannel = "voice" | "whatsapp";

export type LeadWebhookPayload = {
  broker_id: string;
  source?: string;
  contact_channel?: ContactChannel;
  lead: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    metadata?: Record<string, unknown>;
  };
};

export type LeadContactPreferences = {
  firstName?: string;
  lastName?: string;
  brokerName: string;
  brokerCompany?: string;
};
