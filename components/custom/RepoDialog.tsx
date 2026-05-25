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

export type Repo = {
  id: number;
  name: string;
  fullName: string;
  isPrivate: boolean;
  htmlUrl: string;
  description: string;
  updatedAt: string;
  language: string;
  defaultBranch: string;
  owner: string;
};

function RepoDialog({ setRefreshPage }: { setRefreshPage: (refresh: boolean) => void }) {
  const [repoList, setRepoList] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { userDetail } = useContext(UserDetailContext);

  useEffect(() => {
    getRepoList();
  }, []);

  const getRepoList = async () => {
    const result = await axios.get("/api/github/repos");
    const repos = (await result.data).map((repo: any): Repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      isPrivate: repo.private,
      htmlUrl: repo.html_url,
      description: repo.description,
      updatedAt: repo.updated_at,
      language: repo.language,
      defaultBranch: repo.default_branch,
      owner: repo.owner,
    }));
    setRepoList(repos);
  };

  const filteredRepoList = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    if (!q) return repoList;
    return repoList.filter((repo) => repo.fullName.toLowerCase().includes(q));
  }, [searchTerm, repoList]);

  const saveRepoToDB = async () => {
    if (!selectedRepo) return;

    const result = await axios.post("/api/user-repo", {
      repoId: selectedRepo.id,
      userId: userDetail?.id,
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

    setIsOpen(false);
    setRefreshPage(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button>+ Add Repo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Repository</DialogTitle>
          <DialogDescription>
            Search and select one of your Github repositories.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Input
            placeholder="Search Repository..."
            className="mb-4"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ul className="max-h-60 overflow-y-auto border rounded-xl">
            {filteredRepoList.map((repo) => (
              <li key={repo.id} onClick={() => setSelectedRepo(repo)}>
                <h3
                  className={`p-4 border-b hover:bg-gray-100 cursor-pointer ${selectedRepo?.id === repo.id ? "bg-gray-200" : ""}`}
                >
                  {repo.fullName}
                </h3>
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter className="flex gap-5">
          <DialogClose>Cancel</DialogClose>
          <Button onClick={() => saveRepoToDB()}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RepoDialog;
