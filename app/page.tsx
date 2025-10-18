import { redirect } from "next/navigation";
import SignInForm from "@/components/auth/sign-in-form";
import { createServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="space-y-6">
        <span className="rounded-full border border-white/20 px-3 py-1 text-sm uppercase tracking-widest text-white/70">
          Mortgage Lead Catcher
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Engage every mortgage lead within seconds using AI voice calls or WhatsApp.
        </h1>
        <p className="text-base text-white/70 sm:text-lg">
          Riftly automates instant outreach, qualifies prospects with natural conversations, and books
          consultations directly onto your calendar.
        </p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur">
        <h2 className="mb-6 text-left text-xl font-semibold text-white">Sign in to your dashboard</h2>
        <SignInForm />
      </div>
    </main>
  );
}
