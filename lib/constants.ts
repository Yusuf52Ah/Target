import type { ExperienceLevel, OrderStatus, PaymentProvider, Role } from "@prisma/client";

export const PLATFORM_COMMISSION_DEFAULT = 12;

export const UZ_SKILL_OPTIONS = [
  "Instagram Ads",
  "Meta Ads",
  "Lead Generation",
  "Onlayn Do'konlar",
  "Lokal Biznes",
] as const;

export const NISHA_VARIANTLARI = [
  "Ta'lim markazlari",
  "Go'zallik saloni",
  "Onlayn do'kon",
  "Restoran va kafe",
  "Tibbiyot xizmati",
  "Qurilish xizmati",
] as const;

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  BOSHLANGICH: "Boshlang'ich",
  ORTA: "O'rta",
  YUQORI: "Yuqori",
  EKSPERT: "Ekspert",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  KUTILMOQDA: "Kutilmoqda",
  QABUL_QILINDI: "Qabul qilindi",
  YAKUNLANDI: "Yakunlandi",
  BEKOR_QILINDI: "Bekor qilindi",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  KUTILMOQDA: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  QABUL_QILINDI: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  YAKUNLANDI: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  BEKOR_QILINDI: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export const ROLE_LABELS: Record<Role, string> = {
  CLIENT: "Mijoz",
  SPECIALIST: "Mutaxassis",
  ADMIN: "Administrator",
};

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProvider, string> = {
  PAYME: "Payme",
  CLICK: "Click",
  STRIPE: "Stripe",
};

export const protectedRoutes = ["/dashboard", "/buyurtmalar", "/xabarlar", "/admin"];
export const guestOnlyRoutes = ["/login", "/register"];
