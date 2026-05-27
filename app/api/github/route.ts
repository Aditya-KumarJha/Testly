import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { getRequiredEnv } from "@/lib/env";
import {
  checkRateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const rate = checkRateLimit(req, {
    keyPrefix: "github-auth-start",
    limit: 30,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return rateLimitResponse(rate);
  }

  const params = new URLSearchParams({
    client_id: getRequiredEnv("GITHUB_CLIENT_ID"),
    redirect_uri: getRequiredEnv("GITHUB_REDIRECT_URI"),
    scope: "repo read:user",
  });

  redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}
