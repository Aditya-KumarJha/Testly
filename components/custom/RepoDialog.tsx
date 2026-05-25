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

type Repo = {
  id: number;
  name: string;
  full_name: string;
  private_: boolean;
  html_url: string;
  description: string;
  updated_at: string;
  language: string;
  default_branch: string;
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
    const repos = await result.data;
    setRepoList(repos);
  };

  const filteredRepoList = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    if (!q) return repoList;
    return repoList.filter((repo) => repo.full_name.toLowerCase().includes(q));
  }, [searchTerm, repoList]);

  const saveRepoToDB = async () => {
    if (!selectedRepo) return;

    const result = await axios.post("/api/user-repo", {
      repoId: selectedRepo.id,
      userId: userDetail?.id,
      name: selectedRepo.name,
      fullName: selectedRepo.full_name,
      private: selectedRepo.private_,
      htmlUrl: selectedRepo.html_url,
      description: selectedRepo.description,
      updatedAt: selectedRepo.updated_at,
      language: selectedRepo.language,
      defaultBranch: selectedRepo.default_branch,
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
                  {repo.full_name}
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
