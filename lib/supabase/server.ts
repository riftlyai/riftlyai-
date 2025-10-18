import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import {
  createRouteHandlerClient,
  createServerComponentClient
} from "@supabase/auth-helpers-nextjs";
import type { Database } from "./types";

export function createServerClient() {
  return createServerComponentClient<Database>({ cookies });
}

export function createRouteClient() {
  return createRouteHandlerClient<Database>({ cookies });
}

export function createServiceRoleClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  }

  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
