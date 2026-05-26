const fallbackSiteUrl = "http://localhost:3000";

export const siteConfig = {
  name: "Testly AI",
  shortName: "Testly",
  description:
    "Testly is an AI-powered QA automation platform for GitHub repositories, AI test generation, browser automation, regression testing, and release confidence.",
  url: process.env.NEXT_PUBLIC_APP_URL || fallbackSiteUrl,
  keywords: [
    "Testly AI",
    "Testly",
    "AI testing platform",
    "AI test automation",
    "GitHub repository testing",
    "AI QA automation",
    "test case generation",
    "browser automation",
    "Browserbase testing",
    "playwright testing",
    "end-to-end testing",
    "end-to-end test generation",
    "software quality assurance",
    "release validation",
    "regression testing",
    "continuous testing",
    "Next.js testing",
    "React testing automation",
    "developer productivity",
    "bug detection",
    "repository analysis",
  ],
};

export function getSiteUrl() {
  return siteConfig.url;
}

export function getMetadataBase() {
  try {
    return new URL(getSiteUrl());
  } catch {
    return new URL(fallbackSiteUrl);
  }
}
