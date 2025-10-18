export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      brokers: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          phone: string | null;
          company: string | null;
          timezone: string | null;
          calendar_id: string | null;
          preferences: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          phone?: string | null;
          company?: string | null;
          timezone?: string | null;
          calendar_id?: string | null;
          preferences?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          phone?: string | null;
          company?: string | null;
          timezone?: string | null;
          calendar_id?: string | null;
          preferences?: Json | null;
          created_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          broker_id: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          status:
            | "new"
            | "contacted"
            | "qualified"
            | "booked"
            | "closed"
            | "unresponsive";
          source: string | null;
          intent_score: number | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          broker_id: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          status?:
            | "new"
            | "contacted"
            | "qualified"
            | "booked"
            | "closed"
            | "unresponsive";
          source?: string | null;
          intent_score?: number | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          broker_id?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          status?:
            | "new"
            | "contacted"
            | "qualified"
            | "booked"
            | "closed"
            | "unresponsive";
          source?: string | null;
          intent_score?: number | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          broker_id: string;
          lead_id: string;
          scheduled_at: string;
          meeting_link: string | null;
          status: "pending" | "confirmed" | "cancelled";
          created_at: string;
        };
        Insert: {
          id?: string;
          broker_id: string;
          lead_id: string;
          scheduled_at: string;
          meeting_link?: string | null;
          status?: "pending" | "confirmed" | "cancelled";
          created_at?: string;
        };
        Update: {
          id?: string;
          broker_id?: string;
          lead_id?: string;
          scheduled_at?: string;
          meeting_link?: string | null;
          status?: "pending" | "confirmed" | "cancelled";
          created_at?: string;
        };
      };
      conversation_logs: {
        Row: {
          id: string;
          lead_id: string;
          broker_id: string;
          transcript: string;
          summary: string | null;
          qualification_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          broker_id: string;
          transcript: string;
          summary?: string | null;
          qualification_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          broker_id?: string;
          transcript?: string;
          summary?: string | null;
          qualification_score?: number | null;
          created_at?: string;
        };
      };
      lead_events: {
        Row: {
          id: string;
          lead_id: string;
          event_type: string;
          payload: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          event_type: string;
          payload?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          event_type?: string;
          payload?: Json | null;
          created_at?: string;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
