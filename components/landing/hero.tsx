"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { formatNumber } from "@/lib/formatters";

type HeroProps = {
  specialistsCount: number;
  avgRoi: number;
  completedOrders: number;
};

export function Hero({ specialistsCount, avgRoi, completedOrders }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/65 px-6 py-10 md:px-10 md:py-14">
      <div className="pointer-events-none absolute -left-10 top-10 size-44 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 bottom-2 size-44 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div className="space-y-5">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300"
          >
            O'zbekiston bozori uchun maxsus
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl"
          >
            Instagram va Meta Ads bo'yicha natija beradigan mutaxassislarni toping.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base"
          >
            Case raqamlari, aniq CTR/CPC/ROI metrikalari va escrow to'lov orqali xavfsiz hamkorlik qiling.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              href="/mutaxassislar"
              className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
            >
              Mutaxassis topish
            </Link>
            <Link
              href="/register"
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              Mutaxassis sifatida qo'shilish
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14 }}
          className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
        >
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Mutaxassislar soni</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(specialistsCount)}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">O'rtacha ROI</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">{avgRoi.toFixed(1)}x</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Yakunlangan buyurtmalar</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(completedOrders)}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
