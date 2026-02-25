"use server";

import { INITIAL_ACTION_STATE, type ActionState } from "@/actions/types";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { registerSchema } from "@/lib/validations";

async function createUniqueUsername(baseName: string) {
  const base = slugify(baseName) || "mutaxassis";
  let username = base;
  let counter = 1;

  // Ensure unique profile URL.
  while (await prisma.profile.findUnique({ where: { username }, select: { id: true } })) {
    username = `${base}-${counter}`;
    counter += 1;
  }

  return username;
}

export async function registerAction(
  prevState: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void prevState;

  try {
    const payload = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
    });

    if (!payload.success) {
      return {
        success: false,
        message: payload.error.issues[0]?.message ?? "Ro'yxatdan o'tish ma'lumotlari noto'g'ri.",
      };
    }

    const email = payload.data.email.toLowerCase();

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: payload.data.name,
        role: payload.data.role,
      },
      create: {
        email,
        name: payload.data.name,
        role: payload.data.role,
      },
    });

    await prisma.wallet.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
      },
    });

    if (payload.data.role === "SPECIALIST") {
      const existingProfile = await prisma.profile.findUnique({ where: { userId: user.id } });
      if (!existingProfile) {
        const username = await createUniqueUsername(payload.data.name);
        await prisma.profile.create({
          data: {
            userId: user.id,
            username,
            bio: "Instagram va Meta Ads bo'yicha natijaga yo'naltirilgan mutaxassis.",
            businessNiche: "Lokal biznes",
          },
        });
      }
    }

    return {
      success: true,
      message: "Ro'yxatdan o'tdingiz. Endi login sahifasida email orqali kirishingiz mumkin.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Ro'yxatdan o'tishda tizim xatosi yuz berdi." };
  }
}
