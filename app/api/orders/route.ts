import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { PLATFORM_COMMISSION_DEFAULT } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { getCurrentSession } from "@/lib/session";
import { orderCreateSchema } from "@/lib/validations";

export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Tizimga kirish talab etiladi." }, { status: 401 });
  }

  const where =
    session.user.role === "ADMIN"
      ? {}
      : {
          OR: [{ clientId: session.user.id }, { specialistId: session.user.id }],
        };

  try {
    const orders = await prisma.order.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        specialist: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({ data: orders });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ message: "Buyurtmalarni olishda xatolik yuz berdi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Tizimga kirish talab etiladi." }, { status: 401 });
  }

  if (session.user.role !== "CLIENT") {
    return NextResponse.json({ message: "Faqat mijoz buyurtma bera oladi." }, { status: 403 });
  }

  const rateKey = getRateLimitKey(request, "api:orders:create", session.user.id);
  const rateState = checkRateLimit(rateKey, { windowMs: 60_000, maxRequests: 20 });
  if (!rateState.allowed) {
    return NextResponse.json(
      { message: "Juda ko'p so'rov yuborildi. Birozdan keyin qayta urinib ko'ring." },
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

  const payload = orderCreateSchema.safeParse(body);
  if (!payload.success) {
    return NextResponse.json(
      {
        message: payload.error.issues[0]?.message ?? "Ma'lumotlar tekshiruvdan o'tmadi.",
      },
      { status: 400 },
    );
  }

  if (payload.data.specialistId === session.user.id) {
    return NextResponse.json({ message: "O'zingizga buyurtma bera olmaysiz." }, { status: 400 });
  }

  const specialist = await prisma.user.findUnique({
    where: { id: payload.data.specialistId },
    select: { id: true, role: true },
  });

  if (!specialist || (specialist.role !== "SPECIALIST" && specialist.role !== "ADMIN")) {
    return NextResponse.json({ message: "Tanlangan foydalanuvchi mutaxassis emas yoki topilmadi." }, { status: 404 });
  }

  try {
    const order = await prisma.order.create({
      data: {
        clientId: session.user.id,
        specialistId: payload.data.specialistId,
        title: payload.data.title,
        description: payload.data.description,
        budget: new Prisma.Decimal(payload.data.budget),
        commissionRate: new Prisma.Decimal(PLATFORM_COMMISSION_DEFAULT),
        status: "KUTILMOQDA",
        paymentStatus: "TOLANMAGAN",
      },
    });

    return NextResponse.json({
      message: "Buyurtma muvaffaqiyatli yaratildi.",
      data: order,
    });
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json({ message: "Buyurtma yaratishda xatolik yuz berdi." }, { status: 500 });
  }
}
