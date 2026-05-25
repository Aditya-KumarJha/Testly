import { NextRequest, NextResponse } from "next/server";
import { getRequiredEnv } from "@/lib/env";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(
        new URL("/workspace?error=missing_code", req.url),
      );
    }

    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: getRequiredEnv("GITHUB_CLIENT_ID"),
        client_secret: getRequiredEnv("GITHUB_CLIENT_SECRET"),
        code,
        redirect_uri: getRequiredEnv("GITHUB_REDIRECT_URI"),
      }),
    });

    if (!res.ok) {
      return NextResponse.redirect(
        new URL("/workspace?error=token_exchange_failed", req.url),
      );
    }

    const data = await res.json();
    const token = data.access_token;

    if (!token) {
      return NextResponse.redirect(
        new URL("/workspace?error=token_exchange_failed", req.url),
      );
    }

    const response = NextResponse.redirect(
      new URL("/workspace?success=true", req.url),
    );

    response.cookies.set("gh_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("GitHub callback failed", error);
    return NextResponse.redirect(
      new URL("/workspace?error=server_error", req.url),
    );
  }
}
