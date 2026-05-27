import { Browserbase } from "@browserbasehq/sdk";
import { GoogleGenAI } from "@google/genai";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright-core";
import { db } from "@/db";
import { TestCasesTable, repositories, users } from "@/db/schema";
import {
  apiError,
  getErrorMessage,
  parseJsonBody,
  toInteger,
  toTrimmedString,
} from "@/lib/api";
import { getRequiredEnv } from "@/lib/env";
import { publishToQueue } from "@/lib/rabbitmq";

const MAX_FILE_CONTENT_LENGTH = 5000;

type RepositoryFile = {
  path: string;
  content: string;
};

type RequestMode = "cache" | "generate";

function getAiClient() {
  return new GoogleGenAI({
    apiKey: getRequiredEnv("GEMINI_API_KEY"),
  });
}

function getBrowserbaseClient() {
  return new Browserbase({
    apiKey: getRequiredEnv("BROWSERBASE_API_KEY"),
  });
}

function safeSerializeLogValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function sanitizeGeneratedCode(code: string) {
  return code
    .replace(/^```javascript\s*/i, "")
    .replace(/^```js\s*/i, "")
    .replace(/```$/, "")
    .trim();
}

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, "");
}

function normalizeTargetRoute(route?: string | null) {
  if (!route) {
    return "/";
  }

  let value = route.trim();
  if (!value || value === "/") {
    return "/";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const url = new URL(value);
      value = `${url.pathname}${url.search}${url.hash}` || "/";
    } catch {
      value = "/";
    }
  }

  if (value === "index" || value === "/index") {
    return "/";
  }

  if (value.startsWith("#")) {
    return `/${value}`;
  }

  if (!value.startsWith("/")) {
    value = `/${value}`;
  }

  if (value.endsWith("/index")) {
    value = value.replace(/\/index$/, "/");
  }

  return value;
}

function patchScriptTargetUrl(options: {
  script: string;
  baseUrl: string;
  originalRoute?: string | null;
  normalizedBaseUrl: string;
  normalizedRoute: string;
}) {
  const { script, baseUrl, originalRoute, normalizedBaseUrl, normalizedRoute } =
    options;
  let next = script;

  const trimmedOriginalRoute = originalRoute?.trim();
  if (trimmedOriginalRoute) {
    const originalUrl = `${baseUrl}${trimmedOriginalRoute}`;
    const normalizedUrl = `${normalizedBaseUrl}${normalizedRoute}`;
    if (originalUrl !== normalizedUrl) {
      next = next.split(originalUrl).join(normalizedUrl);
    }

    const baseWithNoSlash = normalizeBaseUrl(baseUrl);
    const routeWithSlash = trimmedOriginalRoute.startsWith("/")
      ? trimmedOriginalRoute
      : `/${trimmedOriginalRoute}`;
    const originalAltUrl = `${baseWithNoSlash}${routeWithSlash}`;
    if (originalAltUrl !== normalizedUrl) {
      next = next.split(originalAltUrl).join(normalizedUrl);
    }
  }

  if (normalizedRoute === "/") {
    next = next
      .split(`${normalizedBaseUrl}/index`)
      .join(`${normalizedBaseUrl}/`)
      .split(`${normalizedBaseUrl}//index`)
      .join(`${normalizedBaseUrl}/`);
  }

  return next;
}

async function readGithubFile({
  owner,
  repo,
  path,
  branch,
  githubToken,
}: {
  owner: string;
  repo: string;
  path: string;
  branch: string;
  githubToken: string;
}) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { content?: string; encoding?: string };
  if (!data.content || data.encoding !== "base64") {
    return null;
  }

  return {
    path,
    content: Buffer.from(data.content, "base64")
      .toString("utf-8")
      .slice(0, MAX_FILE_CONTENT_LENGTH),
  } satisfies RepositoryFile;
}

declare global {
  var batchResults: Record<string, any[]> | undefined;
}

