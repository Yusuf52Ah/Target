import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

export async function getCurrentSession() {
  return getServerSession(authOptions);
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
