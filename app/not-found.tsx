import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">404</p>
      <h1 className="text-3xl font-semibold text-white">Sahifa topilmadi</h1>
      <p className="max-w-md text-sm text-slate-300">
        Qidirgan sahifangiz ko'chirilgan yoki mavjud emas. Bosh sahifaga qaytib, kerakli bo'limni tanlang.
      </p>
      <Link href="/" className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950">
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
