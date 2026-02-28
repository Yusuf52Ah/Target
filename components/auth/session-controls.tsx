"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function SessionControls() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200">
          Kirish
        </Link>
        <Link href="/register" className="rounded-xl bg-emerald-400 px-3 py-2 text-xs font-bold text-slate-950">
          Ro'yxatdan o'tish
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/dashboard" className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200">
        Kabinet
      </Link>
      <Button variant="ghost" className="px-3 py-2 text-xs" onClick={() => signOut({ callbackUrl: "/login" })}>
        Chiqish
      </Button>
    </div>
  );
}
