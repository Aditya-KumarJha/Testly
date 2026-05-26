import { C } from "./theme";

export const TERM_LINES = [
  {
    delay: 0,
    color: "#9aaa8c",
    text: "$ testly connect --repo github.com/acme/checkout-app",
  },
  { delay: 700, color: C.primary, text: "✦ Cloning repository..." },
  {
    delay: 1400,
    color: C.inkMid,
    text: "  → 3 routes detected  ·  42 components mapped",
  },
  {
    delay: 2100,
    color: C.primary,
    text: "✦ Generating AI test cases for checkout and auth flows...",
  },
  { delay: 2800, color: C.inkMid, text: "  → 214 end-to-end test scenarios synthesized" },
  { delay: 3500, color: C.primary, text: "✦ Launching Browserbase cloud runner..." },
  { delay: 4200, color: C.inkMid, text: "  → Running 214 tests across 6 browsers" },
  { delay: 5000, color: "#4ade80", text: "✓ 211 passed  ·  3 failed  ·  done in 38s" },
] as const;

export const PIPELINE = [
  { icon: "⬡", label: "GitHub Repo", sub: "Connect & clone" },
  { icon: "✦", label: "AI Analysis", sub: "Map routes + flows" },
  { icon: "⚙", label: "Test Generation", sub: "214 scenarios" },
  { icon: "☁", label: "Browserbase", sub: "Cloud execution" },
  { icon: "✓", label: "Results", sub: "Report + video" },
] as const;

export const FEATURES = [
  {
    icon: "⬡",
    label: "GitHub Integration",
    body: "Connect any public or private repository in one click. Testly scans routes, components, and flows so your AI QA automation starts from real code context.",
    accent: C.primary,
  },
  {
    icon: "✦",
    label: "AI Test Generation",
    body: "Generate end-to-end testing scenarios, regression suites, and edge-case coverage from your source code with AI-generated test cases written for modern product teams.",
    accent: "#2e7d32",
  },
  {
    icon: "☁",
    label: "Browserbase Execution",
    body: "Run browser automation in real cloud browsers through Browserbase across Chrome, Firefox, and WebKit without managing infrastructure.",
    accent: "#558b2f",
  },
  {
    icon: "🎬",
    label: "Session Recordings",
    body: "Replay failing end-to-end tests frame by frame with videos, traces, and screenshots to speed up bug triage and release validation.",
    accent: "#33691e",
  },
  {
    icon: "🔁",
    label: "Auto-Healing Tests",
    body: "Adapt to UI changes with resilient selectors and fewer brittle scripts, helping teams reduce maintenance across regression testing cycles.",
    accent: C.primaryDark,
  },
  {
    icon: "📊",
    label: "Actionable Reports",
    body: "Review pass/fail results, root-cause insights, and suggested fixes in one QA dashboard built for software quality assurance workflows.",
    accent: "#1b5e20",
  },
] as const;

export const STEPS = [
  {
    n: "01",
    icon: "⬡",
    title: "Connect your GitHub repo",
    desc: "Authorize GitHub and select a repository. Testly reads your branch, analyzes your application structure, and prepares code-aware AI test automation.",
  },
  {
    n: "02",
    icon: "✦",
    title: "AI generates test cases",
    desc: "Our model maps routes, components, and user journeys to produce end-to-end testing, regression testing, and edge-case coverage automatically.",
  },
  {
    n: "03",
    icon: "☁",
    title: "Browserbase runs the tests",
    desc: "Cloud browser execution runs in parallel across multiple browsers and viewports with recordings, screenshots, and observability built in.",
  },
  {
    n: "04",
    icon: "✓",
    title: "Review results and iterate",
    desc: "Inspect structured reports, video replays, visual diffs, and AI-generated fix suggestions so your team can ship with confidence.",
  },
] as const;

export const LOGOS = [
  "Vercel",
  "Stripe",
  "Linear",
  "Resend",
  "PlanetScale",
  "Loom",
  "Notion",
  "Figma",
] as const;

export const STATS = [
  { target: 99, suffix: "%", label: "AI test accuracy rate" },
  { target: 214, suffix: "+", label: "Avg test scenarios generated" },
  { target: 2400, suffix: "+", label: "Repositories connected" },
  { target: 38, suffix: "s", label: "Avg end-to-end suite runtime" },
] as const;

export const BROWSERBASE_METRICS = [
  { label: "checkout flow", passed: 48, failed: 2, pct: 96 },
  { label: "auth routes", passed: 31, failed: 0, pct: 100 },
  { label: "product pages", passed: 62, failed: 5, pct: 93 },
  { label: "cart & payment", passed: 29, failed: 1, pct: 97 },
] as const;

export const BROWSERBASE_BENEFITS = [
  "Parallel execution across 6 browser types",
  "Full session replay with video + network trace",
  "Real device emulation and geolocation testing",
  "Automatic screenshots on failure",
] as const;

export const TRUST_CHIPS = [
  "No credit card required",
  "Works with any Next.js or React app",
  "Browserbase cloud included",
] as const;

export const FAQS = [
  {
    question: "What is Testly?",
    answer:
      "Testly is an AI test automation platform that connects to your GitHub repository, generates end-to-end test cases, and runs them in real cloud browsers with Browserbase.",
  },
  {
    question: "What kinds of tests does Testly generate?",
    answer:
      "It creates code-aware regression testing, user-flow coverage, smoke tests, and edge-case scenarios for modern React and Next.js applications.",
  },
  {
    question: "How does Testly improve QA automation?",
    answer:
      "It combines repository analysis, AI-generated test cases, browser automation, screenshots, recordings, and result reporting so teams can validate releases faster with less manual setup.",
  },
] as const;
