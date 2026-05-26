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
  ExternalLink,
  GitBranch,
  Globe,
  Link2Icon,
  ListChecks,
  Loader2,
  Loader2Icon,
  Lock,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";
import StatusCard from "./StatusCard";
import type { SavedRepository, TestCase } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";
import axios from "axios";
import { useContext, useState } from "react";
import { UserDetailContext } from "@/context/UserDetailContext";
import TestCaseList from "./TestCaseList";
import RepoSettings from "./RepoSettings";
import TestExecutionModal from "./TestCaseExecutionModel";

type Props = {
  repoList: SavedRepository[];
  setReload: () => void;
};


type StatusData = {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
};

function UserRepoList({ repoList, setReload }: Props) {
  const userContext = useContext(UserDetailContext);
  const [loading, setLoading] = useState(false);
  const [testCasesLoading, setTestCasesLoading] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isRunnerOpen, setIsRunnerOpen] = useState(false);
  const [runnerTestCases, setRunnerTestCases] = useState<TestCase[]>([]);
  const [runnerRepo, setRunnerRepo] = useState<SavedRepository | null>(null);
  const [statusData, setStatusData] = useState<StatusData>({
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    passRate: 0,
  });

  const handleGenerateTestCases = async (repo: SavedRepository) => {
    setLoading(true);
    try {
      const result = await axios.post("/api/generate-test-cases", {
        userId: userContext?.userDetail?.id,
        repoId: repo?.repoId,
        owner: repo?.owner,
        repo: repo?.name,
        branch: repo?.defaultBranch,
      });

      console.log("Test case generation result:", result.data);
      if (repo?.repoId) {
        await getTestCases(String(repo.repoId));
      }
    } finally {
      setLoading(false);
    }
  };

  const getTestCases = async (repoId: string) => {
    setTestCasesLoading(true);
    setTestCases([]);

    const result = await axios.get(`/api/test-cases?repoId=${repoId}`);

    const userTestCases = result.data as TestCase[];
    const passedTests = userTestCases.filter((test) => test.status === "passed")
      .length;
    const failedTests = userTestCases.filter((test) => test.status === "failed")
      .length;
    const passRate =
      userTestCases.length > 0
        ? Math.round((passedTests / userTestCases.length) * 100)
        : 0;

    setStatusData({
      totalTests: result.data.length,
      passedTests: passedTests,
      failedTests: failedTests,
      passRate: passRate,
    });
    
    setTestCases(result.data);
    setTestCasesLoading(false);
  };

  return (
    <>
      <Accordion
      type="single"
      collapsible
      className="space-y-4"
      onValueChange={(value) => {
        if (value) {
          void getTestCases(value);
        }
      }}
    >
      {repoList.map((repo) => (
        <AccordionItem
          key={repo.id}
          value={repo.repoId.toString()}
          className="glass-panel hero-ring rounded-[26px] border border-white/80 px-5 shadow-lg shadow-emerald-100/20"
        >
          <AccordionTrigger>
            <div className="flex flex-1 flex-col gap-4 pr-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <Image
                    src={"/github.png"}
                    alt="GitHub"
                    width={26}
                    height={26}
                  />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                      {repo.fullName}
                    </h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {repo.private ? (
                        <span className="inline-flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Private
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          Public
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="max-w-2xl text-sm text-slate-500">
                    {repo.description ||
                      "No description available for this repository."}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">
                      <span className="inline-flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        {repo.defaultBranch}
                      </span>
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">
                      {repo.language ?? "Unknown stack"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">
                      Owner: {repo.owner}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">
                      {formatRelativeDate(repo.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center">
                <a
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-emerald-200 hover:text-[#6D9846]"
                  href={repo.htmlUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Repo
                </a>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-5">
              <div className="bg-gray-50 p-3 border rounded-xl flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <Link2Icon className="h-5 w-5 text-primary" />
                  <h2>Target Domain: </h2>
                  <h2 className="bg-white p-1 px-2 border rounded-md text-primary font-medium">{repo?.targetDomain}</h2>
                </div>
                <RepoSettings repo={repo} setReload={setReload} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatusCard
                  title="Total Tests"
                  value={statusData?.totalTests}
                  icon={<ListChecks className="h-5 w-5 text-blue-600" />}
                  bgColor="bg-blue-50"
                />

                <StatusCard
                  title="Passed"
                  value={statusData?.passedTests}
                  icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
                  bgColor="bg-green-50"
                />

                <StatusCard
                  title="Failed"
                  value={statusData?.failedTests}
                  icon={<XCircle className="h-5 w-5 text-red-600" />}
                  bgColor="bg-red-50"
                />

                <StatusCard
                  title="Pass Rate"
                  value={`${statusData?.passRate}%`}
                  icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
                  bgColor="bg-purple-50"
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="mt-0.5 h-5 w-5 text-[#6D9846]" />
                    <div>
                      <h3 className="font-medium text-slate-900">
                        Repository Readiness
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Repository metadata is connected and ready for the next
                        test-generation step. Branch, ownership, and update
                        history are now visible here for faster triage.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Activity
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {formatRelativeDate(repo.updatedAt)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Last synced branch: {repo.defaultBranch}
                  </p>
                </div>
              </div>

              {testCasesLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  <h2>Loading test cases...</h2>
                </div>
              ) : testCases.length > 0 ? (
                <TestCaseList
                  testCases={testCases}
                  onReload={(repoId: string) => getTestCases(repoId)}
                  onRunSelected={(selected) => {
                    setRunnerTestCases(selected);
                    setRunnerRepo(repo);
                    setIsRunnerOpen(true);
                  }}
                />
              ) : null}

              {testCases.length === 0 ? (
                <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-medium text-slate-900">
                      {loading
                        ? "Generating Test Cases..."
                        : "Generate AI Test Cases?"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Analyze this repository and generate automated test cases
                      using AI.
                    </p>
                  </div>

                  <Button
                    onClick={() => handleGenerateTestCases(repo)}
                    className="gap-2 rounded-full bg-[#6D9846] px-5 hover:bg-[#5d873d]"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Generate Test Cases
                  </Button>
                </div>
              ) : null}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
    <TestExecutionModal
      isOpen={isRunnerOpen}
      onClose={() => {
        setIsRunnerOpen(false);
        if (runnerRepo?.repoId) {
          void getTestCases(String(runnerRepo.repoId));
        }
      }}
      testCases={runnerTestCases}
      repository={runnerRepo}
    />
  </>
  );
}

export default UserRepoList;
