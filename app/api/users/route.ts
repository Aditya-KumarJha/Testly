import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function POST(req: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  try {
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (userResult.length === 0) {
      const newUser = await db
        .insert(users)
        .values({
          email,
          name: user.fullName ?? "New User",
        })
        .returning();

      return NextResponse.json({ user: newUser[0] });
    } else {
      return NextResponse.json({ user: userResult[0] });
    }
  } catch (e) {
    console.log("Error creating User: ", e);
    return NextResponse.json(
      { error: "Failed to create new user" },
      { status: 500 },
    );
  }
}
