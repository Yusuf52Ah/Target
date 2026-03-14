import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import type { Role } from "@prisma/client";

type LocalAuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
  localAuthTokenHash?: string;
  localAuthTokenExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
};

const storageDir = path.join(process.cwd(), ".local");
const storageFile = path.join(storageDir, "auth-users.json");

async function readUsers(): Promise<LocalAuthUser[]> {
  try {
    const content = await readFile(storageFile, "utf8");
    const parsed = JSON.parse(content) as LocalAuthUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: LocalAuthUser[]) {
  await mkdir(storageDir, { recursive: true });
  await writeFile(storageFile, JSON.stringify(users, null, 2), "utf8");
}

export async function getLocalAuthUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readUsers();
  return users.find((user) => user.email.toLowerCase() === normalizedEmail) ?? null;
}

export async function createLocalAuthUser(input: {
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const users = await readUsers();
  const existing = users.find((user) => user.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error("LOCAL_AUTH_USER_EXISTS");
  }

  const now = new Date().toISOString();
  const user: LocalAuthUser = {
    id: randomUUID(),
    name: input.name.trim(),
    email: normalizedEmail,
    role: input.role,
    passwordHash: input.passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  users.push(user);
  await writeUsers(users);
  return user;
}

export async function updateLocalAuthToken(input: {
  email: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const users = await readUsers();
  const index = users.findIndex((user) => user.email.toLowerCase() === normalizedEmail);
  if (index === -1) {
    return null;
  }

  const current = users[index];
  if (!current) {
    return null;
  }

  const updated: LocalAuthUser = {
    ...current,
    localAuthTokenHash: input.tokenHash,
    localAuthTokenExpiresAt: input.expiresAt.toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users[index] = updated;
  await writeUsers(users);
  return updated;
}
