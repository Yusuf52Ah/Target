import Link from "next/link";

import { SessionControls } from "@/components/auth/session-controls";

const navLinks = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/mutaxassislar", label: "Mutaxassislar" },
  { href: "/buyurtmalar", label: "Buyurtmalar" },
  { href: "/xabarlar", label: "Xabarlar" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-emerald-400 text-xs font-black text-slate-950">
            TZ
          </span>
          <span className="text-sm font-bold tracking-wide text-white">TargetUZ</span>
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <SessionControls />
      </div>
    </header>
  );
}
