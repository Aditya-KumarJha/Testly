import { cookies } from "next/headers";
import { apiError, apiSuccess } from "@/lib/api";
import type { RepositoryPayload } from "@/lib/types";

export async function GET() {
  try {
    const cookiesStore = await cookies();
    const token = cookiesStore.get("gh_token")?.value;

    if (!token) {
      return apiError("GitHub token not found", 401);
    }

    const allRepos: RepositoryPayload[] = [];
    let page = 1;

    while (true) {
      const res = await fetch(
        `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        },
      );

      if (!res.ok) {
        return apiError("Failed to fetch GitHub repositories", res.status);
      }

      const repos = await res.json();
      if (!Array.isArray(repos) || repos.length === 0) {
        break;
      }

      allRepos.push(
        ...repos.map((repo) => ({
          id: repo.id,
          repoId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          isPrivate: repo.private,
          htmlUrl: repo.html_url,
          description: repo.description ?? null,
          updatedAt: repo.updated_at,
          language: repo.language ?? null,
          defaultBranch: repo.default_branch,
          owner: repo.owner?.login ?? "",
        })),
      );
      page += 1;
    }

    return apiSuccess(allRepos);
  } catch (error) {
    console.error("Failed to load GitHub repositories", error);
    return apiError("Failed to load GitHub repositories", 500);
  }
}
