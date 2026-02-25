import type { Metadata } from "next";
import Link from "next/link";

import { PortfolioForm } from "@/components/forms/portfolio-form";
import { ProfileUpdateForm } from "@/components/forms/profile-update-form";
import { WalletTopupForm } from "@/components/forms/wallet-topup-form";
import { Card } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/constants";
import { formatNumber, formatUzs } from "@/lib/formatters";
import { getDashboardStats } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { requireAuthSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Shaxsiy kabinet",
  description: "Buyurtmalar, hamyon, daromad va profil boshqaruvi uchun shaxsiy kabinet.",
};

export default async function DashboardPage() {
  const session = await requireAuthSession();
  const stats = await getDashboardStats(session.user.id);
  const profile =
    session.user.role === "SPECIALIST" || session.user.role === "ADMIN"
      ? await prisma.profile.findUnique({
          where: { userId: session.user.id },
          select: {
            username: true,
            bio: true,
            hourlyRate: true,
            projectRate: true,
            businessNiche: true,
            avatarUrl: true,
            skills: {
              include: {
                skill: true,
              },
            },
          },
        })
      : null;

  return (
    <div className="space-y-8 pb-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h1 className="text-2xl font-semibold text-white">Shaxsiy kabinet</h1>
        <p className="mt-1 text-sm text-slate-300">
          Rolingiz: <span className="font-semibold text-emerald-300">{ROLE_LABELS[session.user.role]}</span>
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Card className="p-4">
            <p className="text-xs text-slate-500">Jami buyurtma</p>
            <p className="mt-1 text-xl font-semibold text-white">{formatNumber(stats.jamiBuyurtma)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-slate-500">Faol buyurtma</p>
            <p className="mt-1 text-xl font-semibold text-white">{formatNumber(stats.faolBuyurtma)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-slate-500">Yakunlangan buyurtma</p>
            <p className="mt-1 text-xl font-semibold text-white">{formatNumber(stats.yakunlanganBuyurtma)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-slate-500">Hamyon balansi</p>
            <p className="mt-1 text-xl font-semibold text-emerald-300">{formatUzs(stats.hamyonBalansi)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-slate-500">Jami daromad</p>
            <p className="mt-1 text-xl font-semibold text-white">{formatUzs(stats.daromad)}</p>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Hamyonni to'ldirish</h2>
          <p className="text-sm text-slate-300">
            Payme yoki Click orqali hamyonni to'ldiring. Escrow to'lovlar hamyon balansidan ushlab turiladi.
          </p>
          <WalletTopupForm />
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Tezkor havolalar</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/buyurtmalar" className="rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200">
              Buyurtmalarni boshqarish
            </Link>
            <Link href="/xabarlar" className="rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200">
              Ichki xabarlar
            </Link>
            <Link href="/mutaxassislar" className="rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200">
              Mutaxassislar katalogi
            </Link>
            {profile?.username ? (
              <Link
                href={`/profil/${profile.username}`}
                className="rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200"
              >
                Ochiq profilim
              </Link>
            ) : (
              <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-500">
                Ochiq profil hali yaratilmagan
              </div>
            )}
          </div>
        </Card>
      </section>

      {session.user.role === "SPECIALIST" || session.user.role === "ADMIN" ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Mutaxassis profili</h2>
            <p className="text-sm text-slate-300">SEO uchun username va asosiy taklif narxlarini bu yerda yangilang.</p>
            <ProfileUpdateForm
              defaultValues={
                profile
                  ? {
                      username: profile.username,
                      bio: profile.bio,
                      hourlyRate: profile.hourlyRate,
                      projectRate: profile.projectRate,
                      businessNiche: profile.businessNiche,
                      avatarUrl: profile.avatarUrl,
                      skillsText: profile.skills.map((entry) => entry.skill.name).join(", "),
                    }
                  : undefined
              }
            />
          </Card>

          <Card className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Portfolio case qo'shish</h2>
            <p className="text-sm text-slate-300">
              Rasm havolasi uchun Cloudinary’dan foydalaning. Asosiy metrikalarni (CTR/CPC/ROI/Byudjet) kiriting.
            </p>
            <PortfolioForm />
          </Card>
        </section>
      ) : null}
    </div>
  );
}
