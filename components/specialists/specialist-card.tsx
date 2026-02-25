import Link from "next/link";
import { Star } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EXPERIENCE_LEVEL_LABELS } from "@/lib/constants";
import { formatPercent, formatUzs } from "@/lib/formatters";
import type { SpecialistCardData } from "@/types";

type SpecialistCardProps = {
  specialist: SpecialistCardData;
};

export function SpecialistCard({ specialist }: SpecialistCardProps) {
  const avgCtr =
    specialist.portfolioNatijalar.length > 0
      ? specialist.portfolioNatijalar.reduce((acc, item) => acc + item.ctr, 0) /
        specialist.portfolioNatijalar.length
      : 0;
  const avgRoi =
    specialist.portfolioNatijalar.length > 0
      ? specialist.portfolioNatijalar.reduce((acc, item) => acc + item.roi, 0) /
        specialist.portfolioNatijalar.length
      : 0;

  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{specialist.ism}</h3>
            <p className="text-sm text-emerald-300">@{specialist.username}</p>
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2 py-1 text-xs text-slate-200">
            {EXPERIENCE_LEVEL_LABELS[specialist.tajribaDarajasi]}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-slate-300">{specialist.bio}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">O'rtacha CTR</p>
          <p className="mt-1 font-semibold text-white">{formatPercent(avgCtr)}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">O'rtacha ROI</p>
          <p className="mt-1 font-semibold text-white">{avgRoi.toFixed(1)}x</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {specialist.skills.map((skill) => (
          <span key={skill} className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-200">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Soatlik narx</p>
          <p className="text-sm font-semibold text-white">
            {specialist.hourlyRate ? formatUzs(specialist.hourlyRate) : "Kelishiladi"}
          </p>
          <p className="text-xs text-slate-500">
            Loyiha: {specialist.projectRate ? formatUzs(specialist.projectRate) : "Kelishiladi"}
          </p>
        </div>
        <div className="text-right">
          <p className="inline-flex items-center gap-1 text-sm font-semibold text-amber-300">
            <Star className="size-4 fill-amber-300 text-amber-300" />
            {specialist.rating.toFixed(1)}
          </p>
          <p className="text-xs text-slate-500">{specialist.reviewsCount} ta sharh</p>
        </div>
      </div>

      <Link
        href={`/profil/${specialist.username}`}
        className="mt-2 inline-flex items-center justify-center rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
      >
        Buyurtma berish
      </Link>
    </Card>
  );
}
