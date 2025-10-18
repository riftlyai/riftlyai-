"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export async function updateIntegrationSettings(formData: FormData) {
  const supabase = createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("You must be signed in to update settings.");
  }

  const company = formData.get("company")?.toString() ?? null;
  const phone = formData.get("phone")?.toString() ?? null;
  const timezone = formData.get("timezone")?.toString() ?? null;
  const calendarId = formData.get("calendar_id")?.toString() ?? null;
  const twilioNumber = formData.get("twilio_number")?.toString() ?? null;
  const whatsappNumber = formData.get("whatsapp_number")?.toString() ?? null;

  await supabase
    .from("brokers")
    .upsert(
      {
        id: session.user.id,
        email: session.user.email ?? "",
        company,
        phone,
        timezone,
        calendar_id: calendarId,
        preferences: {
          twilio_number: twilioNumber,
          whatsapp_number: whatsappNumber
        }
      },
      { onConflict: "id" }
    );

  revalidatePath("/settings/integrations");

  return { success: true };
}
