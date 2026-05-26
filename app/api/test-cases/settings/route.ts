import { db } from "@/db";
import { TestCasesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import {
  apiError,
  apiSuccess,
  parseJsonBody,
  toInteger,
  toOptionalTrimmedString,
  toTrimmedString,
} from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const { data, errorResponse } = await parseJsonBody<{
      title?: unknown;
      description?: unknown;
      targetRoute?: unknown;
      expectedResult?: unknown;
      testCaseId?: unknown;
    }>(req);

    if (errorResponse || !data) {
      return errorResponse ?? apiError("Invalid request body", 400);
    }

    const testCaseId = toInteger(data.testCaseId);
    if (!testCaseId) {
      return apiError("A valid testCaseId is required", 400);
    }

    const title = toTrimmedString(data.title);
    const description = toTrimmedString(data.description);
    const expectedResult = toTrimmedString(data.expectedResult);

    if (!title || !description || !expectedResult) {
      return apiError("Title, description, and expected result are required", 400);
    }

    const result = await db
      .update(TestCasesTable)
      .set({
        title,
        description,
        targetRoute: toOptionalTrimmedString(data.targetRoute),
        expectedResult,
      })
      .where(eq(TestCasesTable.id, testCaseId))
      .returning();

    if (result.length === 0) {
      return apiError("Test case not found", 404);
    }

    return apiSuccess(result[0]);
  } catch (error) {
    console.error("Failed to update test case", error);
    return apiError("Failed to update test case", 500);
  }
}
