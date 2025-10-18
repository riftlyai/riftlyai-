"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import type { Database } from "@/lib/supabase/types";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = useSupabaseClient<Database>();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="rounded-md border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/10 disabled:opacity-70"
    >
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
