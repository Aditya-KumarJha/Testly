import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api";

export async function POST() {
  try {
    const user = await currentUser();

    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) {
      return apiError("Missing email", 400);
    }

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

      return apiSuccess(newUser[0]);
    }

    return apiSuccess(userResult[0]);
  } catch (e) {
    console.error("Error creating user", e);
    return apiError("Failed to create or load user", 500);
  }
}
