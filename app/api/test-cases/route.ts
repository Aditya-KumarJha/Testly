import { db } from "@/db";
import { TestCasesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const repoId = searchParams.get("repoId")?.trim();

    if (!repoId) {
      return apiError("repoId is required", 400);
    }

    const result = await db
      .select()
      .from(TestCasesTable)
      .where(eq(TestCasesTable.repoId, repoId));

    return apiSuccess(result);
  } catch (error) {
    console.error("Failed to fetch test cases", error);
    return apiError("Failed to fetch test cases", 500);
  }
}
