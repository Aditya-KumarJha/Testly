import { redirect } from "next/navigation";
import { getRequiredEnv } from "@/lib/env";

export async function GET() {
  const params = new URLSearchParams({
    client_id: getRequiredEnv("GITHUB_CLIENT_ID"),
    redirect_uri: getRequiredEnv("GITHUB_REDIRECT_URI"),
    scope: "repo read:user",
  });

  redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}
