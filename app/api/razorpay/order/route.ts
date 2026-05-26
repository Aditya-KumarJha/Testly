import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
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
      planId?: unknown;
      userId?: unknown;
    }>(req);

    if (errorResponse || !data) {
      return errorResponse ?? apiError("Invalid request body", 400);
    }

    const planId = toTrimmedString(data.planId) as keyof typeof PLANS;
    const userId = toInteger(data.userId);

    if (!planId || !userId) {
      return apiError("planId and userId are required", 400);
    }

    const plan = PLANS[planId];
    if (!plan) {
      return apiError("Invalid planId specified", 400);
    }

    // Verify user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return apiError("User not found", 404);
    }

    const keyId = getRequiredEnv("RZP_KEY_ID");
    const keySecret = getRequiredEnv("RZP_KEY_SECRET");

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: plan.price * 100, // Razorpay expects amount in paise (INR)
        currency: "INR",
        receipt: `receipt_u${userId}_${Date.now()}`,
      }),
    });

    if (!rzpResponse.ok) {
      const errorText = await rzpResponse.text();
      console.error("Razorpay order creation failed:", errorText);
      return apiError("Failed to create order with payment gateway", 502);
    }

    const orderData = (await rzpResponse.json()) as { id: string; amount: number; currency: string };

    return apiSuccess({
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      keyId, // Send keyId to frontend so it can open the modal
    });
  } catch (error) {
    console.error("Razorpay Order Endpoint Error:", error);
    return apiError("Internal server error", 500);
  }
}
