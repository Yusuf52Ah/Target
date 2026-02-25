import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { PLATFORM_COMMISSION_DEFAULT } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { orderCreateSchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Tizimga kirish talab etiladi." }, { status: 401 });
  }

  const where =
    session.user.role === "ADMIN"
      ? {}
      : {
          OR: [{ clientId: session.user.id }, { specialistId: session.user.id }],
        };

  const orders = await prisma.order.findMany({
    where,
    include: {
      client: true,
      specialist: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return NextResponse.json({ data: orders });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Tizimga kirish talab etiladi." }, { status: 401 });
  }

  if (session.user.role !== "CLIENT") {
    return NextResponse.json({ message: "Faqat mijoz buyurtma bera oladi." }, { status: 403 });
  }

  const body = await request.json();
  const payload = orderCreateSchema.safeParse(body);
  if (!payload.success) {
    return NextResponse.json(
      {
        message: payload.error.issues[0]?.message ?? "Ma'lumotlar tekshiruvdan o'tmadi.",
      },
      { status: 400 },
    );
  }

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
}
