"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { INITIAL_ACTION_STATE, type ActionState } from "@/actions/types";
import { PLATFORM_COMMISSION_DEFAULT } from "@/lib/constants";
import { holdEscrowPayment, releaseEscrowPayment, topupWallet } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { holdPaymentSchema, orderCreateSchema, topupSchema } from "@/lib/validations";

async function requireUser() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    throw new Error("Amalni bajarish uchun tizimga kiring.");
  }
  return session.user;
}

function asDecimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

function revalidateOrderViews() {
  revalidatePath("/buyurtmalar");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

export async function createOrderAction(
  prevState: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void prevState;
  try {
    const user = await requireUser();
    if (user.role !== "CLIENT") {
      return { success: false, message: "Faqat mijoz buyurtma bera oladi." };
    }

    const payload = orderCreateSchema.safeParse({
      specialistId: formData.get("specialistId"),
      title: formData.get("title"),
      description: formData.get("description"),
      budget: formData.get("budget"),
    });

    if (!payload.success) {
      return {
        success: false,
        message: payload.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri kiritildi.",
      };
    }

    if (payload.data.specialistId === user.id) {
      return { success: false, message: "O'zingizga buyurtma bera olmaysiz." };
    }

    await prisma.order.create({
      data: {
        clientId: user.id,
        specialistId: payload.data.specialistId,
        title: payload.data.title,
        description: payload.data.description,
        budget: asDecimal(payload.data.budget),
        commissionRate: asDecimal(PLATFORM_COMMISSION_DEFAULT),
        status: "KUTILMOQDA",
        paymentStatus: "TOLANMAGAN",
      },
    });

    revalidateOrderViews();
    return { success: true, message: "Buyurtma yuborildi. Mutaxassis javobini kuting." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Buyurtma yuborishda xatolik yuz berdi." };
  }
}

export async function acceptOrderAction(orderId: string) {
  const user = await requireUser();

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error("Buyurtma topilmadi.");
  }

  if (user.role !== "ADMIN" && order.specialistId !== user.id) {
    throw new Error("Ushbu buyurtmani qabul qilish huquqiga ega emassiz.");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "QABUL_QILINDI" },
  });

  revalidateOrderViews();
}

export async function rejectOrderAction(orderId: string) {
  const user = await requireUser();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error("Buyurtma topilmadi.");
  }

  if (user.role !== "ADMIN" && order.specialistId !== user.id) {
    throw new Error("Ushbu buyurtmani rad etish huquqiga ega emassiz.");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "BEKOR_QILINDI" },
  });

  revalidateOrderViews();
}

export async function completeOrderAction(orderId: string) {
  const user = await requireUser();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error("Buyurtma topilmadi.");
  }

  const canComplete =
    user.role === "ADMIN" || order.specialistId === user.id || order.clientId === user.id;
  if (!canComplete) {
    throw new Error("Buyurtmani yakunlash huquqiga ega emassiz.");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "YAKUNLANDI",
      completedAt: new Date(),
    },
  });

  if (order.paymentStatus === "ESCROWDA") {
    await releaseEscrowPayment({ orderId });
  }

  revalidateOrderViews();
}

export async function holdEscrowAction(orderId: string, provider: "PAYME" | "CLICK") {
  const user = await requireUser();
  if (user.role !== "CLIENT" && user.role !== "ADMIN") {
    throw new Error("Escrow to'lovini faqat mijoz tasdiqlaydi.");
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error("Buyurtma topilmadi.");
  }

  const parsed = holdPaymentSchema.safeParse({
    orderId,
    amount: Number(order.budget),
    provider,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "To'lov ma'lumotlari noto'g'ri.");
  }

  await holdEscrowPayment({
    orderId,
    amount: parsed.data.amount,
    clientId: order.clientId,
    provider: parsed.data.provider,
  });

  revalidateOrderViews();
}

export async function topupWalletAction(
  prevState: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void prevState;
  try {
    const user = await requireUser();
    const parsed = topupSchema.safeParse({
      amount: formData.get("amount"),
      provider: formData.get("provider"),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Ma'lumotlar tekshiruvdan o'tmadi.",
      };
    }

    await topupWallet({
      userId: user.id,
      amount: parsed.data.amount,
      provider: parsed.data.provider,
    });

    revalidateOrderViews();
    return { success: true, message: "Hamyon muvaffaqiyatli to'ldirildi." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Hamyonni to'ldirishda xatolik yuz berdi." };
  }
}
