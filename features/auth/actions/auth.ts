"use server";

import { INITIAL_ACTION_STATE, type ActionState } from "@/shared/types/action-state";
import { isLocalAuthMode } from "@/lib/env";
import { hashPassword } from "@/lib/local-auth";
import { createLocalAuthUser, getLocalAuthUserByEmail } from "@/lib/local-auth-store";
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

async function registerInLocalStore(input: {
  name: string;
  email: string;
  role: "CLIENT" | "SPECIALIST";
  passwordHash: string;
}): Promise<ActionState> {
  const localExisting = await getLocalAuthUserByEmail(input.email);
  if (localExisting) {
    return { success: false, message: "Bu email allaqachon ro'yxatdan o'tgan. Login qiling." };
  }

  try {
    await createLocalAuthUser(input);
    return {
      success: true,
      message: "Ro'yxatdan o'tdingiz. Endi email va parol bilan tizimga kiring.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Local ro'yxatdan o'tishda xatolik yuz berdi." };
  }
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
      password: formData.get("password"),
      role: formData.get("role"),
    });

    if (!payload.success) {
      return {
        success: false,
        message: payload.error.issues[0]?.message ?? "Ro'yxatdan o'tish ma'lumotlari noto'g'ri.",
      };
    }

    const email = payload.data.email.toLowerCase();
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (payload.data.password !== confirmPassword) {
      return { success: false, message: "Parol va parol tasdig'i mos emas." };
    }

    const passwordHash = await hashPassword(payload.data.password);

    if (isLocalAuthMode()) {
      return registerInLocalStore({
        name: payload.data.name,
        email,
        role: payload.data.role,
        passwordHash,
      });
    }

    const existingUser = await prisma.user
      .findFirst({
        where: {
          email: {
            equals: email,
            mode: "insensitive",
          },
        },
        select: { id: true },
      })
      .catch(() => null);

    if (existingUser) {
      return { success: false, message: "Bu email allaqachon ro'yxatdan o'tgan. Login qiling." };
    }

    try {
      const user = await prisma.user.create({
        data: {
          email,
          name: payload.data.name,
          role: payload.data.role,
          passwordHash,
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
        message: "Ro'yxatdan o'tdingiz. Endi email va parol bilan tizimga kiring.",
      };
    } catch (error) {
      console.error("DB register failed, fallback to local auth store:", error);
      return registerInLocalStore({
        name: payload.data.name,
        email,
        role: payload.data.role,
        passwordHash,
      });
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Ro'yxatdan o'tishda tizim xatosi yuz berdi." };
  }
}
