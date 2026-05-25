import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { repositories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const {
    repoId,
    userId,
    name,
    fullName,
    isPrivate,
    htmlUrl,
    description,
    updatedAt,
    language,
    defaultBranch,
    owner,
  } = await req.json();

  const result = await db
    .insert(repositories)
    .values({
      repoId,
      userId,
      name,
      fullName,
      private: isPrivate ? 1 : 0,
      htmlUrl,
      description,
      updatedAt: new Date(updatedAt),
      language,
      defaultBranch,
      owner,
    })
    .returning();

  return NextResponse.json(result[0]);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const result = await db
    .select()
    .from(repositories)
    .where(eq(repositories.userId, Number(userId)));

  return NextResponse.json(result);
}
