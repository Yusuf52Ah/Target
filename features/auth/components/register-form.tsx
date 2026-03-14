"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { registerAction } from "@/features/auth/actions/auth";
import { INITIAL_ACTION_STATE } from "@/shared/types/action-state";
import { Button } from "@/shared/ui/button";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"CLIENT" | "SPECIALIST">("CLIENT");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState(INITIAL_ACTION_STATE);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setState(INITIAL_ACTION_STATE);

    if (password !== confirmPassword) {
      setState({ success: false, message: "Parol va parol tasdig'i mos emas." });
      setLoading(false);
      return;
    }

    const signUpResult = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (signUpResult?.error) {
      setState({ success: false, message: signUpResult.error.message ?? "Ro'yxatdan o'tishda xatolik yuz berdi." });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.set("name", name);
    formData.set("email", email);
    formData.set("password", password);
    formData.set("confirmPassword", confirmPassword);
    formData.set("role", role);

    const result = await registerAction(INITIAL_ACTION_STATE, formData);
    if (!result.success && !result.message?.includes("allaqachon")) {
      setState(result);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="space-y-1">
        <label htmlFor="name" className="text-xs font-semibold text-slate-300">
          Ism va familiya
        </label>
        <input
          id="name"
          name="name"
          placeholder="Masalan: Anvar Turg'unov"
          value={name}
          onChange={(event) => setName(event.target.value)}
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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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
          value={role}
          onChange={(event) => setRole(event.target.value === "SPECIALIST" ? "SPECIALIST" : "CLIENT")}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
        >
          <option value="CLIENT">Mijoz</option>
          <option value="SPECIALIST">Target mutaxassisi</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-xs font-semibold text-slate-300">
          Parol
        </label>
        <input
          id="password"
          type="password"
          name="password"
          minLength={8}
          placeholder="Kamida 8 ta belgi"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-300">
          Parol tasdig'i
        </label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          minLength={8}
          placeholder="Parolni qayta kiriting"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
      </Button>

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
