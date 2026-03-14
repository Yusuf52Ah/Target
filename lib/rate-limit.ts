type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const MAX_BUCKETS = 5000;
const buckets = new Map<string, RateLimitBucket>();

function getIpAddress(request: Request) {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() ?? "unknown";
}

function pruneBuckets(now: number) {
  if (buckets.size < MAX_BUCKETS) {
    return;
  }

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function getRateLimitKey(request: Request, scope: string, userId?: string) {
  const ip = getIpAddress(request);
  return `${scope}:${userId ?? "anonymous"}:${ip}`;
}

export function checkRateLimit(key: string, config: RateLimitConfig) {
  const now = Date.now();
  pruneBuckets(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + config.windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return { allowed: true, remaining: config.maxRequests - existing.count, retryAfterSeconds: 0 };
}
