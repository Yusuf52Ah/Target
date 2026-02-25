"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { updateProfileAction } from "@/actions/profile";
import { INITIAL_ACTION_STATE } from "@/actions/types";
import { Button } from "@/components/ui/button";

type ProfileUpdateFormProps = {
  defaultValues?: {
    username: string;
    bio: string;
    hourlyRate: number | null;
    projectRate: number | null;
    businessNiche: string | null;
    avatarUrl: string | null;
    skillsText: string;
  };
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Saqlanmoqda..." : "Profilni saqlash"}
    </Button>
  );
}

export function ProfileUpdateForm({ defaultValues }: ProfileUpdateFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="space-y-1">
        <label htmlFor="username" className="text-xs font-semibold text-slate-300">
          Username (havola)
        </label>
        <input
          id="username"
          name="username"
          defaultValue={defaultValues?.username}
          placeholder="masalan: sarvinoz-target"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          required
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="bio" className="text-xs font-semibold text-slate-300">
          Qisqa bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={defaultValues?.bio}
          placeholder="Mutaxassisligingiz va asosiy natijalaringizni yozing."
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          required
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="hourlyRate" className="text-xs font-semibold text-slate-300">
            Soatlik narx (so'm)
          </label>
          <input
            id="hourlyRate"
            name="hourlyRate"
            type="number"
            min={0}
            step={1000}
            defaultValue={defaultValues?.hourlyRate ?? undefined}
            placeholder="200000"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="projectRate" className="text-xs font-semibold text-slate-300">
            Loyiha narxi (so'm)
          </label>
          <input
            id="projectRate"
            name="projectRate"
            type="number"
            min={0}
            step={10000}
            defaultValue={defaultValues?.projectRate ?? undefined}
            placeholder="2500000"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
            required
          />
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="businessNiche" className="text-xs font-semibold text-slate-300">
          Asosiy biznes nisha
        </label>
        <input
          id="businessNiche"
          name="businessNiche"
          defaultValue={defaultValues?.businessNiche ?? undefined}
          placeholder="Masalan: Onlayn do'kon"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          required
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="skillsText" className="text-xs font-semibold text-slate-300">
          Ko'nikmalar (vergul bilan)
        </label>
        <input
          id="skillsText"
          name="skillsText"
          defaultValue={defaultValues?.skillsText}
          placeholder="Instagram Ads, Meta Ads, Lead Generation"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          required
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="avatarUrl" className="text-xs font-semibold text-slate-300">
          Avatar havolasi (Cloudinary)
        </label>
        <input
          id="avatarUrl"
          name="avatarUrl"
          defaultValue={defaultValues?.avatarUrl ?? undefined}
          placeholder="https://res.cloudinary.com/..."
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
        />
      </div>
      <SubmitButton />
      {state.message ? (
        <p className={`text-xs ${state.success ? "text-emerald-300" : "text-rose-300"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
