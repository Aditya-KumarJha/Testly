import { cookies } from "next/headers";
import { apiSuccess } from "@/lib/api";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("gh_token")?.value;

  return apiSuccess({ connected: Boolean(token) });
}
