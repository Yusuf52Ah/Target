import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@targetuz.local").trim().toLowerCase();
  const adminName = process.env.ADMIN_NAME?.trim() || "TargetUZ Admin";
  const adminPassword = process.env.ADMIN_PASSWORD?.trim() || "admin12345";
  const passwordHash = hashPassword(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: "ADMIN",
      passwordHash,
    },
    create: {
      email: adminEmail,
      name: adminName,
      role: "ADMIN",
      passwordHash,
    },
    select: {
      id: true,
      email: true,
    },
  });

  await prisma.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
    },
  });

  console.log(`[seed] Admin user ready: ${admin.email}`);
  console.log("[seed] Admin password has been set from ADMIN_PASSWORD.");
}

main()
  .catch((error) => {
    console.error("[seed] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
