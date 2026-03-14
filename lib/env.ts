const NODE_ENV = process.env.NODE_ENV ?? "development";
const warnedKeys = new Set<string>();
const isProductionBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

export const isProduction = NODE_ENV === "production";

export function isLocalAuthMode() {
  const raw = (process.env.AUTH_LOCAL_MODE ?? "").trim().toLowerCase().replace(/["'\\]/g, "");

  if (raw === "false" || raw === "0" || raw === "no") {
    return false;
  }

  if (raw === "true" || raw === "1" || raw === "yes") {
    return true;
  }

  // Safe default for local development when env is missing/misconfigured.
  return !isProduction;
}

export function hasEnv(key: keyof NodeJS.ProcessEnv) {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0;
}

export function requireEnv(key: keyof NodeJS.ProcessEnv, context?: string) {
  const value = process.env[key];
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  const suffix = context ? ` (${context})` : "";
  throw new Error(`Missing required environment variable: ${key}${suffix}`);
}

export function getSafeSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  try {
    return new URL(raw);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export function getAuthSecret() {
  if (hasEnv("NEXTAUTH_SECRET")) {
    return requireEnv("NEXTAUTH_SECRET");
  }

  if (isProduction) {
    if (!isProductionBuildPhase && !warnedKeys.has("NEXTAUTH_SECRET")) {
      console.warn("Warning: NEXTAUTH_SECRET is missing in production. Using insecure fallback secret.");
      warnedKeys.add("NEXTAUTH_SECRET");
    }
  }

  return "dev-only-nextauth-secret-change-in-prod";
}