export async function POST(req: NextRequest) {
  try {
    const { data, errorResponse } = await parseJsonBody<{
      testCaseId?: unknown;
      baseUrl?: unknown;
      mode?: unknown;
      customPrompt?: unknown;
      batchId?: unknown;
      batchTotal?: unknown;
      batchIndex?: unknown;
    }>(req);

    if (errorResponse || !data) {
      return errorResponse ?? apiError("Invalid request body", 400);
    }

    const testCaseId = toInteger(data.testCaseId);
    const baseUrl = toTrimmedString(data.baseUrl);
    const mode = data.mode === "cache" ? "cache" : "generate";
    const customPrompt = toTrimmedString(data.customPrompt);
    const batchId = data.batchId ? toTrimmedString(data.batchId) : undefined;
    const batchTotal = data.batchTotal ? Number(data.batchTotal) : undefined;
    const batchIndex = data.batchIndex !== undefined ? Number(data.batchIndex) : undefined;

    if (!testCaseId || !baseUrl) {
      return apiError("testCaseId and baseUrl are required", 400);
    }

    try {
      new URL(baseUrl);
    } catch {
      return apiError("baseUrl must be a valid absolute URL", 400);
    }

    const [testCase] = await db
      .select()
      .from(TestCasesTable)
      .where(eq(TestCasesTable.id, testCaseId));

    if (!testCase) {
      return apiError("Test case not found", 404);
    }

    const userIdNum = parseInt(testCase.userId, 10);
    if (isNaN(userIdNum)) {
      return apiError("Invalid user associated with this testcase", 400);
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userIdNum));

    if (!user) {
      return apiError("User not found", 404);
    }

    let requiredCredits = 10;
    if (testCase.priority === "high") {
      requiredCredits = 15;
    } else if (testCase.priority === "low") {
      requiredCredits = 5;
    }

    if (user.credits < requiredCredits) {
      return apiError("Not enough credits. Please purchase more credits first.", 402);
    }

    let repoRecord = null;
    if (testCase.repoId) {
      const numericRepoId = Number(testCase.repoId);
      if (Number.isInteger(numericRepoId)) {
        const [repository] = await db
          .select()
          .from(repositories)
          .where(eq(repositories.repoId, numericRepoId));
        repoRecord = repository ?? null;
      }
    }

    if (!repoRecord) {
      const [repository] = await db
        .select()
        .from(repositories)
        .where(eq(repositories.fullName, `${testCase.repoOwner}/${testCase.repoName}`));
      repoRecord = repository ?? null;
    }

    const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
    const normalizedTargetRoute = normalizeTargetRoute(testCase.targetRoute);
    const originalTargetRoute = testCase.targetRoute;

    if (normalizedTargetRoute !== (originalTargetRoute ?? "")) {
      await db
        .update(TestCasesTable)
        .set({ targetRoute: normalizedTargetRoute })
        .where(eq(TestCasesTable.id, testCase.id));
    }

    let scriptText = testCase.browserbaseScript;
    const forceRegenerate = mode === "generate" || !scriptText;

    if (forceRegenerate) {
      const cookiesStore = await cookies();
      const githubToken = cookiesStore.get("gh_token")?.value;

      if (!githubToken) {
        return apiError("GitHub authentication token is missing or expired", 401);
      }

      const targetFiles = Array.isArray(testCase.targetFiles) ? testCase.targetFiles : [];
      let repoContext = "";

      if (targetFiles.length > 0) {
        const fileContents = await Promise.all(
          targetFiles.map((path) =>
            readGithubFile({
              owner: testCase.repoOwner,
              repo: testCase.repoName,
              branch: testCase.branch || "main",
              path,
              githubToken,
            }),
          ),
        );

        const validFiles = fileContents.filter(
          (file): file is RepositoryFile => Boolean(file),
        );

        repoContext = validFiles
          .map(
            (file) => `
File Path: ${file.path}
File Content:
${file.content}
`,
          )
          .join("\n\n----------------------\n\n");
      }

      const globalIns = repoRecord?.globalInstructions
        ? `\n[GLOBAL PROJECT INSTRUCTIONS] (Follow strictly):\n${repoRecord.globalInstructions}\n`
        : "";
      const tempIns = customPrompt
        ? `\n[ADDITIONAL RUNTIME INSTRUCTIONS] (Follow strictly):\n${customPrompt}\n`
        : "";
      const expectedResultText = (testCase.expectedResult ?? "")
        .toLowerCase()
        .replace(/'/g, "\\'");

      const prompt = `
You are an expert QA automation engineer.
Your task is to write a Playwright Node.js script body that executes a test case on an application running at URL: "${normalizedBaseUrl}".
Test Case Details:
Title: ${testCase.title}
Description: ${testCase.description}
Target Route: ${normalizedTargetRoute}
Expected Result: ${testCase.expectedResult}
${globalIns}
${tempIns}
Source File Context for Reference (Read this to extract exact tags, component text, input fields, and class names):
${repoContext || "No source file context available for this test case."}
Write only the JavaScript code that executes within an async function context.
The following variables are pre-injected into your runtime environment:
'page': The Playwright Page object.
'console': The custom console object to output log messages.
IMPORTANT:
Do NOT assume Node.js 'assert' is available.
Do NOT import assert or any other module.
At the top of the generated script, always define this custom assert helper:
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}
Rules for your code:
DO NOT import playwright, browserbase, assert, or any other modules.
Navigate to the target route using:
\`await page.goto('${normalizedBaseUrl}${normalizedTargetRoute}', { waitUntil: 'load', timeout: 15000 })\`
followed by a short settle wait: \`await page.waitForTimeout(1000)\`.
Carefully analyze the Source File Context provided to find the EXACT forms, inputs, placeholders, buttons, and elements.
Apply extreme selector resilience and always wait for elements before interacting with them.
Add \`await page.waitForTimeout(1000)\` after major actions.
Use lenient, substring-based assertions:
\`const bodyText = await page.innerText('body');\`
\`assert(bodyText.toLowerCase().includes('${expectedResultText}'), 'Expected result state not matched');\`
Print descriptive logs at each step using \`console.log()\`.
Return ONLY the raw JavaScript executable code.
DO NOT wrap the code in markdown.
DO NOT include any explanation.
`;

      const response = await getAiClient().models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
      });

      scriptText = sanitizeGeneratedCode(response.text || "");
      if (!scriptText) {
        return apiError("Gemini failed to generate an automation script", 502);
      }

      await db
        .update(TestCasesTable)
        .set({
          browserbaseScript: scriptText,
          status: "running",
        })
        .where(eq(TestCasesTable.id, testCase.id));
    } else {
      await db
        .update(TestCasesTable)
        .set({ status: "running" })
        .where(eq(TestCasesTable.id, testCase.id));
    }

    if (!scriptText) {
      return apiError("No automation script is available for this test case", 500);
    }

    scriptText = patchScriptTargetUrl({
      script: scriptText,
      baseUrl,
      originalRoute: originalTargetRoute,
      normalizedBaseUrl,
      normalizedRoute: normalizedTargetRoute,
    });

    const logs: string[] = [];
    const customConsole = {
      log: (...args: unknown[]) => logs.push(args.map(safeSerializeLogValue).join(" ")),
      error: (...args: unknown[]) =>
        logs.push(`[ERROR] ${args.map(safeSerializeLogValue).join(" ")}`),
      warn: (...args: unknown[]) =>
        logs.push(`[WARN] ${args.map(safeSerializeLogValue).join(" ")}`),
    };

    let sessionId: string | null = null;
    let sessionUrl: string | null = null;
    let browser: import("playwright-core").Browser | null = null;

    try {
      const session = await getBrowserbaseClient().sessions.create({
        projectId: getRequiredEnv("BROWSERBASE_PROJECT_ID"),
      });

      sessionId = session.id;
      sessionUrl = `https://www.browserbase.com/sessions/${session.id}`;
      logs.push(`[SYSTEM] Browserbase session created successfully with ID: ${sessionId}`);

      if (!session.connectUrl) {
        throw new Error("Browserbase session connect URL missing");
      }

      // Deduct credits now that the Browserbase session is successfully created and we are starting execution!
      const newCredits = Math.max(0, user.credits - requiredCredits);
      await db
        .update(users)
        .set({ credits: newCredits })
        .where(eq(users.id, user.id));

      browser = await chromium.connectOverCDP(session.connectUrl);
      const context = browser.contexts()[0] ?? (await browser.newContext());
      const page = context.pages()[0] ?? (await context.newPage());

      page.on("console", (msg) => {
        logs.push(`[BROWSER] [${msg.type().toUpperCase()}] ${msg.text()}`);
      });

      logs.push("[SYSTEM] Connected to Browserbase cloud browser, executing script...");

      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
        ...args: string[]
      ) => (page: unknown, assert: (condition: boolean, message?: string) => void, console: typeof customConsole) => Promise<void>;

      const runFn = new AsyncFunction("page", "assert", "console", scriptText);
      const assertHelper = (condition: boolean, message?: string) => {
        if (!condition) {
          throw new Error(message || "Assertion failed");
        }
      };

      await runFn(page, assertHelper, customConsole);
      logs.push("[SYSTEM] Script execution completed successfully without errors.");

      await db
        .update(TestCasesTable)
        .set({
          status: "passed",
          browserbaseScript: scriptText,
          logs,
          sessionId,
          sessionUrl,
        })
        .where(eq(TestCasesTable.id, testCase.id));

      // Compile result metadata
      const runResult = {
        testCase: {
          id: testCase.id,
          title: testCase.title,
          priority: testCase.priority,
          browserbaseScript: scriptText,
          sessionId,
          sessionUrl,
        },
        logs,
        status: "passed",
        repoName: testCase.repoName,
        repoOwner: testCase.repoOwner,
        branch: testCase.branch || "main",
        targetRoute: testCase.targetRoute || "/",
        creditsUsed: requiredCredits,
        user: {
          email: user.email,
          name: user.name || "Testly User",
        },
      };

      // Group runs in a batch if batchId is provided
      if (batchId && batchTotal && batchTotal > 1) {
        if (!global.batchResults) {
          global.batchResults = {};
        }
        if (!global.batchResults[batchId]) {
          global.batchResults[batchId] = [];
        }
        global.batchResults[batchId].push(runResult);

        console.log(`[Batch] Added success to batch ${batchId}. Current size: ${global.batchResults[batchId].length}/${batchTotal}`);

        if (global.batchResults[batchId].length === batchTotal) {
          console.log(`[Batch] Batch ${batchId} completed! Publishing combined success event...`);
          await publishToQueue("TEST_RUN_COMPLETED", global.batchResults[batchId]);
          delete global.batchResults[batchId]; // Clean cache
        }
      } else {
        // Single run - publish immediately as an array of 1
        await publishToQueue("TEST_RUN_COMPLETED", [runResult]);
      }

      return NextResponse.json({
        success: true,
        status: "passed",
        sessionId,
        sessionUrl,
        logs,
        browserbaseScript: scriptText,
      });
    } catch (execError) {
      console.error("Script execution error:", execError);
      logs.push(`[SYSTEM ERROR] Script execution failed: ${getErrorMessage(execError)}`);

      await db
        .update(TestCasesTable)
        .set({
          status: "failed",
          browserbaseScript: scriptText,
          logs,
          sessionId,
          sessionUrl,
        })
        .where(eq(TestCasesTable.id, testCase.id));

      // Compile result metadata
      const runResult = {
        testCase: {
          id: testCase.id,
          title: testCase.title,
          priority: testCase.priority,
          browserbaseScript: scriptText,
          sessionId,
          sessionUrl,
        },
        logs,
        status: "failed",
        repoName: testCase.repoName,
        repoOwner: testCase.repoOwner,
        branch: testCase.branch || "main",
        targetRoute: testCase.targetRoute || "/",
        creditsUsed: requiredCredits,
        user: {
          email: user.email,
          name: user.name || "Testly User",
        },
      };

      // Group runs in a batch if batchId is provided
      if (batchId && batchTotal && batchTotal > 1) {
        if (!global.batchResults) {
          global.batchResults = {};
        }
        if (!global.batchResults[batchId]) {
          global.batchResults[batchId] = [];
        }
        global.batchResults[batchId].push(runResult);

        console.log(`[Batch] Added failure to batch ${batchId}. Current size: ${global.batchResults[batchId].length}/${batchTotal}`);

        if (global.batchResults[batchId].length === batchTotal) {
          console.log(`[Batch] Batch ${batchId} completed! Publishing combined failure event...`);
          await publishToQueue("TEST_RUN_COMPLETED", global.batchResults[batchId]);
          delete global.batchResults[batchId]; // Clean cache
        }
      } else {
        // Single run - publish immediately as an array of 1
        await publishToQueue("TEST_RUN_COMPLETED", [runResult]);
      }

      return NextResponse.json(
        {
          success: false,
          status: "failed",
          error: getErrorMessage(execError),
          sessionId,
          sessionUrl,
          logs,
          browserbaseScript: scriptText,
        },
        { status: 500 },
      );
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
    }
  } catch (error) {
    console.error("API endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
