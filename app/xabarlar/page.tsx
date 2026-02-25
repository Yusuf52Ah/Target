import type { Metadata } from "next";
import Link from "next/link";

import { MessageForm } from "@/components/forms/message-form";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/formatters";
import { getMessagesForUser, getOrdersForUser } from "@/lib/queries";
import { requireAuthSession } from "@/lib/session";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Xabarlar",
  description: "Buyurtmalar bo'yicha ichki chat va tezkor muloqot sahifasi.",
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function MessagesPage({ searchParams }: PageProps) {
  const session = await requireAuthSession();
  const query = await searchParams;
  const orderId = firstValue(query.orderId);

  const [orders, messages] = await Promise.all([
    getOrdersForUser(session.user.id),
    getMessagesForUser(session.user.id),
  ]);

  const selectedOrder = orders.find((order) => order.id === orderId) ?? orders[0] ?? null;
  const receiverId =
    selectedOrder && selectedOrder.clientId === session.user.id
      ? selectedOrder.specialistId
      : selectedOrder?.clientId ?? "";

  const selectedMessages = selectedOrder
    ? messages
        .filter((message) => message.orderId === selectedOrder.id)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    : [];

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h1 className="text-2xl font-semibold text-white">Ichki xabarlar</h1>
        <p className="mt-1 text-sm text-slate-300">
          Har bir buyurtma uchun alohida chat ochiladi. Barcha yozishmalar platforma ichida saqlanadi.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.3fr]">
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Buyurtmalar ro'yxati</h2>
          <div className="space-y-2">
            {orders.length === 0 ? (
              <p className="text-sm text-slate-400">Suhbat ochish uchun avval buyurtma bo'lishi kerak.</p>
            ) : (
              orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/xabarlar?orderId=${order.id}`}
                  className={`block rounded-xl border px-3 py-2 text-sm ${
                    selectedOrder?.id === order.id
                      ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-100"
                      : "border-slate-700 bg-slate-950/70 text-slate-200"
                  }`}
                >
                  <p className="font-semibold">{order.title}</p>
                  <p className="text-xs text-slate-400">{order.id}</p>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Suhbat oynasi</h2>
          {!selectedOrder ? (
            <p className="text-sm text-slate-300">Xabar yozish uchun buyurtma tanlang.</p>
          ) : (
            <>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <p className="text-sm font-semibold text-white">{selectedOrder.title}</p>
                <p className="text-xs text-slate-500">
                  Mijoz: {selectedOrder.clientName} | Mutaxassis: {selectedOrder.specialistName}
                </p>
              </div>

              <div className="max-h-[360px] space-y-2 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                {selectedMessages.length === 0 ? (
                  <p className="text-sm text-slate-400">Hozircha xabarlar mavjud emas.</p>
                ) : (
                  selectedMessages.map((message) => {
                    const own = message.senderId === session.user.id;
                    return (
                      <div
                        key={message.id}
                        className={`rounded-xl border px-3 py-2 text-sm ${
                          own
                            ? "ml-auto max-w-[88%] border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                            : "mr-auto max-w-[88%] border-slate-700 bg-slate-900 text-slate-200"
                        }`}
                      >
                        <p className="text-xs font-semibold opacity-80">{message.senderName}</p>
                        <p className="mt-1">{message.content}</p>
                        <p className="mt-1 text-[11px] opacity-70">{formatDate(message.createdAt)}</p>
                      </div>
                    );
                  })
                )}
              </div>

              <MessageForm orderId={selectedOrder.id} receiverId={receiverId} />
            </>
          )}
        </Card>
      </section>
    </div>
  );
}
