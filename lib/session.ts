import { redirect } from "next/navigation";

import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";
import { hasEnv, isLocalAuthMode } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { api } from "@/convex/_generated/api";

type AppSession = {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: "CLIENT" | "SPECIALIST" | "ADMIN";
  };
};

async function ensurePrismaUser(input: { email: string; name?: string | null }) {
  const existing = await prisma.user.findFirst({
    where: {
      email: {
        equals: input.email,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (existing) {
    return existing;
  }

  const created = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name ?? null,
      role: "CLIENT",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  await prisma.wallet.upsert({
    where: { userId: created.id },
    update: {},
    create: {
      userId: created.id,
    },
  });

  return created;
}

function canUseDatabase() {
  return hasEnv("DATABASE_URL") && !isLocalAuthMode();
}

export async function getCurrentSession(): Promise<AppSession | null> {
  const authed = await isAuthenticated();
  if (!authed) {
    return null;
  }

  let authUser: { email?: string | null; name?: string | null } | null = null;
  try {
    authUser = await fetchAuthQuery(api.auth.getCurrentUser);
  } catch (error) {
    console.error("Auth user fetch failed:", error);
    return null;
  }
  if (!authUser?.email) {
    return null;
  }

  if (!canUseDatabase()) {
    return {
      user: {
        id: authUser.email,
        email: authUser.email,
        name: authUser.name ?? null,
        role: "CLIENT",
      },
    };
  }

  let user: { id: string; email: string; name: string | null; role: "CLIENT" | "SPECIALIST" | "ADMIN" } | null = null;
  try {
    user = await ensurePrismaUser({
      email: authUser.email,
      name: authUser.name ?? null,
    });
  } catch (error) {
    console.error("Prisma user sync failed:", error);
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name ?? authUser.name ?? null,
      role: user.role,
    },
  };
}

export async function requireAuthSession() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(role: "CLIENT" | "SPECIALIST" | "ADMIN") {
  const session = await requireAuthSession();
  if (session.user.role !== role) {
    redirect("/dashboard");
  }
  return session;
}
