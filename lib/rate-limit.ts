import { NextRequest, NextResponse } from "next/server";

const DEFAULT_WINDOW_MS = 60_000;

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  keyPrefix: string;
  limit: number;
  windowMs?: number;
  identifier?: string | null;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
};

const buckets = new Map<string, Bucket>();

function getClientId(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || forwardedFor;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp;
  }

  return "unknown";
}

export function checkRateLimit(
  req: NextRequest,
  { keyPrefix, limit, windowMs = DEFAULT_WINDOW_MS, identifier }: RateLimitOptions,
): RateLimitResult {
  const clientId = identifier || getClientId(req);
  const key = `${keyPrefix}:${clientId}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - 1),
      resetMs: resetAt - now,
    };
  }

  const nextCount = bucket.count + 1;
  bucket.count = nextCount;

  return {
    allowed: nextCount <= limit,
    limit,
    remaining: Math.max(0, limit - nextCount),
    resetMs: Math.max(0, bucket.resetAt - now),
  };
}

export function rateLimitHeaders(result: RateLimitResult) {
  const headers = new Headers();
  headers.set("X-RateLimit-Limit", result.limit.toString());
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set("X-RateLimit-Reset", Math.ceil(result.resetMs / 1000).toString());
  return headers;
}

export function rateLimitResponse(result: RateLimitResult) {
  const headers = rateLimitHeaders(result);
  return NextResponse.json(
    { error: "Too many requests. Please try again shortly." },
    { status: 429, headers },
  );
}
