import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import nodemailer from "nodemailer";

import { verificationEmailHtml, verificationEmailText } from "@/lib/email-templates";
import { prisma } from "@/lib/prisma";

const emailProvider = EmailProvider({
  server: process.env.EMAIL_SERVER ?? "smtp://user:pass@127.0.0.1:1025",
  from: process.env.EMAIL_FROM ?? "TargetUZ <noreply@targetuz.uz>",
  async sendVerificationRequest({ identifier, url, provider }) {
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

const providers: NextAuthOptions["providers"] = [emailProvider];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role = (token.role as "CLIENT" | "SPECIALIST" | "ADMIN") ?? "CLIENT";
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
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
