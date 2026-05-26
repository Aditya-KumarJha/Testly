import { GoogleGenAI, Type } from "@google/genai";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { TestCasesTable } from "@/db/schema";
import {
  apiError,
  getErrorMessage,
  parseJsonBody,
  toInteger,
  toOptionalTrimmedString,
  toTrimmedString,
} from "@/lib/api";
import { getRequiredEnv } from "@/lib/env";

const ALLOWED_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".json", ".md"];
const MAX_FILES_TO_ANALYZE = 25;
const MAX_FILE_CONTENT_LENGTH = 5000;

const IMPORTANT_FILES = [
  "package.json",
  "next.config",
  "middleware",
  "app/",
  "pages/",
  "components/",
  "src/",
  "lib/",
  "utils/",
  "actions/",
  "api/",
  "server/",
];

const IGNORE_PATHS = [
  "node_modules",
  ".next",
  "dist",
  "build",
  ".git",
  "coverage",
  "public/",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".webp",
  ".mp4",
  ".mov",
];

type GitHubTreeItem = {
  path?: string;
  type?: string;
};

type RepositoryFile = {
  path: string;
  content: string;
};

type GeneratedTestCase = {
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  targetRoute?: string;
  targetFiles?: string[];
  expectedResult?: string;
};

function getAiClient() {
  return new GoogleGenAI({
    apiKey: getRequiredEnv("GEMINI_API_KEY"),
  });
}

function isUsefulFile(path: string) {
  const isIgnored = IGNORE_PATHS.some((item) => path.includes(item));
  const isAllowedExtension = ALLOWED_EXTENSIONS.some((ext) => path.endsWith(ext));
  const isImportantPath = IMPORTANT_FILES.some((item) => path.includes(item));

  return !isIgnored && isAllowedExtension && isImportantPath;
}

function isValidGeneratedTestCase(value: GeneratedTestCase) {
  return Boolean(
    toTrimmedString(value.title) &&
      toTrimmedString(value.description) &&
      toTrimmedString(value.type) &&
      toTrimmedString(value.priority) &&
      toTrimmedString(value.expectedResult),
  );
}

async function getRepoTree({
  owner,
  repo,
  branch,
  githubToken,
}: {
  owner: string;
  repo: string;
  branch: string;
  githubToken: string;
}) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub repository tree");
  }

  const data = (await response.json()) as { tree?: GitHubTreeItem[] };

  return (data.tree ?? [])
    .filter(
      (item): item is Required<Pick<GitHubTreeItem, "path" | "type">> =>
        item.type === "blob" && typeof item.path === "string",
    )
    .filter((item) => isUsefulFile(item.path))
    .slice(0, MAX_FILES_TO_ANALYZE);
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

  const decodedContent = Buffer.from(data.content, "base64").toString("utf-8");

  return {
    path,
    content: decodedContent.slice(0, MAX_FILE_CONTENT_LENGTH),
  } satisfies RepositoryFile;
}

export async function POST(req: NextRequest) {
  try {
    const { data, errorResponse } = await parseJsonBody<{
      userId?: unknown;
      repoId?: unknown;
      owner?: unknown;
      repo?: unknown;
      branch?: unknown;
    }>(req);

    if (errorResponse || !data) {
      return errorResponse ?? apiError("Invalid request body", 400);
    }

    const cookiesStore = await cookies();
    const githubToken = cookiesStore.get("gh_token")?.value;
    const userId = toTrimmedString(data.userId);
    const repoId = toOptionalTrimmedString(data.repoId);
    const owner = toTrimmedString(data.owner);
    const repo = toTrimmedString(data.repo);
    const branch = toTrimmedString(data.branch) || "main";

    if (!githubToken) {
      return apiError("GitHub authentication token is missing or expired", 401);
    }

    if (!userId || !owner || !repo) {
      return apiError("userId, owner, and repo are required", 400);
    }

    const repoFiles = await getRepoTree({
      owner,
      repo,
      branch,
      githubToken,
    });

    if (repoFiles.length === 0) {
      return apiError("No useful source files found in this repository", 400);
    }

    const fileContents = await Promise.all(
      repoFiles.map((file) =>
        readGithubFile({
          owner,
          repo,
          branch,
          path: file.path,
          githubToken,
        }),
      ),
    );

    const validFiles = fileContents.filter(
      (file): file is RepositoryFile => Boolean(file),
    );

    if (validFiles.length === 0) {
      return apiError("No useful source files found in this repository", 400);
    }

    const repoContext = validFiles
      .map(
        (file) => `
File Path: ${file.path}

File Content:
${file.content}
`,
      )
      .join("\n\n----------------------\n\n");

    const prompt = `
You are an expert QA automation engineer.

Analyze the GitHub repository source code and generate useful small test cases.

Your goal:
Generate test cases that can later be converted into Playwright / Browserbase automation scripts.

Repository:
Owner: ${owner}
Repo: ${repo}
Branch: ${branch}

Repository File Context:
${repoContext}

Generate 5 to 10 test cases.

Each test case must include:
- title: clear test case title
- description: one-line description
- type: one of ui, auth, api, form, integration, edge-case
- priority: low, medium, high
- targetRoute: most likely app route/page to test, for example /sign-in, /dashboard, /api/users
- targetFiles: related file paths from the repository context
- expectedResult: what should happen when the test passes

Important rules:
- Only use file paths that exist in the repository context.
- Do not invent fake target files.
- If route is unclear, infer from Next.js app/page structure.
- Keep description short, only one line.
- Return only valid JSON.
`;

    const response = await getAiClient().models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            testCases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    enum: ["ui", "auth", "api", "form", "integration", "edge-case"],
                  },
                  priority: {
                    type: Type.STRING,
                    enum: ["low", "medium", "high"],
                  },
                  targetRoute: { type: Type.STRING },
                  targetFiles: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  expectedResult: { type: Type.STRING },
                },
                required: [
                  "title",
                  "description",
                  "type",
                  "priority",
                  "targetRoute",
                  "targetFiles",
                  "expectedResult",
                ],
              },
            },
          },
          required: ["testCases"],
        },
      },
    });

    const rawText = response.text?.trim();
    if (!rawText) {
      return apiError("Gemini did not generate any test cases", 502);
    }

    const parsedResult = JSON.parse(rawText) as { testCases?: GeneratedTestCase[] };
    const testCases = (parsedResult.testCases ?? []).filter(isValidGeneratedTestCase);

    if (testCases.length === 0) {
      return apiError("Gemini did not generate any valid test cases", 400);
    }

    const insertedTestCases = await db
      .insert(TestCasesTable)
      .values(
        testCases.map((testCase) => ({
          userId,
          repoId,
          repoName: repo,
          repoOwner: owner,
          branch,
          title: toTrimmedString(testCase.title),
          description: toTrimmedString(testCase.description),
          type: toTrimmedString(testCase.type),
          priority: toTrimmedString(testCase.priority),
          targetRoute: toOptionalTrimmedString(testCase.targetRoute),
          targetFiles: Array.isArray(testCase.targetFiles)
            ? testCase.targetFiles.filter((file) => validFiles.some((item) => item.path === file))
            : [],
          expectedResult: toTrimmedString(testCase.expectedResult),
          status: "generated",
        })),
      )
      .returning();

    return NextResponse.json({
      success: true,
      message: "Test cases generated successfully",
      count: insertedTestCases.length,
      testCases: insertedTestCases,
    });
  } catch (error) {
    console.error("Generate test cases error:", error);
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
