"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import GoogleIcon from "@/public/google.png";
import GithubIcon from "@/public/github.png";

import { Button } from "@/components/ui/button";

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

  if (error === "Verification") {
    return "Kirish havolasi eskirgan yoki noto'g'ri.";
  }

  return "Kirishda xatolik yuz berdi. Qayta urinib ko'ring.";
}

export function LoginForm({ initialError, callbackUrl = "/dashboard" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [xabar, setXabar] = useState("");
  const [xato, setXato] = useState(mapAuthError(initialError));
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setXato("");
    setXabar("");

    const result = await signIn("email", {
      email,
      redirect: false,
      callbackUrl,
    });

    if (!result || result.error) {
      setXato(mapAuthError(result?.error));
      setLoading(false);
      return;
    }

    setXabar("Email yuborildi. Pochta qutingizdagi havola orqali kirishingiz mumkin.");
    setLoading(false);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <form onSubmit={handleEmailLogin} className="space-y-3">
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
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Yuborilmoqda..." : "Email orqali kirish"}
        </Button>
      </form>

      <div className="relative py-1 text-center text-xs text-slate-500">
        <span className="bg-slate-900 px-2">yoki</span>
      </div>

      <Button type="button" variant="secondary" className="w-full" onClick={() => signIn("google", { callbackUrl })}>
        <Image src={GoogleIcon} alt="Google" width={16} height={16} className="mr-2 inline h-4 w-4" />
        Google orqali kirish
      </Button>

      <Button variant="secondary" type="button" className="w-full" onClick={() => signIn("github", { callbackUrl })}>
        <Image src={GithubIcon} alt="GitHub" width={16} height={16} className="mr-2 inline h-4 w-4" />
        GitHub orqali kirish
      </Button>

      {xabar ? <p className="text-xs text-emerald-300">{xabar}</p> : null}
      {xato ? <p className="text-xs text-rose-300">{xato}</p> : null}
    </div>
  );
}
