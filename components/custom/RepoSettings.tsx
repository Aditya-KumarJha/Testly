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
import { Settings, Settings2 } from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { DialogClose } from "@radix-ui/react-dialog";
import type { SavedRepository } from "@/lib/types";
import { useState } from "react";
import axios from "axios";

type Props = {
  repo: SavedRepository;
  setReload: () => void;
};

function RepoSettings({ repo, setReload }: Props) {
  const [open, setOpen] = useState(false);
  const [repoSettings, setRepoSettings] = useState({
    targetDomain: repo.targetDomain || "",
    globalInstructions: repo.globalInstructions || "",
  });

  const handleSaveSettings = async () => {
    await axios.post("/api/user-repo/settings", {
      repoId: repo.repoId,
      targetDomain: repoSettings.targetDomain,
      globalInstructions: repoSettings.globalInstructions,
    });

    setReload();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Settings2 className="h-4 w-4 mr-2" />
          Project Configuration
        </Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {" "}
            <Settings className="h-4 w-4 mr-2 text-primary" />
            Project / Repository Settings
          </DialogTitle>
          <DialogDescription>
            Configure project - level defaults used during script generation and
            execution.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="mt-4">
            <label className="text-gray-500">APP URL / DEFAULT WEBSITE</label>
            <Input
              className="mt-1"
              placeholder="app url / domain"
              value={repoSettings.targetDomain}
              onFocus={(event) => {
                const cursorPosition = event.currentTarget.value.length;
                event.currentTarget.setSelectionRange(
                  cursorPosition,
                  cursorPosition,
                );
              }}
              onChange={(e) =>
                setRepoSettings({
                  ...repoSettings,
                  targetDomain: e.target.value,
                })
              }
            />
            <p className="text-sm text-muted-foreground mt-2">
              The target address where automated headless browser will connect
              and run test cases.
            </p>
          </div>
          <div className="mt-4">
            <label className="text-gray-500">GLOBAL TEST INSTRUCTIONS</label>
            <Textarea
              className="mt-1"
              placeholder="global test instructions"
              value={repoSettings.globalInstructions}
              onChange={(e) =>
                setRepoSettings({
                  ...repoSettings,
                  globalInstructions: e.target.value,
                })
              }
            />
            <p className="text-sm text-muted-foreground mt-2">
              Include any authentication credentials, cookies setup or teardown
              instructions.
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSaveSettings}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RepoSettings;
