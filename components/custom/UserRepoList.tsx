import type { Repo } from "./RepoDialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { Button } from "../ui/button";
import {
  CheckCircle2,
  ListChecks,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";
import StatusCard from "./StatusCard";

type props = {
  repoList: Repo[];
};

function UserRepoList({ repoList }: props) {
  const totalTests = 120;
  const passedTests = 100;
  const failedTests = 20;
  const passRate =
    totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  return (
    <div className="mt-10">
      <h2 className="my-3 font-semibold">REPOSITORIES</h2>
      {repoList.map((repo, index) => (
        <Accordion
          key={repo.id}
          type="single"
          collapsible
          className="border px-5 rounded-xl"
        >
          <AccordionItem value={`repo-${repo.id}`}>
            <AccordionTrigger>
              <div className="flex items-center gap-5">
                <Image
                  src={"/github.png"}
                  alt="GitHub"
                  width={30}
                  height={30}
                  className="inline-block mr-2"
                />
                <div className="flex flex-col items-start gap-1">
                  <h2>{repo.fullName}</h2>
                  <p className="text-sm text-gray-500">
                    {repo.defaultBranch} {repo.language} Updated at{" "}
                    {new Date(repo.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatusCard
                    title="Total Tests"
                    value={totalTests}
                    icon={<ListChecks className="h-5 w-5 text-blue-600" />}
                    bgColor="bg-blue-50"
                  />

                  <StatusCard
                    title="Passed"
                    value={passedTests}
                    icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
                    bgColor="bg-green-50"
                  />

                  <StatusCard
                    title="Failed"
                    value={failedTests}
                    icon={<XCircle className="h-5 w-5 text-red-600" />}
                    bgColor="bg-red-50"
                  />

                  <StatusCard
                    title="Pass Rate"
                    value={`${passRate}%`}
                    icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
                    bgColor="bg-purple-50"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border rounded-xl p-4 bg-gray-50">
                  <div>
                    <h3 className="font-medium">Generate AI Test Cases</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Analyze this repository and generate automated test cases
                      using AI.
                    </p>
                  </div>

                  <Button className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate Test Cases
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
}

export default UserRepoList;
