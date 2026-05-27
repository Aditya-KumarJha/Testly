import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api";
import {
  checkRateLimit,
  rateLimitHeaders,
  rateLimitResponse,
} from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const rate = checkRateLimit(req, {
    keyPrefix: "github-token",
    limit: 60,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return rateLimitResponse(rate);
  }

  const headers = rateLimitHeaders(rate);
  const cookieStore = await cookies();
  const token = cookieStore.get("gh_token")?.value;

  return apiSuccess({ connected: Boolean(token) }, { headers });
}
