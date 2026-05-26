import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { apiError, apiSuccess, parseJsonBody, toInteger, toTrimmedString } from "@/lib/api";
import { getRequiredEnv } from "@/lib/env";

const PLANS = {
  basic: { price: 199, credits: 100 },
  intermediate: { price: 499, credits: 600 },
  pro: { price: 999, credits: 2000 },
};

export async function POST(req: NextRequest) {
  try {
    const { data, errorResponse } = await parseJsonBody<{
      razorpay_payment_id?: unknown;
      razorpay_order_id?: unknown;
      razorpay_signature?: unknown;
      userId?: unknown;
      planId?: unknown;
    }>(req);

    if (errorResponse || !data) {
      return errorResponse ?? apiError("Invalid request body", 400);
    }

    const paymentId = toTrimmedString(data.razorpay_payment_id);
    const orderId = toTrimmedString(data.razorpay_order_id);
    const signature = toTrimmedString(data.razorpay_signature);
    const userId = toInteger(data.userId);
    const planId = toTrimmedString(data.planId) as keyof typeof PLANS;

    if (!paymentId || !orderId || !signature || !userId || !planId) {
      return apiError("Missing required parameters for verification", 400);
    }

    const plan = PLANS[planId];
    if (!plan) {
      return apiError("Invalid planId specified", 400);
    }

    const keySecret = getRequiredEnv("RZP_KEY_SECRET");

    // Verify signature: HMAC SHA256 of orderId + "|" + paymentId using RZP_KEY_SECRET
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== signature) {
      console.error("Signature verification mismatch!");
      return apiError("Payment signature verification failed", 400);
    }

    // Update user credits
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return apiError("User not found", 404);
    }

    const updatedCredits = user.credits + plan.credits;

    await db
      .update(users)
      .set({ credits: updatedCredits })
      .where(eq(users.id, userId));

    return apiSuccess({
      message: "Payment verified and credits added successfully.",
      creditsAdded: plan.credits,
      totalCredits: updatedCredits,
    });
  } catch (error) {
    console.error("Razorpay Verification Endpoint Error:", error);
    return apiError("Internal server error", 500);
  }
}
