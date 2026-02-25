import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { releaseEscrowPayment } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { releasePaymentSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Tizimga kirish talab etiladi." }, { status: 401 });
  }

  const body = await request.json();
  const payload = releasePaymentSchema.safeParse(body);
  if (!payload.success) {
    return NextResponse.json(
      {
        message: payload.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri.",
      },
      { status: 400 },
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: payload.data.orderId },
    select: { clientId: true, specialistId: true, status: true },
  });

  if (!order) {
    return NextResponse.json({ message: "Buyurtma topilmadi." }, { status: 404 });
  }

  const canAccess =
    session.user.role === "ADMIN" ||
    order.clientId === session.user.id ||
    order.specialistId === session.user.id;
  if (!canAccess) {
    return NextResponse.json({ message: "Ushbu buyurtma uchun ruxsat yo'q." }, { status: 403 });
  }

  if (order.status !== "YAKUNLANDI") {
    return NextResponse.json(
      { message: "Escrowni yechishdan oldin buyurtma yakunlangan bo'lishi kerak." },
      { status: 400 },
    );
  }

  try {
    const result = await releaseEscrowPayment({ orderId: payload.data.orderId });
    return NextResponse.json({
      message: "Escrow mablag'i mutaxassis hamyoniga o'tkazildi.",
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Escrow yechishda xatolik yuz berdi.",
      },
      { status: 400 },
    );
  }
}
