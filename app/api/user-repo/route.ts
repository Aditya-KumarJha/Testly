import { NextRequest } from "next/server";
import { db } from "@/db";
import { repositories } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { apiError, apiSuccess } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const repoId = Number(body.repoId);
    const userId = Number(body.userId);
    const updatedAt = new Date(body.updatedAt);

    if (!Number.isInteger(repoId) || !Number.isInteger(userId)) {
      return apiError("Invalid repository or user identifier", 400);
    }

    if (
      !body.name ||
      !body.fullName ||
      !body.htmlUrl ||
      !body.defaultBranch ||
      !body.owner
    ) {
      return apiError("Missing required repository fields", 400);
    }

    if (Number.isNaN(updatedAt.getTime())) {
      return apiError("Invalid repository update timestamp", 400);
    }

    const existingRepository = await db
      .select()
      .from(repositories)
      .where(
        and(
          eq(repositories.userId, userId),
          eq(repositories.repoId, repoId),
        ),
      );

    if (existingRepository.length > 0) {
      return apiSuccess(existingRepository[0]);
    }

    const result = await db
      .insert(repositories)
      .values({
        repoId,
        userId,
        name: body.name,
        fullName: body.fullName,
        private: body.isPrivate ? 1 : 0,
        htmlUrl: body.htmlUrl,
        description: body.description ?? null,
        updatedAt,
        language: body.language ?? null,
        defaultBranch: body.defaultBranch,
        owner: body.owner,
      })
      .returning();

    return apiSuccess(result[0], { status: 201 });
  } catch (error) {
    console.error("Failed to save repository", error);
    return apiError("Failed to save repository", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get("userId"));

    if (!Number.isInteger(userId)) {
      return apiError("A valid userId query parameter is required", 400);
    }

    const result = await db
      .select()
      .from(repositories)
      .where(eq(repositories.userId, userId));

    return apiSuccess(result);
  } catch (error) {
    console.error("Failed to fetch repositories", error);
    return apiError("Failed to fetch repositories", 500);
  }
}
