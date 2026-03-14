import type { ExperienceLevel, OrderStatus, PaymentProvider, Role } from "@prisma/client";

export type SpecialistCardData = {
  id: string;
  username: string;
  ism: string;
  avatarUrl: string | null;
  bio: string;
  hourlyRate: number | null;
  projectRate: number | null;
  rating: number;
  reviewsCount: number;
  tajribaDarajasi: ExperienceLevel;
  biznesNisha: string | null;
  skills: string[];
  portfolioNatijalar: {
    ctr: number;
    cpc: number;
    roi: number;
    budget: number;
  }[];
};

export type SpecialistDetailData = SpecialistCardData & {
  portfolios: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    ctr: number | null;
    cpc: number | null;
    roi: number | null;
    budget: number | null;
    createdAt: Date;
  }[];
  sharhlar: {
    id: string;
    rating: number;
    comment: string;
    clientName: string;
    createdAt: Date;
  }[];
  userId: string;
};

export type OrderCardData = {
  id: string;
  title: string;
  description: string;
  budget: number;
  escrowAmount: number;
  status: OrderStatus;
  paymentStatus: string;
  commissionRate: number;
  clientId: string;
  clientName: string;
  specialistId: string;
  specialistName: string;
  createdAt: Date;
  provider: PaymentProvider | null;
};

export type ConversationMessage = {
  id: string;
  orderId: string;
  content: string;
  createdAt: Date;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  isRead: boolean;
};

export type DashboardStats = {
  jamiBuyurtma: number;
  faolBuyurtma: number;
  yakunlanganBuyurtma: number;
  hamyonBalansi: number;
  daromad: number;
};

export type AppUser = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  image: string | null;
};

export type SearchFilters = {
  skill?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  level?: ExperienceLevel;
  niche?: string;
};
