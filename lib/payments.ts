import { Prisma, type PaymentProvider } from "@prisma/client";

import { PLATFORM_COMMISSION_DEFAULT } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

function toDecimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

async function ensureWallet(tx: Prisma.TransactionClient, userId: string) {
  return tx.wallet.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

async function getPlatformUserId(tx: Prisma.TransactionClient) {
  const existingAdmin = await tx.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  if (existingAdmin) {
    return existingAdmin.id;
  }

  const generatedEmail = `platform-${Date.now()}@targetuz.uz`;
  const admin = await tx.user.create({
    data: {
      name: "TargetUZ Platforma",
      email: generatedEmail,
      role: "ADMIN",
    },
    select: { id: true },
  });

  return admin.id;
}

export async function topupWallet({
  userId,
  amount,
  provider,
}: {
  userId: string;
  amount: number;
  provider: PaymentProvider;
}) {
  return prisma.$transaction(async (tx) => {
    const wallet = await ensureWallet(tx, userId);
    const currentBalance = Number(wallet.balance);
    const updatedBalance = currentBalance + amount;

    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: toDecimal(updatedBalance) },
    });

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        userId,
        amount: toDecimal(amount),
        type: "TOLDIRISH",
        status: "MUVAFFAQIYATLI",
        provider,
        note: "Hamyon to'ldirildi",
      },
    });

    return { balance: updatedBalance };
  });
}

export async function holdEscrowPayment({
  orderId,
  clientId,
  amount,
  provider,
}: {
  orderId: string;
  clientId: string;
  amount: number;
  provider: PaymentProvider;
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new Error("Buyurtma topilmadi.");
    }

    if (order.clientId !== clientId) {
      throw new Error("Ushbu buyurtma uchun to'lov huquqi sizda yo'q.");
    }

    if (order.paymentStatus === "ESCROWDA") {
      throw new Error("To'lov allaqachon escrowga qo'yilgan.");
    }

    const clientWallet = await ensureWallet(tx, clientId);
    const currentBalance = Number(clientWallet.balance);
    if (currentBalance < amount) {
      throw new Error("Hamyon balansida mablag' yetarli emas.");
    }

    const remainingBalance = currentBalance - amount;
    await tx.wallet.update({
      where: { id: clientWallet.id },
      data: { balance: toDecimal(remainingBalance) },
    });

    await tx.transaction.create({
      data: {
        walletId: clientWallet.id,
        userId: clientId,
        orderId,
        amount: toDecimal(amount),
        type: "ESCROW_HOLD",
        status: "MUVAFFAQIYATLI",
        provider,
        note: "Buyurtma uchun escrowga ushlab turildi",
      },
    });

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "ESCROWDA",
        paymentProvider: provider,
        escrowAmount: toDecimal(amount),
      },
    });

    return updatedOrder;
  });
}

export async function releaseEscrowPayment({
  orderId,
}: {
  orderId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error("Buyurtma topilmadi.");
    }

    if (order.paymentStatus !== "ESCROWDA") {
      throw new Error("Buyurtmada yechiladigan escrow mablag'i yo'q.");
    }

    const escrowAmount = Number(order.escrowAmount);
    if (escrowAmount <= 0) {
      throw new Error("Escrow summasi noto'g'ri.");
    }

    const commissionRateRaw = Number(order.commissionRate || PLATFORM_COMMISSION_DEFAULT);
    const commissionRate = Math.max(10, Math.min(15, commissionRateRaw));
    const commission = Number(((escrowAmount * commissionRate) / 100).toFixed(2));
    const specialistIncome = Number((escrowAmount - commission).toFixed(2));

    const specialistWallet = await ensureWallet(tx, order.specialistId);
    const specialistNextBalance = Number(specialistWallet.balance) + specialistIncome;
    await tx.wallet.update({
      where: { id: specialistWallet.id },
      data: { balance: toDecimal(specialistNextBalance) },
    });

    const platformUserId = await getPlatformUserId(tx);
    const platformWallet = await ensureWallet(tx, platformUserId);
    const platformNextBalance = Number(platformWallet.balance) + commission;
    await tx.wallet.update({
      where: { id: platformWallet.id },
      data: { balance: toDecimal(platformNextBalance) },
    });

    await tx.transaction.create({
      data: {
        walletId: specialistWallet.id,
        userId: order.specialistId,
        orderId,
        amount: toDecimal(specialistIncome),
        type: "ESCROW_RELEASE",
        status: "MUVAFFAQIYATLI",
        provider: order.paymentProvider,
        note: "Buyurtma yakunlangach mutaxassisga yechildi",
      },
    });

    await tx.transaction.create({
      data: {
        walletId: platformWallet.id,
        userId: platformUserId,
        orderId,
        amount: toDecimal(commission),
        type: "KOMISSIYA",
        status: "MUVAFFAQIYATLI",
        provider: order.paymentProvider,
        note: `${commissionRate}% platforma komissiyasi`,
      },
    });

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "YECHILGAN",
        escrowAmount: toDecimal(0),
      },
    });

    return {
      order: updatedOrder,
      commission,
      specialistIncome,
    };
  });
}
