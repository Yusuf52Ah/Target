import type { Metadata } from "next";

import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = {
  title: "Ro'yxatdan o'tish",
  description: "Mijoz yoki target mutaxassisi sifatida platformaga ro'yxatdan o'tish sahifasi.",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-md py-8">
      <div className="mb-5 space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-white">Yangi hisob ochish</h1>
        <p className="text-sm text-slate-300">
          Mijoz bo'lsangiz buyurtma berasiz, mutaxassis bo'lsangiz portfolio va case natijalarini joylaysiz.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
