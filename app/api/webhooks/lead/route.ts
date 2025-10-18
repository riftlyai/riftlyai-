import { NextResponse } from "next/server";
import { handleLeadWebhook } from "@/lib/workflows/lead-intake";
import { getServerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const env = getServerEnv();

    if (env.RIFTLY_WEBHOOK_SECRET) {
      const secret = request.headers.get("x-riftly-signature");
      if (!secret || secret !== env.RIFTLY_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload = await request.json();
    const result = await handleLeadWebhook(payload);

    return NextResponse.json(
      {
        leadId: result.leadId,
        qualificationQuestions: result.qualificationQuestions
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected error while processing lead webhook."
      },
      { status: 400 }
    );
  }
}
