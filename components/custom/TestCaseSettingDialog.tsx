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
import { SettingsIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { DialogClose } from "@radix-ui/react-dialog";
import type { TestCase } from "@/lib/types";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

type Props = {
  testCase?: TestCase;
  setReload: (repoId: string) => void;
};

function TestCaseSettingDialog({ testCase, setReload }: Props) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formTestCase, setFormTestCase] = useState({
    title: testCase?.title || "",
    description: testCase?.description || "",
    targetRoute: testCase?.targetRoute || "",
    expectedResult: testCase?.expectedResult || "",
  });

  useEffect(() => {
    setFormTestCase({
      title: testCase?.title || "",
      description: testCase?.description || "",
      targetRoute: testCase?.targetRoute || "",
      expectedResult: testCase?.expectedResult || "",
    });
  }, [testCase]);

  const updateCase = async () => {
    setIsSaving(true);

    try {
      await axios.post("/api/test-cases/settings", {
        ...formTestCase,
        testCaseId: testCase?.id,
      });
      if (testCase?.repoId) {
        setReload(testCase.repoId);
      }
      setOpen(false);
      toast.success("Test case updated.");
    } catch (error) {
      console.error("Failed to update test case", error);
      toast.error("Unable to update that test case.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"icon"} variant={"outline"}>
          <SettingsIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Edit Testing Requirements</DialogTitle>
          <DialogDescription>
            Modify the testing requirements for this test case. You can change
            the type, priority, or any specific instructions related to this
            test case.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="mt-5">
            <label className="text-gray-500">TEST TITLE</label>
            <Input
              placeholder="Enter test title"
              className="mt-1"
              value={formTestCase?.title}
              onFocus={(event) => {
                const cursorPosition = event.currentTarget.value.length;
                event.currentTarget.setSelectionRange(
                  cursorPosition,
                  cursorPosition,
                );
              }}
              onChange={(e) =>
                setFormTestCase({ ...formTestCase, title: e.target.value })
              }
            />
          </div>
          <div className="mt-4">
            <label className="text-gray-500">DESCRIPTION / ACTION</label>
            <Textarea
              placeholder="Enter test description"
              className="mt-1"
              value={formTestCase?.description}
              onChange={(e) =>
                setFormTestCase({
                  ...formTestCase,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div className="mt-4">
            <label className="text-gray-500">TARGET ROUTE / PATH</label>
            <Input
              placeholder="Enter target route"
              className="mt-1"
              value={formTestCase?.targetRoute}
              onChange={(e) =>
                setFormTestCase({
                  ...formTestCase,
                  targetRoute: e.target.value,
                })
              }
            />
          </div>
          <div className="mt-4">
            <label className="text-gray-500">EXPECTED RESULT</label>
            <Textarea
              placeholder="Enter expected result"
              className="mt-1"
              value={formTestCase?.expectedResult}
              onChange={(e) =>
                setFormTestCase({
                  ...formTestCase,
                  expectedResult: e.target.value,
                })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>Cancel</Button>
          </DialogClose>
          <Button disabled={isSaving} onClick={updateCase}>
            {isSaving ? "Updating..." : "Update Case"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TestCaseSettingDialog;
