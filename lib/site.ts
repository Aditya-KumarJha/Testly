const fallbackSiteUrl = "http://localhost:3000";

export const siteConfig = {
  name: "Testly AI",
  shortName: "Testly",
  description:
    "AI-powered QA automation platform for GitHub repositories, test generation, browser validation, and release confidence.",
  url: process.env.NEXT_PUBLIC_APP_URL || fallbackSiteUrl,
  keywords: [
    "Testly AI",
    "AI testing platform",
    "GitHub repository testing",
    "AI QA automation",
    "test case generation",
    "browser automation",
    "playwright testing",
    "end-to-end testing",
    "software quality assurance",
    "release validation",
    "regression testing",
    "continuous testing",
    "developer productivity",
    "bug detection",
    "repository analysis",
  ],
};

export function getSiteUrl() {
  return siteConfig.url;
}

export function getMetadataBase() {
  return new URL(getSiteUrl());
}
