import { Play, RefreshCw, Zap, Sparkles, Loader2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { TestCase } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import TestCaseSettingDialog from "./TestCaseSettingDialog";
import { toast } from "sonner";

type Props = {
  testCases: TestCase[];
  onReload: (repoId: string) => void;
  onRunSelected: (testCases: TestCase[]) => void;
  onRegenerate?: () => void;
  generating?: boolean;
};

function TestCaseList({ testCases, onReload, onRunSelected, onRegenerate, generating }: Props) {
  const [selectedTestCases, setSelectedTestCases] = useState<TestCase[]>([]);

  useEffect(() => {
    setSelectedTestCases([]);
  }, [testCases]);

  const getPriorityCredits = (priority?: string) => {
    if (priority === "high") return 15;
    if (priority === "low") return 5;
    return 10; // medium
  };

  const handleSelectedTestCase = (
    checked: boolean | string,
    testCase: TestCase,
  ) => {
    if (checked) {
      setSelectedTestCases((prev) => [...prev, testCase]);
    } else {
      setSelectedTestCases((prev) =>
        prev.filter((t) => t.id !== testCase.id),
      );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-primary">
          Generated Test Cases
        </h2>
        <div className="flex gap-2">
          {onRegenerate && (
            <Button
              size={"sm"}
              className="rounded-lg bg-[#6D9846] hover:bg-[#5d873d] text-white flex gap-1.5 items-center shadow-xs"
              disabled={generating}
              onClick={onRegenerate}
            >
              {generating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {generating ? "Regenerating..." : "Regenerate Cases"}
            </Button>
          )}
          <Button
            size={"sm"}
            variant={"outline"}
            disabled={generating}
            onClick={() => {
              const repoId = testCases[0]?.repoId;
              if (repoId) {
                toast("Refreshing test cases...");
                onReload(repoId);
              }
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>
      <div className="border rounded-md mt-3">
        {testCases.map((testCase, index) => (
          <div
            key={testCase.id}
            className="p-4 border-b flex items-center justify-between"
          >
            <div className="flex gap-3 items-center">
              <Checkbox
                checked={selectedTestCases?.some(
                  (item) => item.id === testCase?.id,
                )}
                onCheckedChange={(checked) =>
                  handleSelectedTestCase(checked, testCase)
                }
              />
              <div>
                <h2>{testCase?.title}</h2>
                <p className="text-sm text-slate-500">
                  {testCase?.description}
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <Badge variant={"secondary"}>{testCase?.type}</Badge>
              <Badge variant="outline" className="flex items-center gap-1 border-amber-200 bg-amber-50/50 text-amber-700 font-medium">
                <Zap className="h-3 w-3 fill-current animate-pulse text-amber-500" />
                {getPriorityCredits(testCase?.priority)} credits
              </Badge>
              {testCase?.status == "failed" && (
                <Badge variant={"destructive"} className="text-red-200 font-normal">
                  {testCase?.status}
                </Badge>
              )}
              {testCase?.status == "passed" && (
                <Badge variant={"default"} className="text-green-200 font-normal bg-green-700">
                  {testCase?.status}
                </Badge>
              )}
              {testCase?.status == "running" && (
                <Badge variant={"default"} className="text-yellow-200 font-normal bg-yellow-700">
                  {testCase?.status}
                </Badge>
              )}
              <Badge variant={"secondary"}>{testCase?.priority}</Badge>
              <TestCaseSettingDialog testCase={testCase} setReload={onReload} />
            </div>
          </div>
        ))}
        <div className="p-4 flex items-center justify-between bg-gray-100">
          <h2>Run Selected Test Cases</h2>
          <Button
            disabled={!selectedTestCases?.length}
            onClick={() => {
              toast(`Opening runner for ${selectedTestCases.length} test case${selectedTestCases.length > 1 ? "s" : ""}.`);
              onRunSelected(selectedTestCases);
            }}
          >
            {" "}
            <Play className="w-4 h-4 mr-2" /> Run Selected
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TestCaseList;
