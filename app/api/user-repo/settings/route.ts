import { db } from "@/db";
import { repositories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import {
  apiError,
  apiSuccess,
  parseJsonBody,
  toInteger,
  toOptionalTrimmedString,
} from "@/lib/api";
import {
  checkRateLimit,
  rateLimitHeaders,
  rateLimitResponse,
} from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit(req, {
      keyPrefix: "user-repo-settings",
      limit: 30,
      windowMs: 60_000,
    });

    if (!rate.allowed) {
      return rateLimitResponse(rate);
    }

    const headers = rateLimitHeaders(rate);
    const { data, errorResponse } = await parseJsonBody<{
      repoId?: unknown;
      targetDomain?: unknown;
      globalInstructions?: unknown;
    }>(req);

    if (errorResponse || !data) {
      return errorResponse ?? apiError("Invalid request body", 400);
    }

    const repoId = toInteger(data.repoId);
    if (!repoId) {
      return apiError("A valid repoId is required", 400);
    }

    const result = await db
      .update(repositories)
      .set({
        targetDomain: toOptionalTrimmedString(data.targetDomain),
        globalInstructions: toOptionalTrimmedString(data.globalInstructions),
      })
      .where(eq(repositories.repoId, repoId))
      .returning();

    if (result.length === 0) {
      return apiError("Repository not found", 404);
    }

    return apiSuccess(result[0], { headers });
  } catch (error) {
    console.error("Failed to update repository settings", error);
    return apiError("Failed to update repository settings", 500);
  }
}
