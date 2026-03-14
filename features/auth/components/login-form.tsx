"use client";

import { useState, type FormEvent } from "react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/shared/ui/button";

type LoginFormProps = {
  initialError?: string;
  callbackUrl?: string;
};

function mapAuthError(error?: string | null) {
  if (!error) {
    return "";
  }

  if (error === "AccessDenied") {
    return "Bu email ro'yxatdan o'tmagan. Avval ro'yxatdan o'ting.";
  }

  return "Kirishda xatolik yuz berdi. Qayta urinib ko'ring.";
}

export function LoginForm({ initialError, callbackUrl = "/dashboard" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [xato, setXato] = useState(mapAuthError(initialError));
  const [loading, setLoading] = useState(false);

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setXato("");

    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: callbackUrl,
    });

    if (result?.error) {
      setXato(result.error.message ?? "Kirishda xatolik yuz berdi.");
      setLoading(false);
      return;
    }

    window.location.href = callbackUrl;
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <form onSubmit={handlePasswordLogin} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-semibold text-slate-300">
            Email manzil
          </label>
          <input
            id="email"
            type="email"
            placeholder="sizningemail@domen.uz"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-xs font-semibold text-slate-300">
            Parol
          </label>
          <input
            id="password"
            type="password"
            placeholder="Parolingiz"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
            minLength={8}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Kirilmoqda..." : "Parol bilan kirish"}
        </Button>
      </form>

      {xato ? <p className="text-xs text-rose-300">{xato}</p> : null}
    </div>
  );
}
