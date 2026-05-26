"use client";

import { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { TestCase } from "@/lib/types";
import {
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Terminal,
  ExternalLink,
  Globe,
  Code,
  PlayCircle,
  ChevronRight,
  Sparkles,
  Database,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Zap,
  Copy,
  FileDown,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { UserDetailContext } from "@/context/UserDetailContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  testCases: TestCase[];
  repository: any; // Connected repository config
};

type RunResult = {
  testCaseId: number;
  status: "idle" | "generating" | "running" | "passed" | "failed";
  logs: string[];
  error?: string;
  sessionId?: string;
  sessionUrl?: string;
  browserbaseScript?: string;
};

export default function TestExecutionModal({
  isOpen,
  onClose,
  testCases,
  repository,
}: Props) {
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000");
  const userContext = useContext(UserDetailContext);
  const [currentIdx, setCurrentIdx] = useState<number>(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<Record<number, RunResult>>({});
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Advanced Options states
  const [executionMode, setExecutionMode] = useState<"cache" | "generate">(
    "cache",
  );
  const [customPrompt, setCustomPrompt] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const getPriorityCredits = (priority?: string) => {
    if (priority === "high") return 15;
    if (priority === "low") return 5;
    return 10; // medium
  };

  // Initialize states when testCases change or modal opens
  useEffect(() => {
    if (isOpen && testCases.length > 0) {
      const initial: Record<number, RunResult> = {};
      testCases.forEach((tc) => {
        const tcStatus = (tc as any).status;
        const tcLogs = (tc as any).logs;
        const hasPreviousLogs = Array.isArray(tcLogs) && tcLogs.length > 0;

        initial[tc.id] = {
          testCaseId: tc.id,
          status:
            tcStatus === "passed" || tcStatus === "failed" ? tcStatus : "idle",
          logs: hasPreviousLogs ? tcLogs : ["Waiting to run..."],
          browserbaseScript: tc.browserbaseScript || undefined,
          sessionId:
            (tc as any).sessionId || (tc as any).session_id || undefined,
          sessionUrl:
            (tc as any).sessionUrl || (tc as any).session_url || undefined,
        };
      });
      setResults(initial);
      setSelectedDetailId(testCases[0].id);
      setCurrentIdx(-1);
      setIsExecuting(false);
      setCustomPrompt("");

      // Prefill with repository's saved website URL if available
      setBaseUrl(
        repository?.targetDomain ||
          repository?.websiteUrl ||
          "http://localhost:3000",
      );

      // Auto-detect if any selected testcase doesn't have a cached script.
      // If even one doesn't have a script, default to "generate" mode.
      const hasMissingScript = testCases.some((tc) => !tc.browserbaseScript);
      setExecutionMode(hasMissingScript ? "generate" : "cache");
    }
  }, [isOpen, testCases, repository]);

  // Handle executing the queue sequentially
  useEffect(() => {
    if (!isExecuting || currentIdx < 0 || currentIdx >= testCases.length) {
      if (currentIdx >= testCases.length) {
        const completedResults = Object.values(results);
        const passedCount = completedResults.filter(
          (result) => result.status === "passed",
        ).length;
        const failedCount = completedResults.filter(
          (result) => result.status === "failed",
        ).length;

        if (failedCount > 0) {
          toast.error(
            `Execution finished with ${passedCount} passed and ${failedCount} failed.`,
          );
        } else if (passedCount > 0) {
          toast.success(`Execution finished successfully. ${passedCount} test cases passed.`);
        }
        setIsExecuting(false);
      }
      return;
    }

    const runTest = async () => {
      const currentTestCase = testCases[currentIdx];
      const tcId = currentTestCase.id;

      setSelectedDetailId(tcId);

      const isRegenerating =
        executionMode === "generate" || !currentTestCase.browserbaseScript;

      setResults((prev) => ({
        ...prev,
        [tcId]: {
          ...prev[tcId],
          status: isRegenerating ? "generating" : "running",
          logs: [
            isRegenerating
              ? "[SYSTEM] Connecting to AI agent to analyze files and generate script..."
              : "[SYSTEM] Found pre-generated script cached in database, preparing execution...",
          ],
        },
      }));

      try {
        // Call run API with advanced flags
        const res = await axios.post("/api/test-cases/run", {
          testCaseId: tcId,
          baseUrl: baseUrl.trim(),
          mode: executionMode, // "cache" (direct run) or "generate" (regenerate)
          customPrompt: customPrompt.trim(),
        });

        const data = res.data;

        setResults((prev) => ({
          ...prev,
          [tcId]: {
            testCaseId: tcId,
            status: data.status,
            logs: data.logs || [],
            browserbaseScript: data.browserbaseScript,
            sessionId: data.sessionId,
            sessionUrl: data.sessionUrl,
            error: data.error,
          },
        }));
      } catch (err: any) {
        const errMsg =
          err.response?.data?.error || err.message || "Execution failed";
        setResults((prev) => ({
          ...prev,
          [tcId]: {
            ...prev[tcId],
            status: "failed",
            error: errMsg,
            logs: [...(prev[tcId]?.logs || []), `[SYSTEM ERROR] ${errMsg}`],
          },
        }));

        if (err.response?.status === 402 || errMsg.toLowerCase().includes("credits")) {
          toast.error("Execution stopped: Insufficient credits. Please buy credits.");
          setIsExecuting(false);
          setCurrentIdx(-1);
          return;
        }
      }

      // Sync credits in real-time
      try {
        const userRes = await axios.post<{ data: any }>("/api/users");
        if (userContext) {
          userContext.setUserDetail(userRes.data.data);
        }
      } catch (e) {
        console.error("Failed to sync credits:", e);
      }

      // Move to next item in the queue
      setCurrentIdx((prev) => prev + 1);
    };

    runTest();
  }, [isExecuting, currentIdx, testCases, baseUrl, executionMode, customPrompt, userContext]);

  const startExecution = () => {
    const trimmedBaseUrl = baseUrl.trim();

    if (!trimmedBaseUrl) {
      toast.error("Enter a target website URL before starting execution.");
      return;
    }

    try {
      new URL(trimmedBaseUrl);
    } catch {
      toast.error("Enter a valid absolute URL such as http://localhost:3000.");
      return;
    }

    // Reset all statuses
    const resetResults: Record<number, RunResult> = {};
    testCases.forEach((tc) => {
      resetResults[tc.id] = {
        testCaseId: tc.id,
        status: "idle",
        logs: ["Queued..."],
        browserbaseScript: tc.browserbaseScript || undefined,
      };
    });
    setResults(resetResults);
    setIsExecuting(true);
    setCurrentIdx(0);
    setSelectedDetailId(testCases[0].id);
    toast(`Execution started for ${testCases.length} test case${testCases.length > 1 ? "s" : ""}.`);
  };

  const stopExecution = () => {
    setIsExecuting(false);
    setCurrentIdx(-1);
    toast("Execution stopped.");
  };

  const currentSelectedResult = selectedDetailId
    ? results[selectedDetailId]
    : null;
  const currentSelectedTestCase = testCases.find(
    (tc) => tc.id === selectedDetailId,
  );

  const selectedCount = testCases.length;
  const hasExecutedResults = testCases.some(
    (tc) => results[tc.id]?.status && results[tc.id]?.status !== "idle",
  );

  const copyText = async (text: string, label: string) => {
    if (!text) {
      toast.error(`No ${label} available to copy.`);
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard.`);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error(`Failed to copy ${label}.`);
    }
  };

  const wrapText = (value: string, maxChars: number) => {
    const lines: string[] = [];
    const chunks = value.split("\n");

    chunks.forEach((chunk) => {
      if (!chunk) {
        lines.push("");
        return;
      }

      let current = "";
      chunk.split(" ").forEach((word) => {
        const next = current ? `${current} ${word}` : word;
        if (next.length > maxChars) {
          if (current) {
            lines.push(current);
            current = word;
          } else {
            lines.push(word);
            current = "";
          }
        } else {
          current = next;
        }
      });

      if (current) {
        lines.push(current);
      }
    });

    return lines;
  };

  const exportResultsToPdf = async () => {
    if (!hasExecutedResults) {
      toast.error("Run at least one test case before exporting results.");
      return;
    }

    try {
      setIsExporting(true);
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const margin = 48;
      const lineHeight = 14;
      const maxChars = 96;
      const pageSize: [number, number] = [612, 792];

      let page = pdfDoc.addPage(pageSize);
      let y = page.getHeight() - margin;

      const sanitizePdfText = (value: string) =>
        value
          .replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "")
          .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "");

      const addLine = (text: string, isBold = false) => {
        const safeText = sanitizePdfText(text);
        if (y < margin) {
          page = pdfDoc.addPage(pageSize);
          y = page.getHeight() - margin;
        }

        page.drawText(safeText, {
          x: margin,
          y,
          size: 11,
          font: isBold ? boldFont : font,
          color: rgb(0.15, 0.15, 0.15),
        });
        y -= lineHeight;
      };

      addLine("Testly AI - Test Execution Report", true);
      addLine(`Generated: ${new Date().toLocaleString()}`);
      addLine(`Target URL: ${baseUrl || "Not provided"}`);
      addLine(`Selected test cases: ${selectedCount}`);
      addLine(" ");

      testCases.forEach((tc, index) => {
        const result = results[tc.id];
        const status = result?.status || "idle";
        const logs = result?.logs || [];
        const script = result?.browserbaseScript || "";

        addLine(`${index + 1}. ${tc.title}`, true);
        wrapText(`Description: ${tc.description || "-"}`, maxChars).forEach(
          (line) => addLine(line),
        );
        wrapText(`Expected: ${tc.expectedResult || "-"}`, maxChars).forEach(
          (line) => addLine(line),
        );
        addLine(`Status: ${status}`);
        if (result?.sessionUrl) {
          wrapText(`Recording: ${result.sessionUrl}`, maxChars).forEach(
            (line) => addLine(line),
          );
        }

        if (script) {
          addLine("Generated Script:", true);
          wrapText(script, maxChars).forEach((line) => addLine(line));
        }

        if (logs.length > 0) {
          addLine("Console Output:", true);
          logs.forEach((log) => {
            wrapText(log, maxChars).forEach((line) => addLine(line));
          });
        }

        if (result?.error) {
          addLine(`Error: ${result.error}`);
        }

        addLine(" ");
      });

      const pdfBytes = await pdfDoc.save();
      const bytes = pdfBytes instanceof Uint8Array
        ? pdfBytes
        : new Uint8Array(pdfBytes);
      const safeBuffer = bytes.slice().buffer;
      const blob = new Blob([safeBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const fileName = `testly-results-${Date.now()}.pdf`;

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success("PDF export generated.");
    } catch (err) {
      console.error("Failed to export PDF:", err);
      toast.error("Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-6 gap-4 bg-white rounded-2xl shadow-2xl border overflow-hidden select-none">
        <DialogHeader className="border-b pb-4 flex flex-row items-center justify-between shrink-0">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <PlayCircle className="text-primary h-6 w-6" />
              Browserbase Cloud Test Runner
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">
              Run automation scripts completely in the cloud using Browserbase
              headless infrastructure.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Target Configuration Header */}
        <div className="flex flex-col bg-gray-50 p-4 rounded-2xl border border-gray-200/80 gap-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-primary" /> Target Website
                URL
              </label>
              <Input
                placeholder="e.g. http://localhost:3000"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                disabled={isExecuting}
                className="bg-white border-gray-300 font-mono text-sm shadow-xs h-10"
              />
            </div>
            <div className="flex gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOptions(!showOptions)}
                className={`h-10 px-4 font-medium text-xs gap-1.5 transition-colors border-gray-300 ${showOptions ? "bg-primary/5 text-primary border-primary/30" : ""}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Execution Options
                {showOptions ? (
                  <ChevronUp className="h-3 w-3 ml-0.5" />
                ) : (
                  <ChevronDown className="h-3 w-3 ml-0.5" />
                )}
              </Button>
              {!isExecuting ? (
                <Button
                  onClick={startExecution}
                  className="h-10 bg-primary hover:bg-primary/95 text-white shadow-md font-medium px-6 gap-2"
                >
                  <Play className="h-4 w-4 fill-white" /> Start Execution
                </Button>
              ) : (
                <Button
                  onClick={stopExecution}
                  variant="destructive"
                  className="h-10 px-6 font-medium gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" /> Stop Runner
                </Button>
              )}
            </div>
          </div>

          {/* Expandable Advanced Options Section */}
          {showOptions && (
            <div className="pt-3 border-t border-gray-200/60 grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Execution Mode Segment */}
              <div className="md:col-span-1 space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Run Mode
                </span>
                <div className="grid grid-cols-2 bg-gray-200/60 p-1 rounded-lg border border-gray-200">
                  <button
                    type="button"
                    disabled={isExecuting}
                    onClick={() => setExecutionMode("cache")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      executionMode === "cache"
                        ? "bg-white text-gray-800 shadow-xs"
                        : "text-gray-500 hover:text-gray-700"
                    } disabled:opacity-50`}
                  >
                    <Database className="h-3.5 w-3.5" /> Run Cached
                  </button>
                  <button
                    type="button"
                    disabled={isExecuting}
                    onClick={() => setExecutionMode("generate")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      executionMode === "generate"
                        ? "bg-white text-gray-800 shadow-xs"
                        : "text-gray-500 hover:text-gray-700"
                    } disabled:opacity-50`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-yellow-600" /> AI
                    Regenerate
                  </button>
                </div>
              </div>

              {/* Temporary Prompt/Instruction Override Textarea */}
              <div className="md:col-span-2 space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Custom Run Instructions (Merged with Global Settings)
                </span>
                <textarea
                  placeholder="e.g. Make sure to click the profile dropdown before asserting, or wait 1s after clicks..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={isExecuting || executionMode === "cache"}
                  rows={1.5}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:bg-gray-100 shadow-xs resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Dashboard Panel */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 overflow-hidden">
          {/* Left: Test Cases Queue List */}
          <div className="md:col-span-1 border rounded-xl overflow-y-auto bg-gray-50/50 p-3 flex flex-col gap-2 shadow-xs">
            <div className="flex items-center justify-between px-2 mb-1">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Execution Queue
              </h3>
              <Badge variant="secondary" className="text-[10px]">
                {selectedCount} selected
              </Badge>
            </div>
            {testCases.map((tc, index) => {
              const res = results[tc.id];
              const isActive = selectedDetailId === tc.id;
              const isRunning = currentIdx === index && isExecuting;

              return (
                <div
                  key={tc.id}
                  onClick={() => setSelectedDetailId(tc.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isActive
                      ? "bg-white border-primary shadow-sm ring-1 ring-primary/20"
                      : "bg-white border-gray-200 hover:border-gray-300 shadow-xs"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-gray-800 line-clamp-1">
                      {tc.title}
                    </h4>
                    <ChevronRight
                      className={`h-4 w-4 text-gray-400 transition-transform ${isActive ? "rotate-90 text-primary" : ""}`}
                    />
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1 mb-2.5">
                    {tc.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1.5 items-center">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono capitalize"
                      >
                        {tc.type}
                      </Badge>
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-full font-medium shadow-xs">
                        <Zap className="h-2.5 w-2.5 fill-current text-amber-500 animate-pulse" />
                        {getPriorityCredits(tc.priority)} credits
                      </span>
                    </div>
                    <StatusBadge
                      status={res?.status || "idle"}
                      isRunning={isRunning}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Code, Live Logs & Details Panel */}
          <div className="md:col-span-2 border rounded-xl flex flex-col bg-white overflow-hidden shadow-sm">
            {currentSelectedTestCase ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header Info */}
                <div className="p-4 border-b bg-gray-50/50 flex justify-between items-start gap-4 shrink-0">
                  <div>
                    <h3 className="font-bold text-base text-gray-800">
                      {currentSelectedTestCase.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Expected: {currentSelectedTestCase.expectedResult}
                    </p>
                  </div>
                  {currentSelectedResult?.sessionUrl && (
                    <Button
                      onClick={() =>
                        window.open(currentSelectedResult.sessionUrl, "_blank")
                      }
                      variant="outline"
                      size="sm"
                      className="font-medium text-xs gap-1 border-primary/30 text-primary hover:bg-primary/5 shadow-xs shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Watch Recording
                    </Button>
                  )}
                </div>

                {/* Body split: Code Accordion + Terminal */}
                <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
                  {/* Playwright Script Code Block */}
                  {currentSelectedResult?.browserbaseScript && (
                    <div className="rounded-lg border overflow-hidden">
                      <div className="bg-gray-100 px-3.5 py-2 border-b flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                          <Code className="h-3.5 w-3.5 text-primary" />{" "}
                          Generated Playwright Code
                        </span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-transparent"
                          onClick={() =>
                            copyText(
                              currentSelectedResult.browserbaseScript || "",
                              "Playwright code",
                            )
                          }
                          aria-label="Copy Playwright code"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <pre className="p-3 bg-gray-950 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-36">
                        {currentSelectedResult.browserbaseScript}
                      </pre>
                    </div>
                  )}

                  {/* Terminal logs panel */}
                  <div className="flex-1 flex flex-col rounded-lg border overflow-hidden min-h-48">
                    <div className="bg-gray-950 text-gray-200 px-3.5 py-2.5 border-b border-gray-800 flex items-center justify-between shrink-0 font-mono">
                      <span className="text-xs font-semibold flex items-center gap-1.5 text-emerald-400">
                        <Terminal className="h-3.5 w-3.5" /> Console Terminal
                        Output
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-gray-200 hover:text-gray-100 hover:bg-transparent"
                          onClick={() =>
                            copyText(
                              (currentSelectedResult?.logs || []).join("\n"),
                              "terminal output",
                            )
                          }
                          aria-label="Copy terminal output"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Badge
                          variant="secondary"
                          className="bg-gray-800 text-gray-300 border-none text-[10px] uppercase"
                        >
                          {currentSelectedResult?.status || "idle"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1 p-3 bg-gray-950 font-mono text-[11px] text-gray-300 overflow-y-auto flex flex-col gap-1.5 select-text">
                      {currentSelectedResult?.logs.map((log, lIdx) => (
                        <div
                          key={lIdx}
                          className="leading-relaxed whitespace-pre-wrap"
                        >
                          {log.startsWith("[SYSTEM]") ? (
                            <span className="text-blue-400">{log}</span>
                          ) : log.startsWith("[SYSTEM ERROR]") ? (
                            <span className="text-rose-400 font-semibold">
                              {log}
                            </span>
                          ) : log.startsWith("[BROWSER]") ? (
                            <span className="text-purple-400">{log}</span>
                          ) : (
                            <span>{log}</span>
                          )}
                        </div>
                      ))}
                      {currentSelectedResult?.error && (
                        <div className="text-red-400 font-bold mt-2 pt-2 border-t border-gray-800">
                          Error: {currentSelectedResult.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <Terminal className="h-12 w-12 text-gray-300 mb-3" />
                <h3 className="font-bold text-gray-700 text-lg">
                  No Test Case Selected
                </h3>
                <p className="text-sm text-gray-400 mt-1 max-w-sm">
                  Choose any test case from the queue to inspect its console
                  logs and code.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="border-t pt-4 flex justify-end gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={exportResultsToPdf}
            disabled={!hasExecutedResults || isExporting}
            className="h-10 font-medium px-5 gap-2"
          >
            <FileDown className="h-4 w-4" />
            {isExporting
              ? "Exporting..."
              : `Export ${selectedCount} Case${selectedCount === 1 ? "" : "s"} PDF`}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isExecuting}
            className="h-10 font-medium px-5"
          >
            Close & Refresh Status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({
  status,
  isRunning,
}: {
  status: RunResult["status"];
  isRunning: boolean;
}) {
  if (isRunning) {
    return (
      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none flex gap-1 items-center animate-pulse">
        <Loader2 className="h-3 w-3 animate-spin" /> Running
      </Badge>
    );
  }

  switch (status) {
    case "generating":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none flex gap-1 items-center">
          <Loader2 className="h-3 w-3 animate-spin" /> Generating...
        </Badge>
      );
    case "passed":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none flex gap-1 items-center">
          <CheckCircle2 className="h-3 w-3" /> Passed
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-none flex gap-1 items-center">
          <XCircle className="h-3 w-3" /> Failed
        </Badge>
      );
    case "idle":
    default:
      return (
        <Badge variant="secondary" className="text-gray-600">
          Queued
        </Badge>
      );
  }
}
