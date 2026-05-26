import { Play, RefreshCw } from "lucide-react";
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
};

function TestCaseList({ testCases, onReload, onRunSelected }: Props) {
  const [selectedTestCases, setSelectedTestCases] = useState<TestCase[]>([]);

  useEffect(() => {
    setSelectedTestCases([]);
  }, [testCases]);

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
        <Button
          size={"sm"}
          variant={"outline"}
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
