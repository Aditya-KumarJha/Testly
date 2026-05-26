import { db } from "@/db";
import { repositories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { repoId, targetDomain, globalInstructions } = await req.json();

  const result = await db
    ?.update(repositories)
    .set({
      targetDomain: targetDomain,
      globalInstructions: globalInstructions,
    })
    .where(eq(repositories.repoId, repoId))
    .returning();

  return NextResponse.json(result);
}
