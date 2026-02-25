import type { Metadata } from "next";

import { Card } from "@/components/ui/card";
import { formatNumber, formatUzs } from "@/lib/formatters";
import { getAdminStats } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = {
  title: "Boshqaruv paneli",
  description: "Platforma statistikasi, escrow holati va komissiya nazorati.",
};

export default async function AdminPage() {
  await requireRole("ADMIN");
  const stats = await getAdminStats();

  const [latestOrders, latestTransactions] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        client: true,
        specialist: true,
      },
    }).catch(() => []),
    prisma.transaction.findMany({
      where: { type: "KOMISSIYA" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }).catch(() => []),
  ]);

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h1 className="text-2xl font-semibold text-white">Boshqaruv paneli</h1>
        <p className="mt-1 text-sm text-slate-300">
          Foydalanuvchilar, buyurtmalar, escrow balanslari va platforma komissiyasini real vaqtga yaqin kuzatish.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="p-4">
          <p className="text-xs text-slate-500">Jami foydalanuvchi</p>
          <p className="mt-1 text-xl font-semibold text-white">{formatNumber(stats.usersCount)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Mutaxassislar</p>
          <p className="mt-1 text-xl font-semibold text-white">{formatNumber(stats.specialistsCount)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Jami buyurtmalar</p>
          <p className="mt-1 text-xl font-semibold text-white">{formatNumber(stats.ordersCount)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Escrowdagi summa</p>
          <p className="mt-1 text-xl font-semibold text-amber-300">{formatUzs(stats.escrowTotal)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Platforma komissiyasi</p>
          <p className="mt-1 text-xl font-semibold text-emerald-300">{formatUzs(stats.platformRevenue)}</p>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-white">So'nggi buyurtmalar</h2>
          {latestOrders.length === 0 ? (
            <p className="text-sm text-slate-400">Ma'lumot mavjud emas.</p>
          ) : (
            <div className="space-y-2">
              {latestOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm">
                  <p className="font-semibold text-white">{order.title}</p>
                  <p className="text-xs text-slate-400">
                    Mijoz: {order.client.name ?? order.client.email} | Mutaxassis:{" "}
                    {order.specialist.name ?? order.specialist.email}
                  </p>
                  <p className="text-xs text-slate-500">Holat: {order.status}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-white">So'nggi komissiya tranzaksiyalari</h2>
          {latestTransactions.length === 0 ? (
            <p className="text-sm text-slate-400">Hozircha komissiya tranzaksiyasi yo'q.</p>
          ) : (
            <div className="space-y-2">
              {latestTransactions.map((transaction) => (
                <div key={transaction.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm">
                  <p className="font-semibold text-emerald-300">{formatUzs(Number(transaction.amount))}</p>
                  <p className="text-xs text-slate-500">
                    To'lov tizimi: {transaction.provider ?? "Noma'lum"} | Holat: {transaction.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
