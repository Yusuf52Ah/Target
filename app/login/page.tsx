import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Kirish",
  description: "Email yoki Google orqali tizimga kirish sahifasi.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md py-8">
      <div className="mb-5 space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-white">Tizimga kirish</h1>
        <p className="text-sm text-slate-300">
          Email kiriting, bir martalik xavfsiz havola yuboramiz. Google orqali kirish ham mavjud.
        </p>
      </div>

      <LoginForm />

      <p className="mt-4 text-center text-xs text-slate-400">
        Hisobingiz yo'qmi?{" "}
        <Link href="/register" className="font-semibold text-emerald-300 hover:text-emerald-200">
          Ro'yxatdan o'tish
        </Link>
      </p>
    </div>
  );
}
