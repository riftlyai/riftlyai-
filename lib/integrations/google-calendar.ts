import { google } from "googleapis";
import { getServerEnv } from "@/lib/env";

type CreateCalendarEventInput = {
  startTime: string;
  endTime: string;
  summary: string;
  description?: string;
  attendees?: { email: string; displayName?: string }[];
  location?: string;
};

function getCalendar() {
  const env = getServerEnv();

  if (!env.GOOGLE_CLIENT_EMAIL || !env.GOOGLE_PRIVATE_KEY || !env.GOOGLE_CALENDAR_ID) {
    throw new Error("Google Calendar credentials are not fully configured.");
  }

  const jwt = new google.auth.JWT({
    email: env.GOOGLE_CLIENT_EMAIL,
    key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"]
  });

  return google.calendar({ version: "v3", auth: jwt });
}

export async function createCalendarEvent(input: CreateCalendarEventInput) {
  const env = getServerEnv();
  const calendar = getCalendar();

  const response = await calendar.events.insert({
    calendarId: env.GOOGLE_CALENDAR_ID,
    requestBody: {
      summary: input.summary,
      description: input.description,
      start: {
        dateTime: input.startTime
      },
      end: {
        dateTime: input.endTime
      },
      attendees: input.attendees,
      location: input.location,
      reminders: {
        useDefault: true
      },
      conferenceData: {
        createRequest: {
          requestId: `riftly-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" }
        }
      }
    },
    conferenceDataVersion: 1
  });

  return response.data;
}
