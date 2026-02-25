import { Prisma } from "@prisma/client";

import { mockDashboardStats, mockMessages, mockOrders, mockSpecialistDetails, mockSpecialists } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { safeNumber } from "@/lib/utils";
import type {
  ConversationMessage,
  DashboardStats,
  OrderCardData,
  SearchFilters,
  SpecialistCardData,
  SpecialistDetailData,
} from "@/types";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function applySpecialistFilters(data: SpecialistCardData[], filters: SearchFilters) {
  return data.filter((item) => {
    const bySkill = filters.skill
      ? item.skills.some((skill) => skill.toLowerCase().includes(filters.skill!.toLowerCase()))
      : true;
    const byMinPrice = filters.minPrice ? safeNumber(item.hourlyRate) >= filters.minPrice : true;
    const byMaxPrice = filters.maxPrice ? safeNumber(item.hourlyRate) <= filters.maxPrice : true;
    const byRating = filters.minRating ? item.rating >= filters.minRating : true;
    const byLevel = filters.level ? item.tajribaDarajasi === filters.level : true;
    const byNiche = filters.niche
      ? (item.biznesNisha ?? "").toLowerCase().includes(filters.niche.toLowerCase())
      : true;
    return bySkill && byMinPrice && byMaxPrice && byRating && byLevel && byNiche;
  });
}

