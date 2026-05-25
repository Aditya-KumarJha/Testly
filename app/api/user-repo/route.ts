import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { repositories } from "@/db/schema";

export async function POST(req: NextRequest) {
  const {
    repoId,
    userId,
    name,
    fullName,
    private_,
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
      private: private_ ? 1 : 0,
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
