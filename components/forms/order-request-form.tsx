"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createOrderAction } from "@/actions/orders";
import { INITIAL_ACTION_STATE } from "@/actions/types";
import { Button } from "@/components/ui/button";

type OrderRequestFormProps = {
  specialistId: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Yuborilmoqda..." : "Buyurtma berish"}
    </Button>
  );
}

export function OrderRequestForm({ specialistId }: OrderRequestFormProps) {
  const [state, formAction] = useActionState(createOrderAction, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <input type="hidden" name="specialistId" value={specialistId} />
      <div className="space-y-1">
        <label htmlFor="title" className="text-xs font-semibold text-slate-300">
          Loyiha nomi
        </label>
        <input
          id="title"
          name="title"
          placeholder="Masalan: Onlayn do'kon uchun lead kampaniya"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          required
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="description" className="text-xs font-semibold text-slate-300">
          Loyiha tavsifi
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Maqsad, auditoriya, muddat va kutilyotgan natijani yozing."
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
          min={100000}
          step={10000}
          placeholder="Masalan: 3000000"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          required
        />
      </div>
      <SubmitButton />
      {state.message ? (
        <p className={`text-xs ${state.success ? "text-emerald-300" : "text-rose-300"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
