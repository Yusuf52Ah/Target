import { nextJsHandler } from "@convex-dev/better-auth/nextjs";
import { JWT_COOKIE_NAME } from "@convex-dev/better-auth/plugins";
import { fetchAction, fetchMutation, fetchQuery, preloadQuery } from "convex/nextjs";
import type { NextjsOptions } from "convex/nextjs";
import type { ArgsAndOptions, FunctionReference } from "convex/server";
import { cookies } from "next/headers";

import { api } from "@/convex/_generated/api";

const cookiePrefix = "better-auth";
const siteUrl =
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXTAUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000");
const isSecureCookie = siteUrl ? siteUrl.startsWith("https://") : process.env.NODE_ENV === "production";
const cookieBaseName = `${cookiePrefix}.${JWT_COOKIE_NAME}`;
const secureCookieName = `${isSecureCookie ? "__Secure-" : ""}${cookieBaseName}`;

export const handler = nextJsHandler({
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? process.env.CONVEX_SITE_URL,
});

export async function getToken() {
  const cookieStore = await cookies();
  const secureCookie = cookieStore.get(secureCookieName);
  if (secureCookie?.value) {
    return secureCookie.value;
  }
  const insecureCookie = cookieStore.get(cookieBaseName);
  if (insecureCookie?.value) {
    if (secureCookieName !== cookieBaseName) {
      console.warn(`Looking for secure cookie ${secureCookieName} but found insecure cookie ${cookieBaseName}`);
    }
    return insecureCookie.value;
  }
  return undefined;
}

async function withAuthOptions<T extends NextjsOptions | undefined>(
  options: T,
): Promise<NextjsOptions> {
  const token = await getToken();
  return {
    ...(options ?? {}),
    token: options?.token ?? token,
  };
}

export async function preloadAuthQuery<Query extends FunctionReference<"query">>(
  query: Query,
  ...args: ArgsAndOptions<Query, NextjsOptions>
) {
  const [fnArgs, options] = args;
  const authOptions = await withAuthOptions(options);
  return preloadQuery(query, fnArgs ?? {}, authOptions);
}

export async function fetchAuthQuery<Query extends FunctionReference<"query">>(
  query: Query,
  ...args: ArgsAndOptions<Query, NextjsOptions>
) {
  const [fnArgs, options] = args;
  const authOptions = await withAuthOptions(options);
  return fetchQuery(query, fnArgs ?? {}, authOptions);
}

export async function fetchAuthMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
  ...args: ArgsAndOptions<Mutation, NextjsOptions>
) {
  const [fnArgs, options] = args;
  const authOptions = await withAuthOptions(options);
  return fetchMutation(mutation, fnArgs ?? {}, authOptions);
}

export async function fetchAuthAction<Action extends FunctionReference<"action">>(
  action: Action,
  ...args: ArgsAndOptions<Action, NextjsOptions>
) {
  const [fnArgs, options] = args;
  const authOptions = await withAuthOptions(options);
  return fetchAction(action, fnArgs ?? {}, authOptions);
}

export async function isAuthenticated() {
  const token = await getToken();
  if (!token) {
    return false;
  }
  try {
    const user = await fetchQuery(api.auth.getCurrentUser, {}, { token });
    return Boolean(user);
  } catch (error) {
    console.error("Auth check failed:", error);
    return false;
  }
}
