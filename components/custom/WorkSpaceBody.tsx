"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserDetailContext } from "@/context/UserDetailContext";
import Image from "next/image";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import EmptyWorkspace from "./EmptyWorkspace";
import axios from "axios";
import RepoDialog from "./RepoDialog";
import UserRepoList from "./UserRepoList";
import type { GitHubProfile, SavedRepository } from "@/lib/types";
import {
  getClientCache,
  removeClientCache,
  setClientCache,
} from "@/lib/client-cache";
import { toast } from "sonner";
import {
  FolderKanban,
  Github,
  RefreshCcw,
  ShieldCheck,
  Users,
} from "lucide-react";

const GITHUB_CONNECTION_CACHE_KEY = "github-connection";
const GITHUB_PROFILE_CACHE_KEY = "github-profile";
const GITHUB_CONNECTION_TTL_MS = 5 * 60 * 1000;
const GITHUB_PROFILE_TTL_MS = 5 * 60 * 1000;
const USER_REPO_TTL_MS = 2 * 60 * 1000;

function getUserRepoCacheKey(userId: number) {
  return `user-repositories:${userId}`;
}

function getGithubErrorMessage(errorCode: string) {
  switch (errorCode) {
    case "missing_code":
      return "GitHub authorization was cancelled before a code was returned.";
    case "token_exchange_failed":
      return "GitHub connection failed during token exchange. Please try again.";
    case "server_error":
      return "GitHub connection hit a server error. Please retry in a moment.";
    default:
      return "Something went wrong while connecting your GitHub account.";
  }
}

