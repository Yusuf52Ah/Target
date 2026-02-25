"use server";

import { revalidatePath } from "next/cache";

import { INITIAL_ACTION_STATE, type ActionState } from "@/actions/types";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { messageSchema } from "@/lib/validations";

async function requireUser() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    throw new Error("Tizimga kirish talab etiladi.");
  }
  return session.user;
}

export async function sendMessageAction(
  prevState: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void prevState;

  try {
    const user = await requireUser();
    const payload = messageSchema.safeParse({
      orderId: formData.get("orderId"),
      receiverId: formData.get("receiverId"),
      content: formData.get("content"),
    });

    if (!payload.success) {
      return {
        success: false,
        message: payload.error.issues[0]?.message ?? "Xabar ma'lumotlari noto'g'ri.",
      };
    }

    const order = await prisma.order.findUnique({
      where: { id: payload.data.orderId },
      select: {
        clientId: true,
        specialistId: true,
      },
    });

    if (!order) {
      return { success: false, message: "Buyurtma topilmadi." };
    }

    const memberIds = [order.clientId, order.specialistId];
    if (!memberIds.includes(user.id)) {
      return { success: false, message: "Bu chatga yozish huquqi yo'q." };
    }

    if (!memberIds.includes(payload.data.receiverId)) {
      return { success: false, message: "Qabul qiluvchi ushbu buyurtmaga tegishli emas." };
    }

    await prisma.message.create({
      data: {
        orderId: payload.data.orderId,
        senderId: user.id,
        receiverId: payload.data.receiverId,
        content: payload.data.content,
      },
    });

    revalidatePath("/xabarlar");
    revalidatePath("/buyurtmalar");
    return { success: true, message: "Xabar yuborildi." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Xabar yuborishda xatolik yuz berdi." };
  }
}
