import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import nodemailer from "nodemailer";

import { getAuthSecret, hasEnv, isLocalAuthMode, isProduction, requireEnv } from "@/lib/env";
import { verificationEmailHtml, verificationEmailText } from "@/lib/email-templates";
import { createLocalAuthTokenMetadata, hashLocalAuthToken, verifyPassword } from "@/lib/local-auth";
import { getLocalAuthUserByEmail, updateLocalAuthToken } from "@/lib/local-auth-store";
import { prisma } from "@/lib/prisma";

const hasEmailServer = hasEnv("EMAIL_SERVER");
const hasEmailFrom = hasEnv("EMAIL_FROM");
const hasEmailConfig = hasEmailServer && hasEmailFrom;
const localAuthMode = isLocalAuthMode();

const emailServer = hasEmailServer ? requireEnv("EMAIL_SERVER") : "smtp://user:pass@127.0.0.1:1025";
const emailFrom = hasEmailFrom ? requireEnv("EMAIL_FROM") : "TargetUZ <noreply@targetuz.uz>";

const emailProvider = EmailProvider({
  server: emailServer,
  from: emailFrom,
  async sendVerificationRequest({ identifier, url, provider }) {
    if (!hasEmailConfig && isProduction) {
      throw new Error("EMAIL_SERVER va EMAIL_FROM production muhitida majburiy.");
    }

    const transport = nodemailer.createTransport(provider.server);
    await transport.sendMail({
      to: identifier,
      from: provider.from,
      subject: "TargetUZ: Kirish havolasi",
      text: verificationEmailText(url),
      html: verificationEmailHtml(url),
    });
  },
});

async function authorizeLocalAuth(input: {
  email: string;
  password: string;
  localToken: string;
}) {
  const user = await getLocalAuthUserByEmail(input.email);
  if (!user) {
    return null;
  }

  let isAuthorized = false;
  if (input.password && user.passwordHash) {
    isAuthorized = await verifyPassword(input.password, user.passwordHash);
  }

  if (
    !isAuthorized &&
    input.localToken &&
    user.localAuthTokenHash &&
    user.localAuthTokenExpiresAt &&
    new Date(user.localAuthTokenExpiresAt).getTime() > Date.now()
  ) {
    isAuthorized = hashLocalAuthToken(input.localToken) === user.localAuthTokenHash;
  }

  if (!isAuthorized) {
    return null;
  }

  const localToken = createLocalAuthTokenMetadata();
  await updateLocalAuthToken({
    email: user.email,
    tokenHash: localToken.tokenHash,
    expiresAt: localToken.expiresAt,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    localAuthToken: localToken.token,
  };
}

const credentialsProvider = CredentialsProvider({
  name: "Email va parol",
  credentials: {
    email: {
      label: "Email",
      type: "email",
      placeholder: "you@example.com",
    },
    password: {
      label: "Parol",
      type: "password",
    },
    localToken: {
      label: "Local token",
      type: "text",
    },
  },
  async authorize(credentials) {
    const rawEmail = typeof credentials?.email === "string" ? credentials.email : "";
    const rawPassword = typeof credentials?.password === "string" ? credentials.password : "";
    const rawLocalToken = typeof credentials?.localToken === "string" ? credentials.localToken : "";
    const normalizedEmail = rawEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      return null;
    }

    if (localAuthMode) {
      return authorizeLocalAuth({
        email: normalizedEmail,
        password: rawPassword,
        localToken: rawLocalToken,
      });
    }

    let user: {
      id: string;
      name: string | null;
      email: string;
      role: "CLIENT" | "SPECIALIST" | "ADMIN";
      passwordHash: string | null;
      localAuthTokenHash: string | null;
      localAuthTokenExpiresAt: Date | null;
    } | null = null;

    try {
      user = await prisma.user.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          passwordHash: true,
          localAuthTokenHash: true,
          localAuthTokenExpiresAt: true,
        },
      });
    } catch (error) {
      console.error("DB login failed, fallback to local auth store:", error);
      return authorizeLocalAuth({
        email: normalizedEmail,
        password: rawPassword,
        localToken: rawLocalToken,
      });
    }

    if (!user) {
      return authorizeLocalAuth({
        email: normalizedEmail,
        password: rawPassword,
        localToken: rawLocalToken,
      });
    }

    let isAuthorized = false;

    if (rawPassword && user.passwordHash) {
      isAuthorized = await verifyPassword(rawPassword, user.passwordHash);
    }

    if (
      !isAuthorized &&
      rawLocalToken &&
      user.localAuthTokenHash &&
      user.localAuthTokenExpiresAt &&
      user.localAuthTokenExpiresAt.getTime() > Date.now()
    ) {
      isAuthorized = hashLocalAuthToken(rawLocalToken) === user.localAuthTokenHash;
    }

    if (!isAuthorized) {
      return null;
    }

    const localToken = createLocalAuthTokenMetadata();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        localAuthTokenHash: localToken.tokenHash,
        localAuthTokenIssuedAt: localToken.issuedAt,
        localAuthTokenExpiresAt: localToken.expiresAt,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      localAuthToken: localToken.token,
    };
  },
});

const providers: NextAuthOptions["providers"] = [credentialsProvider];

if (!localAuthMode) {
  providers.push(emailProvider);
}

const hasGoogleClientId = hasEnv("GOOGLE_CLIENT_ID");
const hasGoogleClientSecret = hasEnv("GOOGLE_CLIENT_SECRET");

if (hasGoogleClientId !== hasGoogleClientSecret) {
  throw new Error("GOOGLE_CLIENT_ID va GOOGLE_CLIENT_SECRET birgalikda berilishi kerak.");
}

if (!localAuthMode && hasGoogleClientId && hasGoogleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: requireEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
    }),
  );
}

export const authOptions: NextAuthOptions = {
  ...(localAuthMode ? {} : { adapter: PrismaAdapter(prisma) }),
  secret: getAuthSecret(),
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers,
  callbacks: {
    async signIn({ user, profile, email, account }) {
      if (account?.provider === "credentials") {
        return Boolean(user?.id);
      }

      if (localAuthMode) {
        return false;
      }

      const emailPayload = email as { email?: string } | undefined;
      const sourceEmail = user.email ?? emailPayload?.email ?? (typeof profile?.email === "string" ? profile.email : "");
      const normalizedEmail = sourceEmail.trim().toLowerCase();

      if (!normalizedEmail) {
        return false;
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
            mode: "insensitive",
          },
        },
        select: { id: true },
      });

      // Block first-time sign-ins; users must be created via register flow.
      return Boolean(existingUser);
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.localAuthToken =
          "localAuthToken" in user && typeof user.localAuthToken === "string"
            ? user.localAuthToken
            : undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role = (token.role as "CLIENT" | "SPECIALIST" | "ADMIN") ?? "CLIENT";
        session.user.localAuthToken = typeof token.localAuthToken === "string" ? token.localAuthToken : undefined;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (localAuthMode) {
        return;
      }

      if (!user.id) {
        return;
      }

      await prisma.wallet.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
        },
      });
    },
  },
};