function WorkSpaceBody() {
  const userContext = useContext(UserDetailContext);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [isRepoLoading, setIsRepoLoading] = useState(false);
  const [userRepoList, setUserRepoList] = useState<SavedRepository[]>([]);
  const [githubProfile, setGithubProfile] = useState<GitHubProfile | null>(null);
  const [hasHydratedCache, setHasHydratedCache] = useState(false);

  useEffect(() => {
    const cachedConnection = getClientCache<boolean>(GITHUB_CONNECTION_CACHE_KEY);
    if (cachedConnection !== null) {
      setIsGithubConnected(cachedConnection);
    }

    const cachedProfile = getClientCache<GitHubProfile>(GITHUB_PROFILE_CACHE_KEY);
    if (cachedProfile) {
      setGithubProfile(cachedProfile);
    }

    setHasHydratedCache(true);
    void getGithubConnectionStatus();
  }, []);

  useEffect(() => {
    if (!userContext?.userDetail?.id) {
      setUserRepoList([]);
      return;
    }

    void getUserRepoList();
  }, [userContext?.userDetail?.id]);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "true") {
      toast.success("GitHub connected successfully.");
      router.replace(pathname, { scroll: false });
      return;
    }

    if (error) {
      toast.error(getGithubErrorMessage(error));
      router.replace(pathname, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  const getGithubConnectionStatus = async () => {
    try {
      const response = await axios.get<{ data: { connected: boolean } }>(
        "/api/github/token",
      );
      const connected = response.data.data.connected;

      setIsGithubConnected(connected);
      setClientCache(
        GITHUB_CONNECTION_CACHE_KEY,
        connected,
        GITHUB_CONNECTION_TTL_MS,
      );

      if (connected) {
        void getGithubProfile();
      } else {
        setGithubProfile(null);
      }
    } catch (error) {
      console.error("Failed to load GitHub connection status", error);
      setIsGithubConnected(false);
      toast.error("Unable to verify GitHub connection right now.");
    }
  };

  const getGithubProfile = async () => {
    const cachedProfile = getClientCache<GitHubProfile>(GITHUB_PROFILE_CACHE_KEY);

    if (cachedProfile) {
      setGithubProfile(cachedProfile);
    }

    try {
      const response = await axios.get<{ data: GitHubProfile }>(
        "/api/github/profile",
      );
      setGithubProfile(response.data.data);
      setClientCache(
        GITHUB_PROFILE_CACHE_KEY,
        response.data.data,
        GITHUB_PROFILE_TTL_MS,
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to load GitHub profile", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setIsGithubConnected(false);
        removeClientCache(GITHUB_CONNECTION_CACHE_KEY);
        removeClientCache(GITHUB_PROFILE_CACHE_KEY);
        setGithubProfile(null);
        toast.error("GitHub session expired. Please reconnect.");
      } else {
        toast.error("Unable to load GitHub profile details.");
      }
      if (!cachedProfile) {
        setGithubProfile(null);
      }
      return null;
    }
  };

  const onAddRepo = async () => {
    router.push("/api/github");
  };

  const getUserRepoList = async () => {
    if (!userContext?.userDetail?.id) {
      return [];
    }

    const cacheKey = getUserRepoCacheKey(userContext.userDetail.id);
    const cachedRepos = getClientCache<SavedRepository[]>(cacheKey);

    if (cachedRepos) {
      setUserRepoList(cachedRepos);
    }

    setIsRepoLoading(true);

    try {
      const response = await axios.get<{ data: SavedRepository[] }>(
        `/api/user-repo?userId=${userContext.userDetail.id}`,
      );
      setUserRepoList(response.data.data);
      setClientCache(cacheKey, response.data.data, USER_REPO_TTL_MS);
      return response.data.data;
    } catch (error) {
      console.error("Failed to load user repositories", error);
      if (!cachedRepos) {
        setUserRepoList([]);
      }
      toast.error("Unable to load your repositories.");
      return [];
    } finally {
      setIsRepoLoading(false);
    }
  };

  const repoSummary = useMemo(
    () => [
      {
        title: "Connected Repositories",
        value: userRepoList.length,
        icon: <FolderKanban className="h-4 w-4 text-[#6D9846]" />,
      },
      {
        title: "GitHub Status",
        value: githubProfile?.login ? `@${githubProfile.login}` : isGithubConnected ? "Connected" : "Pending",
        icon: <Github className="h-4 w-4 text-slate-700" />,
      },
      {
        title: "Workspace Health",
        value: userRepoList.length > 0 ? "Ready" : "Setup Needed",
        icon: <ShieldCheck className="h-4 w-4 text-emerald-600" />,
      },
    ],
    [githubProfile?.login, isGithubConnected, userRepoList.length],
  );

  return (
    <div className="space-y-8">
      <section className="glass-panel hero-ring overflow-hidden rounded-4xl border border-white/80 px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#6D9846]">
              AI Testing Workspace
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Ship safer releases with clearer repository testing workflows.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Connect repositories, organize AI-assisted testing, and keep
              visibility on readiness from one focused QA workspace.
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-white/80 p-5 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
              Remaining Credits
            </p>
            <p className="mt-2 text-4xl font-semibold text-[#6D9846]">
              {userContext?.userDetail?.credits ?? 0}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Credits power repository analysis and upcoming execution runs.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {repoSummary.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                {item.icon}
                {item.title}
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Card className="glass-panel rounded-[28px] border border-white/80 p-4 shadow-lg shadow-emerald-100/40 sm:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              {githubProfile?.avatarUrl ? (
                <Image
                  src={githubProfile.avatarUrl}
                  alt={githubProfile.login}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-xl object-cover"
                />
              ) : (
                <Image src={"/github.png"} alt="GitHub" width={34} height={34} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {isGithubConnected
                  ? githubProfile?.name || githubProfile?.login || "GitHub Connected"
                  : "Connect GitHub and add a repository"}
              </h2>
              {isGithubConnected ? (
                <div className="mt-1 space-y-2">
                  <p className="text-sm text-slate-500">
                    {githubProfile?.bio ||
                      `@${githubProfile?.login ?? "github-user"} is connected and ready for repository sync.`}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    {githubProfile?.login && (
                      <a
                        href={githubProfile.htmlUrl}
                        rel="noreferrer"
                        target="_blank"
                        className="rounded-full bg-slate-100 px-2.5 py-1 font-medium transition hover:text-[#6D9846]"
                      >
                        @{githubProfile.login}
                      </a>
                    )}
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">
                      Total repos: {userRepoList.length}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">
                      Public repos: {githubProfile?.publicRepos ?? 0}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {githubProfile?.followers ?? 0} followers
                      </span>
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">
                      Following: {githubProfile?.following ?? 0}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-500">
                  Authorize GitHub once to pull repositories into this workspace.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              className="rounded-full border border-emerald-200 bg-white text-slate-700 shadow-none hover:bg-emerald-50"
              onClick={() => {
                void getGithubConnectionStatus();
                void getUserRepoList();
              }}
              variant="outline"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            {!isGithubConnected ? (
              <Button
                className="rounded-full bg-[#6D9846] px-5 hover:bg-[#5d873d]"
                onClick={onAddRepo}
              >
                + Add GitHub
              </Button>
            ) : (
              <RepoDialog onRepoAdded={getUserRepoList} />
            )}
          </div>
        </div>
      </Card>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Repositories
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Track connected codebases and prepare them for AI-generated tests.
            </p>
          </div>
          {hasHydratedCache && (
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
              {userRepoList.length} connected
            </span>
          )}
        </div>

        {!isRepoLoading && userRepoList.length === 0 ? (
          <Card className="glass-panel rounded-[28px] border border-white/80 shadow-lg shadow-emerald-100/30">
            <CardContent className="p-6 sm:p-8">
              <EmptyWorkspace />
            </CardContent>
          </Card>
        ) : (
          <UserRepoList repoList={userRepoList} setReload={() => void getUserRepoList()} />
        )}
      </section>
    </div>
  );
}

export default WorkSpaceBody;
