import { BetterAuth, convexAdapter } from "@convex-dev/better-auth";
import type { AuthFunctions } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import type { GenericActionCtx } from "convex/server";

import authConfig from "./auth.config";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";

const siteUrl =
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXTAUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000");

if (!siteUrl) {
  throw new Error("SITE_URL is not set");
}

const baseAuthComponent = new BetterAuth<DataModel>(components.betterAuth, {
  authFunctions: {} as AuthFunctions,
});

export const {
  createUser,
  deleteUser,
  updateUser,
  createSession,
  isAuthenticated,
} = baseAuthComponent.createAuthFunctions<DataModel>({
  onCreateUser: async (_ctx, user) => user.email.toLowerCase(),
});

export const authComponent = new BetterAuth<DataModel>(components.betterAuth, {
  authFunctions: {
    createUser,
    deleteUser,
    updateUser,
    createSession,
  },
  publicAuthFunctions: {
    isAuthenticated,
  },
});

export const createAuth = (ctx: GenericActionCtx<DataModel>) =>
  betterAuth({
    baseURL: siteUrl,
    database: convexAdapter(ctx, authComponent),
    emailVerification: {
      sendOnSignUp: false,
      sendOnSignIn: false,
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      autoSignIn: true,
    },
    plugins: [convex({ authConfig })],
  });

export const getCurrentUser = query({
  handler: async (ctx) => authComponent.getAuthUser(ctx),
});
