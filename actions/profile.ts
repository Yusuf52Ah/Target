"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { INITIAL_ACTION_STATE, type ActionState } from "@/actions/types";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { slugify } from "@/lib/utils";
import { profileSchema, portfolioSchema } from "@/lib/validations";

function decimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

async function requireSpecialist() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    throw new Error("Profilni tahrirlash uchun tizimga kiring.");
  }

  if (session.user.role !== "SPECIALIST" && session.user.role !== "ADMIN") {
    throw new Error("Faqat mutaxassis profilni boshqara oladi.");
  }

  return session.user;
}

export async function updateProfileAction(
  prevState: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void prevState;
  try {
    const user = await requireSpecialist();
    const payload = profileSchema.safeParse({
      username: formData.get("username"),
      bio: formData.get("bio"),
      hourlyRate: formData.get("hourlyRate"),
      projectRate: formData.get("projectRate"),
      businessNiche: formData.get("businessNiche"),
      avatarUrl: formData.get("avatarUrl"),
      skillsText: formData.get("skillsText"),
    });

    if (!payload.success) {
      return { success: false, message: payload.error.issues[0]?.message ?? "Profil ma'lumotlari noto'g'ri." };
    }

    const skills = (payload.data.skillsText ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 12);

    await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.upsert({
        where: { userId: user.id },
        update: {
          username: payload.data.username,
          bio: payload.data.bio,
          hourlyRate: payload.data.hourlyRate,
          projectRate: payload.data.projectRate,
          businessNiche: payload.data.businessNiche,
          avatarUrl: payload.data.avatarUrl || null,
        },
        create: {
          userId: user.id,
          username: payload.data.username,
          bio: payload.data.bio,
          hourlyRate: payload.data.hourlyRate,
          projectRate: payload.data.projectRate,
          businessNiche: payload.data.businessNiche,
          avatarUrl: payload.data.avatarUrl || null,
        },
      });

      await tx.specialistSkill.deleteMany({
        where: {
          profileId: profile.id,
        },
      });

      for (const skillName of skills) {
        const skill = await tx.skill.upsert({
          where: {
            slug: slugify(skillName),
          },
          update: {
            name: skillName,
          },
          create: {
            name: skillName,
            slug: slugify(skillName),
          },
        });

        await tx.specialistSkill.create({
          data: {
            profileId: profile.id,
            skillId: skill.id,
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/profil/${payload.data.username}`);
    revalidatePath("/mutaxassislar");
    return { success: true, message: "Profil ma'lumotlari saqlandi." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Profilni saqlashda xatolik yuz berdi." };
  }
}

export async function addPortfolioAction(
  prevState: ActionState = INITIAL_ACTION_STATE,
  formData: FormData,
): Promise<ActionState> {
  void prevState;
  try {
    const user = await requireSpecialist();
    const payload = portfolioSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      imageUrl: formData.get("imageUrl"),
      ctr: formData.get("ctr"),
      cpc: formData.get("cpc"),
      roi: formData.get("roi"),
      budget: formData.get("budget"),
    });

    if (!payload.success) {
      return { success: false, message: payload.error.issues[0]?.message ?? "Portfolio ma'lumotlari noto'g'ri." };
    }

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      return { success: false, message: "Avval profil ma'lumotlarini to'ldiring." };
    }

    await prisma.portfolio.create({
      data: {
        profileId: profile.id,
        title: payload.data.title,
        description: payload.data.description,
        imageUrl: payload.data.imageUrl,
        ctr: decimal(payload.data.ctr),
        cpc: decimal(payload.data.cpc),
        roi: decimal(payload.data.roi),
        budget: decimal(payload.data.budget),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/profil/${profile.username}`);
    revalidatePath("/mutaxassislar");
    return { success: true, message: "Portfolio case muvaffaqiyatli qo'shildi." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Portfolio qo'shishda xatolik yuz berdi." };
  }
}
