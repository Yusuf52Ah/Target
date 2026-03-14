import type { Metadata } from "next";

import { acceptOrderAction, completeOrderAction, holdEscrowAction, rejectOrderAction } from "@/features/orders/actions/orders";
import { Card } from "@/shared/ui/card";
import { StatusBadge } from "@/features/orders/components/status-badge";
import { formatDate, formatUzs } from "@/lib/formatters";
import { getOrdersForUser } from "@/lib/queries";
import { getCurrentSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Buyurtmalar",
  description: "Buyurtma holatlari, escrow to'lovlar va yakunlash jarayonini boshqarish sahifasi.",
};

const paymentStatusLabels: Record<string, string> = {
  TOLANMAGAN: "To'lanmagan",
  ESCROWDA: "Escrowda",
  YECHILGAN: "Yechilgan",
  QAYTARILGAN: "Qaytarilgan",
};

export default async function OrdersPage() {
  const session = await getCurrentSession();
  const orders = session
    ? await getOrdersForUser(session.user.id)
    : [
        {
          id: "demo-1",
          title: "Instagram reklama kampaniyasi",
          description: "Kiyim brendi uchun 7 kunlik reklama setlari.",
          budget: 1500000,
          escrowAmount: 1350000,
          status: "KUTILMOQDA",
          paymentStatus: "TOLANMAGAN",
          commissionRate: 10,
          clientId: "demo-client",
          clientName: "Demo Mijoz",
          specialistId: "demo-specialist",
          specialistName: "Demo Mutaxassis",
          createdAt: new Date(),
          provider: "PAYME",
        },
        {
          id: "demo-2",
          title: "Lead generation kampaniya",
          description: "Telegram guruhga 300+ lead olib kelish.",
          budget: 2800000,
          escrowAmount: 2520000,
          status: "QABUL_QILINDI",
          paymentStatus: "ESCROWDA",
          commissionRate: 10,
          clientId: "demo-client",
          clientName: "Demo Mijoz",
          specialistId: "demo-specialist",
          specialistName: "Demo Mutaxassis",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          provider: "CLICK",
        },
      ];

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h1 className="text-2xl font-semibold text-white">Buyurtmalar</h1>
        <p className="mt-1 text-sm text-slate-300">
          Statuslar: <span className="text-amber-300">Kutilmoqda</span>,{" "}
          <span className="text-sky-300">Qabul qilindi</span>,{" "}
          <span className="text-emerald-300">Yakunlandi</span>.
        </p>
      </section>

      {!session ? (
        <Card>
          <p className="text-sm text-slate-300">
            Bu demo ko'rinish. To'liq boshqarish uchun login qiling.
          </p>
        </Card>
      ) : null}

      {orders.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-300">Hozircha buyurtmalar mavjud emas.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isClient = session ? session.user.id === order.clientId : false;
            const isSpecialist = session ? session.user.id === order.specialistId : false;
            const canManage = session ? session.user.role === "ADMIN" || isSpecialist : false;
            const canFinish = session ? session.user.role === "ADMIN" || isClient || isSpecialist : false;

            return (
              <Card key={order.id} className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{order.title}</h2>
                    <p className="text-sm text-slate-300">{order.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Mijoz: {order.clientName} | Mutaxassis: {order.specialistName}
                    </p>
                    <p className="text-xs text-slate-500">Yaratilgan sana: {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="space-y-2">
                    <StatusBadge status={order.status} />
                    <p className="text-xs text-slate-400">
                      To'lov: {paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                    <p className="text-xs text-slate-500">Byudjet</p>
                    <p className="text-sm font-semibold text-white">{formatUzs(order.budget)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                    <p className="text-xs text-slate-500">Escrow summa</p>
                    <p className="text-sm font-semibold text-white">{formatUzs(order.escrowAmount)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                    <p className="text-xs text-slate-500">Komissiya</p>
                    <p className="text-sm font-semibold text-white">{order.commissionRate.toFixed(0)}%</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {canManage && order.status === "KUTILMOQDA" ? (
                    <>
                      <form action={acceptOrderAction.bind(null, order.id)}>
                        <button
                          type="submit"
                          className="rounded-xl bg-sky-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-sky-300"
                        >
                          Qabul qilish
                        </button>
                      </form>
                      <form action={rejectOrderAction.bind(null, order.id)}>
                        <button
                          type="submit"
                          className="rounded-xl border border-rose-400/60 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/15"
                        >
                          Rad etish
                        </button>
                      </form>
                    </>
                  ) : null}

                  {isClient && order.paymentStatus === "TOLANMAGAN" ? (
                    <>
                      <form action={holdEscrowAction.bind(null, order.id, "PAYME")}>
                        <button
                          type="submit"
                          className="rounded-xl bg-emerald-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-300"
                        >
                          Payme orqali escrow
                        </button>
                      </form>
                      <form action={holdEscrowAction.bind(null, order.id, "CLICK")}>
                        <button
                          type="submit"
                          className="rounded-xl border border-emerald-400/70 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/15"
                        >
                          Click orqali escrow
                        </button>
                      </form>
                    </>
                  ) : null}

                  {canFinish && order.status === "QABUL_QILINDI" ? (
                    <form action={completeOrderAction.bind(null, order.id)}>
                      <button
                        type="submit"
                        className="rounded-xl border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
                      >
                        Buyurtmani yakunlash
                      </button>
                    </form>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
