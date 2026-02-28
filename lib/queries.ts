import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type {
  ConversationMessage,
  DashboardStats,
  OrderCardData,
  SearchFilters,
  SpecialistCardData,
  SpecialistDetailData,
} from "@/types";

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

const EMPTY_DASHBOARD_STATS: DashboardStats = {
  jamiBuyurtma: 0,
  faolBuyurtma: 0,
  yakunlanganBuyurtma: 0,
  hamyonBalansi: 0,
  daromad: 0,
};

export async function getSpecialists(filters: SearchFilters = {}): Promise<SpecialistCardData[]> {
  if (!hasDatabaseUrl()) {
    return [];
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

    const minRating = filters.minRating;
    if (minRating === undefined) {
      return mapped;
    }

    return mapped.filter((item) => item.rating >= minRating);
  } catch (error) {
    console.error("Mutaxassislar ro'yxati olinmadi:", error);
    return [];
  }
}

export async function getSpecialistByUsername(username: string): Promise<SpecialistDetailData | null> {
  if (!hasDatabaseUrl()) {
    return null;
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
    return null;
  }
}

export async function getOrdersForUser(userId?: string): Promise<OrderCardData[]> {
  if (!userId || !hasDatabaseUrl()) {
    return [];
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
    return [];
  }
}

export async function getMessagesForUser(userId?: string): Promise<ConversationMessage[]> {
  if (!userId || !hasDatabaseUrl()) {
    return [];
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
    return [];
  }
}

export async function getDashboardStats(userId?: string): Promise<DashboardStats> {
  if (!userId || !hasDatabaseUrl()) {
    return EMPTY_DASHBOARD_STATS;
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
    return EMPTY_DASHBOARD_STATS;
  }
}

export async function getAdminStats() {
  if (!hasDatabaseUrl()) {
    return {
      usersCount: 0,
      specialistsCount: 0,
      ordersCount: 0,
      escrowTotal: 0,
      platformRevenue: 0,
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
