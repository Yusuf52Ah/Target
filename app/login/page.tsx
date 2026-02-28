import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Kirish",
  description: "Faqat ro'yxatdan o'tgan foydalanuvchilar uchun kirish sahifasi.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function resolveCallbackUrl(from?: string) {
  if (!from || !from.startsWith("/")) {
    return "/dashboard";
  }

  return from;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const authError = firstValue(query.error);
  const callbackUrl = resolveCallbackUrl(firstValue(query.from));

  return (
    <div className="mx-auto w-full max-w-md py-8">
      <div className="mb-5 space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-white">Tizimga kirish</h1>
        <p className="text-sm text-slate-300">
          Faqat ro'yxatdan o'tgan email orqali kirish mumkin. Email kiriting, bir martalik xavfsiz havola yuboramiz.
        </p>
      </div>

      <LoginForm initialError={authError} callbackUrl={callbackUrl} />

      <p className="mt-4 text-center text-xs text-slate-400">
        Hisobingiz yo'qmi?{" "}
        <Link href="/register" className="font-semibold text-emerald-300 hover:text-emerald-200">
          Ro'yxatdan o'tish
        </Link>
      </p>
    </div>
  );
}
