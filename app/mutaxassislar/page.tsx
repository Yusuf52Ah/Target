import type { Metadata } from "next";
import Link from "next/link";

import { SpecialistCard } from "@/components/specialists/specialist-card";
import { FadeIn } from "@/components/ui/fade-in";
import { SectionTitle } from "@/components/ui/section-title";
import { NISHA_VARIANTLARI, UZ_SKILL_OPTIONS } from "@/lib/constants";
import { getSpecialists } from "@/lib/queries";
import { toSearchFilters } from "@/lib/search";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Mutaxassislar katalogi",
  description:
    "Instagram va Meta Ads bo'yicha target mutaxassislarni skill, narx, reyting, tajriba va biznes nisha bo'yicha filtrlab toping.",
};

export default async function SpecialistsPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const filters = toSearchFilters(query);
  const specialists = await getSpecialists(filters);

  return (
    <div className="space-y-8 pb-6">
      <SectionTitle
        label="Mutaxassislar"
        title="Instagram va Meta Ads target mutaxassislari"
        description="Raqamlar, case natijalari va real sharhlar asosida mutaxassis tanlang."
      />

      <form className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:grid-cols-3 xl:grid-cols-6">
        <input
          name="skill"
          placeholder="Ko'nikma bo'yicha qidirish"
          defaultValue={filters.skill}
          list="skills-list"
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
        />
        <input
          name="minPrice"
          type="number"
          min={0}
          placeholder="Min narx"
          defaultValue={filters.minPrice}
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
        />
        <input
          name="maxPrice"
          type="number"
          min={0}
          placeholder="Maks narx"
          defaultValue={filters.maxPrice}
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
        />
        <select
          name="minRating"
          defaultValue={filters.minRating?.toString() ?? ""}
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
        >
          <option value="">Reyting (hammasi)</option>
          <option value="4.5">4.5+</option>
          <option value="4">4.0+</option>
          <option value="3.5">3.5+</option>
        </select>
        <select
          name="level"
          defaultValue={filters.level ?? ""}
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
        >
          <option value="">Tajriba darajasi</option>
          <option value="BOSHLANGICH">Boshlang'ich</option>
          <option value="ORTA">O'rta</option>
          <option value="YUQORI">Yuqori</option>
          <option value="EKSPERT">Ekspert</option>
        </select>
        <input
          name="niche"
          placeholder="Biznes nisha"
          defaultValue={filters.niche}
          list="nisha-list"
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
        />
        <datalist id="nisha-list">
          {NISHA_VARIANTLARI.map((nisha) => (
            <option key={nisha} value={nisha} />
          ))}
        </datalist>
        <datalist id="skills-list">
          {UZ_SKILL_OPTIONS.map((skill) => (
            <option key={skill} value={skill} />
          ))}
        </datalist>
        <div className="flex gap-2 md:col-span-3 xl:col-span-6">
          <button type="submit" className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950">
            Filtrlash
          </button>
          <Link
            href="/mutaxassislar"
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200"
          >
            Tozalash
          </Link>
        </div>
      </form>

      {specialists.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center">
          <p className="text-sm text-slate-300">Siz tanlagan filtrga mos mutaxassis topilmadi.</p>
          <p className="mt-2 text-xs text-slate-500">Filtrlarni yumshatib qayta urinib ko'ring.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {specialists.map((specialist, index) => (
            <FadeIn key={specialist.id} delay={0.04 * index}>
              <SpecialistCard specialist={specialist} />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
