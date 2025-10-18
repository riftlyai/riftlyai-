"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import type { Database } from "@/lib/supabase/types";

export default function SignInForm() {
  const router = useRouter();
  const supabase = useSupabaseClient<Database>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          throw error;
        }
        setMessage("Check your inbox to confirm your email address before logging in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unexpected authentication error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-white/20 bg-slate-950/60 px-3 py-2 text-base text-white shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/50"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete={isSignup ? "new-password" : "current-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-white/20 bg-slate-950/60 px-3 py-2 text-base text-white shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/50"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white shadow-md transition hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-70"
      >
        {isSubmitting ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
      </button>

      <p className="text-sm text-white/60">
        {isSignup ? "Already have an account?" : "Need an account?"}{" "}
        <button
          type="button"
          onClick={() => setIsSignup((prev) => !prev)}
          className="font-semibold text-brand-300 hover:text-brand-200"
        >
          {isSignup ? "Sign in" : "Sign up"}
        </button>
      </p>

      {message && <p className="text-sm text-brand-200">{message}</p>}
    </form>
  );
}
