"use client";

import { Session, SessionContextProvider } from "@supabase/auth-helpers-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import type { ReactNode } from "react";
import type { Database } from "@/lib/supabase/types";

type SupabaseProviderProps = {
  children: ReactNode;
  session?: Session | null;
};

export default function SupabaseProvider({ children, session }: SupabaseProviderProps) {
  const [supabaseClient] = useState(() => createClientComponentClient<Database>());

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={session}>
      {children}
    </SessionContextProvider>
  );
}
