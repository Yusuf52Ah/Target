import type { AuthConfig } from "convex/server";

const basePath = process.env.BETTER_AUTH_BASE_PATH ?? "/api/auth";
const siteUrl =
  process.env.CONVEX_SITE_URL ??
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:3211");

if (!siteUrl) {
  throw new Error("CONVEX_SITE_URL is not set");
}

export default {
  providers: [
    {
      domain: `${siteUrl}${basePath}/convex`,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
