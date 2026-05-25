import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import axios from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { Input } from "../ui/input";
import { UserDetailContext } from "@/context/UserDetailContext";
import type { GitHubRepository } from "@/lib/types";
import {
  getClientCache,
  removeClientCache,
  setClientCache,
} from "@/lib/client-cache";
import { toast } from "sonner";
import { Github, Lock, Search } from "lucide-react";

const GITHUB_REPOSITORY_CACHE_KEY = "github-repositories";
const GITHUB_REPOSITORY_TTL_MS = 10 * 60 * 1000;

function getUserRepoCacheKey(userId: number) {
  return `user-repositories:${userId}`;
}

function RepoDialog({ onRepoAdded }: { onRepoAdded: () => Promise<unknown> }) {
  const [repoList, setRepoList] = useState<GitHubRepository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const userContext = useContext(UserDetailContext);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const cachedRepos = getClientCache<GitHubRepository[]>(
      GITHUB_REPOSITORY_CACHE_KEY,
    );
    if (cachedRepos) {
      setRepoList(cachedRepos);
    }

    void getRepoList();
  }, [isOpen]);

  const getRepoList = async () => {
    setIsLoadingRepos(true);

    try {
      const response = await axios.get<{ data: GitHubRepository[] }>(
        "/api/github/repos",
      );
      setRepoList(response.data.data);
      setClientCache(
        GITHUB_REPOSITORY_CACHE_KEY,
        response.data.data,
        GITHUB_REPOSITORY_TTL_MS,
      );
    } catch (error) {
      console.error("Failed to load GitHub repositories", error);
      if (!getClientCache<GitHubRepository[]>(GITHUB_REPOSITORY_CACHE_KEY)) {
        setRepoList([]);
      }
      toast.error("Unable to load GitHub repositories.");
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const filteredRepoList = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    if (!q) return repoList;
    return repoList.filter((repo) => repo.fullName.toLowerCase().includes(q));
  }, [searchTerm, repoList]);

  const saveRepoToDB = async () => {
    if (!selectedRepo || !userContext?.userDetail?.id) {
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post("/api/user-repo", {
        repoId: selectedRepo.repoId,
        userId: userContext.userDetail.id,
        name: selectedRepo.name,
        fullName: selectedRepo.fullName,
        isPrivate: selectedRepo.isPrivate,
        htmlUrl: selectedRepo.htmlUrl,
        description: selectedRepo.description,
        updatedAt: selectedRepo.updatedAt,
        language: selectedRepo.language,
        defaultBranch: selectedRepo.defaultBranch,
        owner: selectedRepo.owner,
      });

      removeClientCache(getUserRepoCacheKey(userContext.userDetail.id));
      setIsOpen(false);
      setSelectedRepo(null);
      toast.success(`${selectedRepo.fullName} added to your workspace.`);
      await onRepoAdded();
    } catch (error) {
      console.error("Failed to save repository", error);
      toast.error("Unable to add that repository right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-[#6D9846] px-5 hover:bg-[#5d873d]">
          + Add Repo
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/80 bg-white/95 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Repository</DialogTitle>
          <DialogDescription>
            Search and select one of your GitHub repositories.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search repository name..."
              className="h-11 rounded-xl border-slate-200 pl-10"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
          </div>
          <ul className="max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/70 p-2">
            {filteredRepoList.map((repo) => (
              <li key={repo.id}>
                <button
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedRepo?.id === repo.id
                      ? "border-emerald-200 bg-emerald-50 shadow-sm"
                      : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedRepo(repo)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Github className="h-4 w-4 text-slate-600" />
                        <p className="truncate font-medium text-slate-900">
                          {repo.fullName}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {repo.description || "No repository description yet."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {repo.defaultBranch}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {repo.language || "Unknown stack"}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {repo.owner}
                        </span>
                      </div>
                    </div>

                    {repo.isPrivate && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        <Lock className="h-3 w-3" />
                        Private
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
            {!isLoadingRepos && filteredRepoList.length === 0 && (
              <li className="p-4 text-sm text-gray-500">
                No repositories found.
              </li>
            )}
            {isLoadingRepos && (
              <li className="p-4 text-sm text-slate-500">
                Loading repositories...
              </li>
            )}
          </ul>
        </div>
        <DialogFooter className="flex gap-5">
          <DialogClose>Cancel</DialogClose>
          <Button
            disabled={!selectedRepo || isSubmitting}
            onClick={saveRepoToDB}
          >
            {isSubmitting ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RepoDialog;
