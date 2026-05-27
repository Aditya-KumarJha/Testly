import { db } from "@/db";
import { TestCasesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import {
  checkRateLimit,
  rateLimitHeaders,
  rateLimitResponse,
} from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const rate = checkRateLimit(req, {
      keyPrefix: "test-cases",
      limit: 60,
      windowMs: 60_000,
    });

    if (!rate.allowed) {
      return rateLimitResponse(rate);
    }

    const headers = rateLimitHeaders(rate);
    headers.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60");
    const searchParams = new URL(req.url).searchParams;
    const repoId = searchParams.get("repoId")?.trim();

    if (!repoId) {
      return apiError("repoId is required", 400);
    }

    const result = await db
      .select()
      .from(TestCasesTable)
      .where(eq(TestCasesTable.repoId, repoId));

    return apiSuccess(result, { headers });
  } catch (error) {
    console.error("Failed to fetch test cases", error);
    return apiError("Failed to fetch test cases", 500);
  }
}
