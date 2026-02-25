"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { sendMessageAction } from "@/actions/messages";
import { INITIAL_ACTION_STATE } from "@/actions/types";
import { Button } from "@/components/ui/button";

type MessageFormProps = {
  orderId: string;
  receiverId: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Yuborilmoqda..." : "Xabar yuborish"}
    </Button>
  );
}

export function MessageForm({ orderId, receiverId }: MessageFormProps) {
  const [state, formAction] = useActionState(sendMessageAction, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="receiverId" value={receiverId} />
      <div className="space-y-1">
        <label htmlFor="content" className="text-xs font-semibold text-slate-300">
          Xabaringiz
        </label>
        <textarea
          id="content"
          name="content"
          rows={3}
          placeholder="Masalan: Bugungi natija hisobotini yuborsangiz."
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
