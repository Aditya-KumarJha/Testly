import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import type { GitHubProfile } from "@/lib/types";

export async function GET() {
  try {
    const cookiesStore = await cookies();
    const token = cookiesStore.get("gh_token")?.value;

    if (!token) {
      return apiError("GitHub token not found", 401);
    }

    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const errorResponse = NextResponse.json(
          { error: "GitHub token expired or revoked" },
          { status: 401 },
        );
        errorResponse.cookies.set("gh_token", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 0,
          path: "/",
          sameSite: "lax",
        });
        return errorResponse;
      }

      return apiError("Failed to fetch GitHub profile", response.status);
    }

    const profile = await response.json();

    const payload: GitHubProfile = {
      id: profile.id,
      login: profile.login,
      name: profile.name ?? null,
      avatarUrl: profile.avatar_url,
      htmlUrl: profile.html_url,
      bio: profile.bio ?? null,
      followers: profile.followers ?? 0,
      following: profile.following ?? 0,
      publicRepos: profile.public_repos ?? 0,
    };

    return apiSuccess(payload);
  } catch (error) {
    console.error("Failed to load GitHub profile", error);
    return apiError("Failed to load GitHub profile", 500);
  }
}
