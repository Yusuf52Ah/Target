"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { addPortfolioAction } from "@/actions/profile";
import { INITIAL_ACTION_STATE } from "@/actions/types";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Qo'shilmoqda..." : "Portfolio qo'shish"}
    </Button>
  );
}

export function PortfolioForm() {
  const [state, formAction] = useActionState(addPortfolioAction, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="space-y-1">
        <label htmlFor="title" className="text-xs font-semibold text-slate-300">
          Portfolio nomi
        </label>
        <input
          id="title"
          name="title"
          placeholder="Masalan: Lokal do'kon uchun lead oqimi"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          required
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="description" className="text-xs font-semibold text-slate-300">
          Portfolio tavsifi
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Yondashuv, kampaniya tuzilmasi va natijani kiriting."
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          required
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="imageUrl" className="text-xs font-semibold text-slate-300">
          Rasm havolasi (Cloudinary)
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          placeholder="https://res.cloudinary.com/..."
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="ctr" className="text-xs font-semibold text-slate-300">
            CTR (%)
          </label>
          <input
            id="ctr"
            name="ctr"
            type="number"
            min={0}
            max={100}
            step={0.1}
            placeholder="3.4"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="cpc" className="text-xs font-semibold text-slate-300">
            CPC (so'm)
          </label>
          <input
            id="cpc"
            name="cpc"
            type="number"
            min={0}
            step={1}
            placeholder="2200"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
            required
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="roi" className="text-xs font-semibold text-slate-300">
            ROI (x)
          </label>
          <input
            id="roi"
            name="roi"
            type="number"
            min={0}
            step={0.1}
            placeholder="4.2"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="budget" className="text-xs font-semibold text-slate-300">
            Byudjet (so'm)
          </label>
          <input
            id="budget"
            name="budget"
            type="number"
            min={10000}
            step={1000}
            placeholder="5000000"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
            required
          />
        </div>
      </div>

      <SubmitButton />
      {state.message ? (
        <p className={`text-xs ${state.success ? "text-emerald-300" : "text-rose-300"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
