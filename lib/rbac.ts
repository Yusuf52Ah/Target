import type { Role } from "@prisma/client";

export function isAdmin(role?: Role | null) {
  return role === "ADMIN";
}

export function isSpecialist(role?: Role | null) {
  return role === "SPECIALIST";
}

export function isClient(role?: Role | null) {
  return role === "CLIENT";
}

export function canViewAdmin(role?: Role | null) {
  return role === "ADMIN";
}

export function canViewOrder(role: Role | undefined, userId: string, order: { clientId: string; specialistId: string }) {
  if (!role) {
    return false;
  }

  if (role === "ADMIN") {
    return true;
  }

  return order.clientId === userId || order.specialistId === userId;
}
