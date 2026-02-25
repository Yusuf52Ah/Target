"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

import { registerAction } from "@/actions/auth";
import { INITIAL_ACTION_STATE } from "@/actions/types";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="space-y-1">
        <label htmlFor="name" className="text-xs font-semibold text-slate-300">
          Ism va familiya
        </label>
        <input
          id="name"
          name="name"
          placeholder="Masalan: Anvar Turg'unov"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-xs font-semibold text-slate-300">
          Email manzil
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="sizningemail@domen.uz"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="role" className="text-xs font-semibold text-slate-300">
          Platformadagi rolingiz
        </label>
        <select
          id="role"
          name="role"
          defaultValue="CLIENT"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
        >
          <option value="CLIENT">Mijoz</option>
          <option value="SPECIALIST">Target mutaxassisi</option>
        </select>
      </div>

      <SubmitButton />

      {state.message ? (
        <p className={`text-xs ${state.success ? "text-emerald-300" : "text-rose-300"}`}>{state.message}</p>
      ) : null}

      <p className="text-xs text-slate-400">
        Hisobingiz bormi?{" "}
        <Link href="/login" className="font-semibold text-emerald-300 hover:text-emerald-200">
          Kirish
        </Link>
      </p>
    </form>
  );
}
