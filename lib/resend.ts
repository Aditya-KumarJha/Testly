import { Resend } from "resend";
import { getRequiredEnv } from "@/lib/env";

export function getResendClient() {
  return new Resend(getRequiredEnv("RESEND_API_KEY"));
}
