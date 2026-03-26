import { BetterAuth, convexAdapter } from "@convex-dev/better-auth";
import type { AuthFunctions, PublicAuthFunctions } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import type { GenericActionCtx } from "convex/server";

import { api, components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";

const siteUrl =
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXTAUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000");
const basePath = process.env.BETTER_AUTH_BASE_PATH ?? "/api/auth";

if (!siteUrl) {
  throw new Error("SITE_URL is not set");
}

const authFunctions: AuthFunctions = internal.auth as unknown as AuthFunctions;
const publicAuthFunctions: PublicAuthFunctions = api.auth as unknown as PublicAuthFunctions;

export const authComponent = new BetterAuth(components.betterAuth, {
  authFunctions,
  publicAuthFunctions,
});

export const {
  createUser,
  deleteUser,
  updateUser,
  createSession,
  isAuthenticated,
} = authComponent.createAuthFunctions<DataModel>({
  onCreateUser: async (_ctx, user) => user.email.toLowerCase(),
});

export const createAuth = (ctx: GenericActionCtx<DataModel>) =>
  betterAuth({
    baseURL: siteUrl,
    basePath,
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
    plugins: [convex({ options: { basePath } })],
  });

export const getCurrentUser = query({
  handler: async (ctx) => authComponent.getAuthUser(ctx),
});
