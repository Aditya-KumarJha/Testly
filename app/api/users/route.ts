import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api";
import { publishToQueue } from "@/lib/rabbitmq";
import {
  checkRateLimit,
  rateLimitHeaders,
  rateLimitResponse,
} from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit(req, {
      keyPrefix: "users-post",
      limit: 30,
      windowMs: 60_000,
    });

    if (!rate.allowed) {
      return rateLimitResponse(rate);
    }

    const headers = rateLimitHeaders(rate);
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

      // Publish USER_LOGIN (Welcome) event to RabbitMQ
      await publishToQueue("USER_LOGIN", {
        email: newUser[0].email,
        name: newUser[0].name || "New User",
      });

      return apiSuccess(newUser[0], { headers });
    }

    return apiSuccess(userResult[0], { headers });
  } catch (e) {
    console.error("Error creating user", e);
    return apiError("Failed to create or load user", 500);
  }
}
