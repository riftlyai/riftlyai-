import Link from "next/link";
import SignOutButton from "@/components/auth/sign-out-button";

type NavLink = {
  href: string;
  label: string;
};

export default function TopNav({ userEmail, links }: { userEmail: string; links: NavLink[] }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-semibold text-white">
            Riftly AI
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-white/70 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-white/60 sm:block">{userEmail}</span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
