import { apiError, apiSuccess, getErrorMessage } from "@/lib/api";
import { getResendClient } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();

    if (!to || !subject) {
      return apiError("Missing to or subject", 400);
    }

    const data = await getResendClient().emails.send({
      from: "Acme <onboarding@resend.dev>",
      to,
      subject,
      html: html || "<p>Hello from your Next.js Boilerplate!</p>",
    });

    return apiSuccess(data);
  } catch (error) {
    console.error("Failed to send email", error);
    return apiError(getErrorMessage(error), 500);
  }
}
