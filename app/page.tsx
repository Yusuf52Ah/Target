import type { Metadata } from "next";

import { Hero } from "@/components/landing/hero";
import { SpecialistCard } from "@/components/specialists/specialist-card";
import { FadeIn } from "@/components/ui/fade-in";
import { SectionTitle } from "@/components/ui/section-title";
import { getSpecialists } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Instagram va Meta Ads mutaxassislari",
  description:
    "O'zbekistonda Instagram va Meta Ads bo'yicha target mutaxassis toping, case natijalarini ko'ring va escrow to'lov bilan xavfsiz hamkorlik qiling.",
};

const jarayonQadamlar = [
  {
    title: "1. Mutaxassisni tanlang",
    description: "Portfolio case, CTR/CPC/ROI ko'rsatkichlari va sharhlar asosida tez tanlov qiling.",
  },
  {
    title: "2. Buyurtmani yuboring",
    description: "Loyiha maqsadi, auditoriya va byudjetni yozing. Mutaxassis qabul qilgach ish boshlanadi.",
  },
  {
    title: "3. Escrow to'lov",
    description: "Payme yoki Click orqali mablag' platformada ushlab turiladi. Xavf kamayadi.",
  },
  {
    title: "4. Ish yakuni va yechim",
    description: "Buyurtma yakunlangach, komissiya ajratilib qolgan summa mutaxassis hamyoniga o'tadi.",
  },
];

const ustunliklar = [
  "Faqat Instagram/Meta Ads yo'nalishiga ixtisoslashgan platforma",
  "O'zbekiston bozori va lokal biznes nishalariga mos mutaxassislar",
  "Raqamlarga asoslangan portfolio: CTR, CPC, ROI, byudjet",
  "Escrow va hamyon moduli bilan xavfsiz hisob-kitob",
];

export default async function Home() {
  const specialists = await getSpecialists();
  const featured = specialists.slice(0, 3);

  const avgRoi =
    specialists.length > 0
      ? specialists.reduce((acc, specialist) => {
          const specialistRoi =
            specialist.portfolioNatijalar.length > 0
              ? specialist.portfolioNatijalar.reduce((sum, item) => sum + item.roi, 0) /
                specialist.portfolioNatijalar.length
              : 0;
          return acc + specialistRoi;
        }, 0) / specialists.length
      : 0;

  const completedOrders = Math.max(12, specialists.reduce((acc, item) => acc + item.reviewsCount, 0));

  return (
    <div className="space-y-14 pb-8">
      <Hero specialistsCount={specialists.length || 120} avgRoi={avgRoi || 4.1} completedOrders={completedOrders} />

      <section className="space-y-6">
        <FadeIn>
          <SectionTitle
            label="Tanlangan mutaxassislar"
            title="Raqam bilan ishlaydigan top target mutaxassislar"
            description="Har bir profil real natija metrikalari va sharhlar bilan ko'rsatilgan."
          />
        </FadeIn>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((specialist, index) => (
            <FadeIn key={specialist.id} delay={0.05 * index}>
              <SpecialistCard specialist={specialist} />
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <FadeIn>
          <div className="space-y-4">
            <SectionTitle
              label="Ishlash jarayoni"
              title="MVP ichidagi to'liq buyurtma oqimi"
              description="Mijoz va mutaxassis o'rtasida xavfsiz hamkorlik uchun optimallashtirilgan."
            />
            <div className="grid gap-3">
              {jarayonQadamlar.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.12}>
          <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="text-lg font-semibold text-white">Nega aynan TargetUZ?</h3>
            <ul className="mt-4 space-y-3">
              {ustunliklar.map((item) => (
                <li key={item} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </section>

      <section className="rounded-3xl border border-emerald-500/25 bg-emerald-500/10 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-white">Escrow + Payme/Click bilan xavfsiz to'lov</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-emerald-100/90">
          Mijoz to'lovni tasdiqlaydi, mablag' platformada ushlab turiladi, buyurtma yakunlangach mutaxassis hamyoniga
          o'tadi. Platforma komissiyasi: 10-15%.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-300/25 bg-slate-950/50 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-200/80">To'lov ushlanishi</p>
            <p className="mt-1 text-lg font-semibold text-white">Escrowda ushlash</p>
          </div>
          <div className="rounded-2xl border border-emerald-300/25 bg-slate-950/50 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-200/80">Buyurtma statusi</p>
            <p className="mt-1 text-lg font-semibold text-white">Kutilmoqda / Qabul qilindi / Yakunlandi</p>
          </div>
          <div className="rounded-2xl border border-emerald-300/25 bg-slate-950/50 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-200/80">Mablag' yechilishi</p>
            <p className="mt-1 text-lg font-semibold text-white">Komissiya ajratib o'tkazish</p>
          </div>
        </div>
      </section>
    </div>
  );
}
