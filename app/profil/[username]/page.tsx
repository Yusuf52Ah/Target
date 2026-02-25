import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";

import { OrderRequestForm } from "@/components/forms/order-request-form";
import { Card } from "@/components/ui/card";
import { EXPERIENCE_LEVEL_LABELS } from "@/lib/constants";
import { formatDate, formatUzs } from "@/lib/formatters";
import { getSpecialistByUsername } from "@/lib/queries";
import { getCurrentSession } from "@/lib/session";

type PageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const specialist = await getSpecialistByUsername(username);

  if (!specialist) {
    return {
      title: "Profil topilmadi",
      description: "So'ralgan mutaxassis profili mavjud emas.",
    };
  }

  return {
    title: `${specialist.ism} profili`,
    description: `${specialist.ism} - ${specialist.skills.join(", ")} bo'yicha mutaxassis. Portfolio, CTR, CPC va ROI natijalari.`,
    alternates: {
      canonical: `/profil/${specialist.username}`,
    },
  };
}

export default async function SpecialistProfilePage({ params }: PageProps) {
  const { username } = await params;
  const specialist = await getSpecialistByUsername(username);
  if (!specialist) {
    notFound();
  }

  const session = await getCurrentSession();
  const canOrder =
    Boolean(session?.user) &&
    (session?.user.role === "CLIENT" || session?.user.role === "ADMIN") &&
    session?.user.id !== specialist.userId;

  return (
    <div className="space-y-8 pb-8">
      <section className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative size-20 overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
                {specialist.avatarUrl ? (
                  <Image src={specialist.avatarUrl} alt={`${specialist.ism} avatari`} fill className="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-lg font-bold text-slate-200">
                    {specialist.ism.slice(0, 1)}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">{specialist.ism}</h1>
                <p className="text-sm text-emerald-300">@{specialist.username}</p>
                <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-0.5 text-xs text-slate-200">
                  {EXPERIENCE_LEVEL_LABELS[specialist.tajribaDarajasi]}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-right">
              <p className="inline-flex items-center gap-1 text-sm font-semibold text-amber-300">
                <Star className="size-4 fill-amber-300 text-amber-300" />
                {specialist.rating.toFixed(1)}
              </p>
              <p className="text-xs text-slate-500">{specialist.reviewsCount} ta sharh</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-300">{specialist.bio}</p>

          <div className="flex flex-wrap gap-2">
            {specialist.skills.map((skill) => (
              <span key={skill} className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200">
                {skill}
              </span>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Soatlik narx</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {specialist.hourlyRate ? formatUzs(specialist.hourlyRate) : "Kelishiladi"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Loyiha narxi</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {specialist.projectRate ? formatUzs(specialist.projectRate) : "Kelishiladi"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Buyurtma berish</h2>
          {canOrder ? (
            <OrderRequestForm specialistId={specialist.userId} />
          ) : (
            <p className="text-sm text-slate-300">
              Buyurtma yuborish uchun mijoz sifatida tizimga kiring yoki rolingizni mijozga o'zgartiring.
            </p>
          )}
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Portfolio case'lar</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {specialist.portfolios.map((portfolio) => (
            <Card key={portfolio.id} className="space-y-3">
              <div className="relative h-44 w-full overflow-hidden rounded-xl border border-slate-800">
                <Image src={portfolio.imageUrl} alt={portfolio.title} fill className="object-cover" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{portfolio.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{portfolio.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2">
                  <p className="text-xs text-slate-500">CTR</p>
                  <p className="font-semibold text-white">{portfolio.ctr?.toFixed(1) ?? "-"}%</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2">
                  <p className="text-xs text-slate-500">CPC</p>
                  <p className="font-semibold text-white">{portfolio.cpc ? formatUzs(portfolio.cpc) : "-"}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2">
                  <p className="text-xs text-slate-500">ROI</p>
                  <p className="font-semibold text-white">{portfolio.roi?.toFixed(1) ?? "-"}x</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2">
                  <p className="text-xs text-slate-500">Byudjet</p>
                  <p className="font-semibold text-white">{portfolio.budget ? formatUzs(portfolio.budget) : "-"}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">Qo'shilgan sana: {formatDate(portfolio.createdAt)}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Mijozlar sharhlari</h2>
        <div className="grid gap-3">
          {specialist.sharhlar.length === 0 ? (
            <Card>
              <p className="text-sm text-slate-300">Hozircha sharhlar mavjud emas.</p>
            </Card>
          ) : (
            specialist.sharhlar.map((review) => (
              <Card key={review.id}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{review.clientName}</p>
                  <p className="inline-flex items-center gap-1 text-sm text-amber-300">
                    <Star className="size-4 fill-amber-300 text-amber-300" />
                    {review.rating.toFixed(1)}
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-300">{review.comment}</p>
                <p className="mt-2 text-xs text-slate-500">{formatDate(review.createdAt)}</p>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
