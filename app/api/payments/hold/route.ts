import { NextResponse } from "next/server";

import { holdEscrowPayment } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { getCurrentSession } from "@/lib/session";
import { holdPaymentSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Tizimga kirish talab etiladi." }, { status: 401 });
  }

  if (session.user.role !== "CLIENT" && session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Ushbu amal uchun ruxsat yo'q." }, { status: 403 });
  }

  const rateKey = getRateLimitKey(request, "api:payments:hold", session.user.id);
  const rateState = checkRateLimit(rateKey, { windowMs: 60_000, maxRequests: 15 });
  if (!rateState.allowed) {
    return NextResponse.json(
      { message: "So'rovlar soni juda ko'p. Bir ozdan keyin qayta urinib ko'ring." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateState.retryAfterSeconds),
        },
      },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ message: "So'rov formati JSON bo'lishi kerak." }, { status: 400 });
  }

  const payload = holdPaymentSchema.safeParse(body);
  if (!payload.success) {
    return NextResponse.json(
      {
        message: payload.error.issues[0]?.message ?? "To'lov ma'lumoti noto'g'ri.",
      },
      { status: 400 },
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: payload.data.orderId },
    select: { clientId: true },
  });
  if (!order) {
    return NextResponse.json({ message: "Buyurtma topilmadi." }, { status: 404 });
  }

  const userId = session.user.id;
  if (session.user.role !== "ADMIN" && order.clientId !== userId) {
    return NextResponse.json({ message: "Bu buyurtmaga to'lov qilolmaysiz." }, { status: 403 });
  }

  try {
    const result = await holdEscrowPayment({
      orderId: payload.data.orderId,
      clientId: order.clientId,
      amount: payload.data.amount,
      provider: payload.data.provider,
    });

    return NextResponse.json({
      message: "To'lov escrow hisobida ushlab turildi.",
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Escrow to'lovida xatolik yuz berdi.",
      },
      { status: 400 },
    );
  }
}
