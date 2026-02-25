"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { topupWalletAction } from "@/actions/orders";
import { INITIAL_ACTION_STATE } from "@/actions/types";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Jarayon..." : "Hamyonni to'ldirish"}
    </Button>
  );
}

export function WalletTopupForm() {
  const [state, formAction] = useActionState(topupWalletAction, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="space-y-1">
        <label htmlFor="amount" className="text-xs font-semibold text-slate-300">
          Summa (so'm)
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          min={10000}
          step={10000}
          placeholder="Masalan: 500000"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="provider" className="text-xs font-semibold text-slate-300">
          To'lov tizimi
        </label>
        <select
          id="provider"
          name="provider"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
          defaultValue="PAYME"
        >
          <option value="PAYME">Payme</option>
          <option value="CLICK">Click</option>
        </select>
      </div>

      <SubmitButton />
      {state.message ? (
        <p className={`text-xs ${state.success ? "text-emerald-300" : "text-rose-300"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