export async function getSpecialists(filters: SearchFilters = {}): Promise<SpecialistCardData[]> {
  if (!hasDatabase()) {
    return applySpecialistFilters(mockSpecialists, filters);
  }

  try {
    const where: Prisma.ProfileWhereInput = {
      ...(filters.level ? { experienceLevel: filters.level } : {}),
      ...(filters.niche ? { businessNiche: { contains: filters.niche, mode: "insensitive" } } : {}),
      ...(filters.minPrice || filters.maxPrice
        ? {
            hourlyRate: {
              ...(filters.minPrice ? { gte: filters.minPrice } : {}),
              ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
            },
          }
        : {}),
      ...(filters.skill
        ? {
            skills: {
              some: {
                skill: {
                  name: { contains: filters.skill, mode: "insensitive" },
                },
              },
            },
          }
        : {}),
    };

    const profiles = await prisma.profile.findMany({
      where,
      include: {
        user: true,
        skills: { include: { skill: true } },
        portfolios: {
          take: 2,
          orderBy: { createdAt: "desc" },
        },
        reviews: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const mapped: SpecialistCardData[] = profiles.map((profile) => {
      const rating =
        profile.reviews.length > 0
          ? profile.reviews.reduce((acc, item) => acc + item.rating, 0) / profile.reviews.length
          : 0;
      return {
        id: profile.id,
        username: profile.username,
        ism: profile.user.name ?? profile.username,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        hourlyRate: profile.hourlyRate,
        projectRate: profile.projectRate,
        rating,
        reviewsCount: profile.reviews.length,
        tajribaDarajasi: profile.experienceLevel,
        biznesNisha: profile.businessNiche,
        skills: profile.skills.map((entry) => entry.skill.name),
        portfolioNatijalar: profile.portfolios
          .filter((entry) => entry.ctr !== null || entry.cpc !== null || entry.roi !== null || entry.budget !== null)
          .map((entry) => ({
            ctr: entry.ctr ? Number(entry.ctr) : 0,
            cpc: entry.cpc ? Number(entry.cpc) : 0,
            roi: entry.roi ? Number(entry.roi) : 0,
            budget: entry.budget ? Number(entry.budget) : 0,
          })),
      };
    });

    return filters.minRating ? mapped.filter((item) => item.rating >= filters.minRating!) : mapped;
  } catch (error) {
    console.error("Mutaxassislar ro'yxati olinmadi:", error);
    return applySpecialistFilters(mockSpecialists, filters);
  }
}

export async function getSpecialistByUsername(username: string): Promise<SpecialistDetailData | null> {
  if (!hasDatabase()) {
    return mockSpecialistDetails.find((item) => item.username === username) ?? null;
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { username },
      include: {
        user: true,
        skills: { include: { skill: true } },
        portfolios: { orderBy: { createdAt: "desc" } },
        reviews: {
          include: {
            client: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!profile) {
      return null;
    }

    const rating =
      profile.reviews.length > 0
        ? profile.reviews.reduce((acc, item) => acc + item.rating, 0) / profile.reviews.length
        : 0;

    return {
      id: profile.id,
      username: profile.username,
      userId: profile.userId,
      ism: profile.user.name ?? profile.username,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      hourlyRate: profile.hourlyRate,
      projectRate: profile.projectRate,
      rating,
      reviewsCount: profile.reviews.length,
      tajribaDarajasi: profile.experienceLevel,
      biznesNisha: profile.businessNiche,
      skills: profile.skills.map((entry) => entry.skill.name),
      portfolioNatijalar: profile.portfolios.map((entry) => ({
        ctr: entry.ctr ? Number(entry.ctr) : 0,
        cpc: entry.cpc ? Number(entry.cpc) : 0,
        roi: entry.roi ? Number(entry.roi) : 0,
        budget: entry.budget ? Number(entry.budget) : 0,
      })),
      portfolios: profile.portfolios.map((entry) => ({
        id: entry.id,
        title: entry.title,
        description: entry.description,
        imageUrl: entry.imageUrl,
        ctr: entry.ctr ? Number(entry.ctr) : null,
        cpc: entry.cpc ? Number(entry.cpc) : null,
        roi: entry.roi ? Number(entry.roi) : null,
        budget: entry.budget ? Number(entry.budget) : null,
        createdAt: entry.createdAt,
      })),
      sharhlar: profile.reviews.map((entry) => ({
        id: entry.id,
        rating: entry.rating,
        comment: entry.comment,
        clientName: entry.client.name ?? entry.client.email,
        createdAt: entry.createdAt,
      })),
    };
  } catch (error) {
    console.error("Mutaxassis profili olinmadi:", error);
    return mockSpecialistDetails.find((item) => item.username === username) ?? null;
  }
}

export async function getOrdersForUser(userId?: string): Promise<OrderCardData[]> {
  if (!userId || !hasDatabase()) {
    return mockOrders;
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [{ clientId: userId }, { specialistId: userId }],
      },
      include: {
        client: true,
        specialist: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return orders.map((order) => ({
      id: order.id,
      title: order.title,
      description: order.description,
      budget: Number(order.budget),
      escrowAmount: Number(order.escrowAmount),
      status: order.status,
      paymentStatus: order.paymentStatus,
      commissionRate: Number(order.commissionRate),
      clientId: order.clientId,
      clientName: order.client.name ?? order.client.email,
      specialistId: order.specialistId,
      specialistName: order.specialist.name ?? order.specialist.email,
      createdAt: order.createdAt,
      provider: order.paymentProvider,
    }));
  } catch (error) {
    console.error("Buyurtmalar olinmadi:", error);
    return mockOrders;
  }
}

export async function getMessagesForUser(userId?: string): Promise<ConversationMessage[]> {
  if (!userId || !hasDatabase()) {
    return mockMessages;
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: true,
        receiver: true,
      },
      orderBy: { createdAt: "desc" },
      take: 80,
    });

    return messages.map((message) => ({
      id: message.id,
      orderId: message.orderId,
      content: message.content,
      createdAt: message.createdAt,
      senderId: message.senderId,
      senderName: message.sender.name ?? message.sender.email,
      receiverId: message.receiverId,
      receiverName: message.receiver.name ?? message.receiver.email,
      isRead: message.isRead,
    }));
  } catch (error) {
    console.error("Xabarlar olinmadi:", error);
    return mockMessages;
  }
}

export async function getDashboardStats(userId?: string): Promise<DashboardStats> {
  if (!userId || !hasDatabase()) {
    return mockDashboardStats;
  }

  try {
    const [orderAggregate, activeOrders, completedOrders, wallet, incomeTransactions] = await Promise.all([
      prisma.order.count({
        where: {
          OR: [{ clientId: userId }, { specialistId: userId }],
        },
      }),
      prisma.order.count({
        where: {
          OR: [{ clientId: userId }, { specialistId: userId }],
          status: "QABUL_QILINDI",
        },
      }),
      prisma.order.count({
        where: {
          OR: [{ clientId: userId }, { specialistId: userId }],
          status: "YAKUNLANDI",
        },
      }),
      prisma.wallet.findUnique({ where: { userId } }),
      prisma.transaction.findMany({
        where: {
          userId,
          type: "ESCROW_RELEASE",
          status: "MUVAFFAQIYATLI",
        },
      }),
    ]);

    return {
      jamiBuyurtma: orderAggregate,
      faolBuyurtma: activeOrders,
      yakunlanganBuyurtma: completedOrders,
      hamyonBalansi: wallet ? Number(wallet.balance) : 0,
      daromad: incomeTransactions.reduce((acc, item) => acc + Number(item.amount), 0),
    };
  } catch (error) {
    console.error("Dashboard statistikasi olinmadi:", error);
    return mockDashboardStats;
  }
}

export async function getAdminStats() {
  if (!hasDatabase()) {
    return {
      usersCount: 34,
      specialistsCount: 21,
      ordersCount: 56,
      escrowTotal: 11400000,
      platformRevenue: 2370000,
    };
  }

  try {
    const [usersCount, specialistsCount, ordersCount, escrowOrders, commissionTransactions] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "SPECIALIST" } }),
      prisma.order.count(),
      prisma.order.findMany({
        where: { paymentStatus: "ESCROWDA" },
        select: { escrowAmount: true },
      }),
      prisma.transaction.findMany({
        where: {
          type: "KOMISSIYA",
          status: "MUVAFFAQIYATLI",
        },
        select: { amount: true },
      }),
    ]);

    const escrowTotal = escrowOrders.reduce((acc, item) => acc + Number(item.escrowAmount), 0);
    const platformRevenue = commissionTransactions.reduce((acc, item) => acc + Number(item.amount), 0);

    return {
      usersCount,
      specialistsCount,
      ordersCount,
      escrowTotal,
      platformRevenue,
    };
  } catch (error) {
    console.error("Admin statistikasi olinmadi:", error);
    return {
      usersCount: 0,
      specialistsCount: 0,
      ordersCount: 0,
      escrowTotal: 0,
      platformRevenue: 0,
    };
  }
}
