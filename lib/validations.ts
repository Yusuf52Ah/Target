import { z } from "zod";

const bugun = new Date();

export const orderCreateSchema = z.object({
  specialistId: z.string().min(1, "Mutaxassis aniqlanmadi."),
  title: z
    .string()
    .min(8, "Loyiha nomi kamida 8 ta belgidan iborat bo'lsin.")
    .max(120, "Loyiha nomi 120 belgidan oshmasin."),
  description: z
    .string()
    .min(30, "Loyiha tavsifi kamida 30 ta belgidan iborat bo'lsin.")
    .max(2000, "Loyiha tavsifi 2000 belgidan oshmasin."),
  budget: z
    .coerce.number()
    .min(100000, "Minimal byudjet 100 000 so'm.")
    .max(500000000, "Byudjet juda katta qiymatga teng."),
});

export const messageSchema = z.object({
  orderId: z.string().min(1, "Buyurtma tanlanmadi."),
  receiverId: z.string().min(1, "Qabul qiluvchi tanlanmadi."),
  content: z
    .string()
    .min(2, "Xabar kamida 2 ta belgidan iborat bo'lsin.")
    .max(1000, "Xabar 1000 belgidan oshmasin."),
});

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username kamida 3 ta belgidan iborat bo'lsin.")
    .max(40, "Username 40 belgidan oshmasin.")
    .regex(/^[a-z0-9-]+$/, "Username faqat kichik lotin harf, son va tiredan iborat bo'lsin."),
  bio: z
    .string()
    .min(30, "Qisqa bio kamida 30 ta belgidan iborat bo'lsin.")
    .max(320, "Qisqa bio 320 belgidan oshmasin."),
  hourlyRate: z.coerce.number().min(0, "Narx manfiy bo'lmasligi kerak.").max(10000000, "Narx juda katta."),
  projectRate: z.coerce.number().min(0, "Narx manfiy bo'lmasligi kerak.").max(1000000000, "Narx juda katta."),
  businessNiche: z.string().min(2, "Nisha kiriting.").max(120, "Nisha nomi uzun."),
  avatarUrl: z.string().url("Avatar havolasi noto'g'ri.").optional().or(z.literal("")),
  skillsText: z
    .string()
    .min(2, "Kamida bitta ko'nikma kiriting.")
    .max(300, "Ko'nikmalar ro'yxati juda uzun.")
    .optional()
    .or(z.literal("")),
});

export const portfolioSchema = z.object({
  title: z.string().min(4, "Portfolio nomi kamida 4 ta belgi bo'lsin.").max(120, "Portfolio nomi juda uzun."),
  description: z
    .string()
    .min(20, "Portfolio tavsifi kamida 20 ta belgidan iborat bo'lsin.")
    .max(3000, "Portfolio tavsifi juda uzun."),
  imageUrl: z.string().url("Rasm havolasi noto'g'ri."),
  ctr: z.coerce.number().min(0, "CTR manfiy bo'lmasligi kerak.").max(100, "CTR 100% dan oshmasin."),
  cpc: z.coerce.number().min(0, "CPC manfiy bo'lmasligi kerak.").max(100000000, "CPC qiymati noto'g'ri."),
  roi: z.coerce.number().min(0, "ROI manfiy bo'lmasligi kerak.").max(1000, "ROI juda katta."),
  budget: z.coerce.number().min(10000, "Byudjet juda kichik.").max(10000000000, "Byudjet juda katta."),
});

export const holdPaymentSchema = z.object({
  orderId: z.string().min(1, "Buyurtma ID topilmadi."),
  amount: z.coerce.number().min(10000, "To'lov summasi kamida 10 000 so'm."),
  provider: z.enum(["PAYME", "CLICK"], {
    errorMap: () => ({ message: "Faqat Payme yoki Click tanlang." }),
  }),
});

export const releasePaymentSchema = z.object({
  orderId: z.string().min(1, "Buyurtma ID topilmadi."),
});

export const reviewSchema = z.object({
  orderId: z.string().min(1, "Buyurtma tanlanmadi."),
  rating: z.coerce.number().min(1, "Reyting 1 dan kam bo'lmasin.").max(5, "Reyting 5 dan oshmasin."),
  comment: z.string().min(10, "Izoh kamida 10 ta belgidan iborat bo'lsin.").max(500, "Izoh juda uzun."),
});

export const topupSchema = z.object({
  amount: z.coerce.number().min(10000, "Minimal to'ldirish 10 000 so'm.").max(1000000000, "Maksimal limitdan oshib ketdi."),
  provider: z.enum(["PAYME", "CLICK"], {
    errorMap: () => ({ message: "To'lov tizimini tanlang." }),
  }),
});

export const searchSchema = z.object({
  skill: z.string().optional(),
  minPrice: z.coerce.number().min(0, "Narx manfiy bo'lmaydi.").max(100000000, "Narx juda katta.").optional(),
  maxPrice: z.coerce.number().min(0, "Narx manfiy bo'lmaydi.").max(100000000, "Narx juda katta.").optional(),
  minRating: z.coerce.number().min(0, "Reyting 0 dan kichik bo'lmaydi.").max(5, "Reyting 5 dan oshmaydi.").optional(),
  level: z.enum(["BOSHLANGICH", "ORTA", "YUQORI", "EKSPERT"]).optional(),
  niche: z.string().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lsin.").max(80, "Ism juda uzun."),
  email: z.string().email("Email manzil noto'g'ri."),
  role: z.enum(["CLIENT", "SPECIALIST"], {
    errorMap: () => ({ message: "Rol tanlang." }),
  }),
});

export const cloudinarySignSchema = z.object({
  timestamp: z.coerce.number().min(1),
  folder: z.string().default("target-portfolio"),
  publicId: z.string().optional(),
  expireAt: z.coerce.date().optional().refine((value) => (value ? value >= bugun : true), {
    message: "Imzo muddati o'tib ketgan.",
  }),
});
