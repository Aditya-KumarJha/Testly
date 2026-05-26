import { Play, RefreshCw } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { TestCase } from "./UserRepoList";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import TestCaseSettingDialog from "./TestCaseSettingDialog";

type Props = {
  testCases: TestCase[];
  onReload: (repoId: number) => void;
};

function TestCaseList({ testCases, onReload }: Props) {
  const [selectedTestCases, setSelectedTestCases] = useState<TestCase[]>([]);

  const handleSelectedTestCase = (
    checked: boolean | string,
    testCase: TestCase,
  ) => {
    if (checked) {
      setSelectedTestCases((prev: any) => [...(prev || []), testCase]);
    } else {
      setSelectedTestCases((prev: any) =>
        prev?.filter((t: TestCase) => t.id !== testCase.id),
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
            key={index}
            className="p-4 border-b flex items-center justify-between"
          >
            <div className="flex gap-3 items-center">
              <Checkbox
                checked={selectedTestCases?.some((item:any) => item.id === testCase?.id)}
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
            <div className="flex gap-4">
              <Badge variant={"secondary"}>{testCase?.type}</Badge>
              <Badge variant={"secondary"}>Pending</Badge>
              <Badge variant={"secondary"}>{testCase?.priority}</Badge>
              <TestCaseSettingDialog testCase={testCase} setReload={onReload} />
            </div>
          </div>
        ))}
        <div className="p-4 flex items-center justify-between bg-gray-100">
          <h2>Run Selected Test Cases</h2>
          <Button disabled={!selectedTestCases?.length}>
            {" "}
            <Play className="w-4 h-4 mr-2" /> Run Selected
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TestCaseList;
