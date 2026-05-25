import {
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Github, MonitorCheck, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Test Automation for Modern Teams",
  description:
    "Connect GitHub repositories, generate AI-driven test coverage, and track browser testing readiness from a single QA workspace.",
};

export default async function Home() {
  const { userId } = await auth();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description: siteConfig.description,
    url: siteConfig.url,
    featureList: [
      "GitHub repository onboarding",
      "AI-generated test case workflows",
      "Browser testing orchestration",
      "QA reporting and release visibility",
    ],
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <header className="glass-panel mb-8 flex items-center justify-between rounded-full border border-white/80 px-4 py-3 shadow-sm sm:px-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2 shadow-sm">
                <Image
                  alt="Testly AI logo"
                  className="h-9 w-9"
                  height={36}
                  src="/logo.svg"
                  width={36}
                />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">Testly AI</p>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Test Automation OS
                </p>
              </div>
            </div>

            <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
              <Link href="#features">Features</Link>
              <Link href="#how-it-works">How It Works</Link>
              <Link href="/workspace">Workspace</Link>
            </nav>

            <div className="flex items-center gap-3">
              {!userId ? (
                <>
                <SignInButton mode="modal">
                  <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-full bg-[#6D9846] px-4 py-2 text-sm font-medium text-white">
                    Get Started
                  </button>
                </SignUpButton>
                </>
              ) : (
                <>
                <Link
                  className="rounded-full bg-[#6D9846] px-4 py-2 text-sm font-medium text-white"
                  href="/workspace"
                >
                  Open Workspace
                </Link>
                <div className="rounded-full border border-emerald-100 bg-white p-1 shadow-sm">
                  <UserButton />
                </div>
                </>
              )}
            </div>
          </header>

          <section className="glass-panel hero-ring overflow-hidden rounded-[36px] border border-white/80 px-6 py-10 sm:px-10 sm:py-14">
            <div className="grid gap-10 lg:grid-cols-[1.25fr_0.95fr] lg:items-center">
              <div>
                <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#6D9846]">
                  AI-Powered QA Automation
                </div>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                  Turn repository context into faster, more reliable release testing.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  Testly AI helps teams connect GitHub repositories, prepare
                  intelligent test coverage, and build confidence before every
                  release with a focused QA workspace.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {!userId ? (
                    <SignUpButton mode="modal">
                      <button className="inline-flex items-center justify-center rounded-full bg-[#6D9846] px-6 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-200">
                        Start Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </SignUpButton>
                  ) : (
                    <Link
                      className="inline-flex items-center justify-center rounded-full bg-[#6D9846] px-6 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-200"
                      href="/workspace"
                    >
                      Go to Workspace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  )}
                  <Link
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700"
                    href="#features"
                  >
                    Explore Features
                  </Link>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-50 p-3">
                      <Github className="h-5 w-5 text-[#6D9846]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        GitHub Repository Sync
                      </p>
                      <p className="text-sm text-slate-500">
                        Bring in repositories and prepare them for test orchestration.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/80 bg-slate-950 p-5 text-white shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white/10 p-3">
                      <Sparkles className="h-5 w-5 text-emerald-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        AI Test Generation
                      </p>
                      <p className="text-sm text-slate-300">
                        Generate structured testing flows from repo context and intent.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-50 p-3">
                      <MonitorCheck className="h-5 w-5 text-[#6D9846]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Release Confidence
                      </p>
                      <p className="text-sm text-slate-500">
                        Centralize QA signals before bugs reach production.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10 grid gap-4 md:grid-cols-3" id="features">
            {[
              {
                title: "Repository-Aware",
                text: "Keep repository metadata, branch context, and owners visible where testing decisions happen.",
                icon: <Github className="h-5 w-5 text-[#6D9846]" />,
              },
              {
                title: "QA Focused",
                text: "Turn code changes into organized test generation and execution workflows instead of manual follow-up.",
                icon: <ShieldCheck className="h-5 w-5 text-[#6D9846]" />,
              },
              {
                title: "Fast Team Handoff",
                text: "Make readiness, coverage, and recent repo activity easier to scan across engineering and QA.",
                icon: <Sparkles className="h-5 w-5 text-[#6D9846]" />,
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="glass-panel rounded-[28px] border border-white/80 p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3">
                  {feature.icon}
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {feature.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {feature.text}
                </p>
              </div>
            ))}
          </section>

          <section
            className="mt-10 glass-panel rounded-4xl border border-white/80 px-6 py-8 shadow-sm sm:px-8"
            id="how-it-works"
          >
            <h2 className="text-2xl font-semibold text-slate-900">
              How It Works
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                "Connect your GitHub account and add repositories into the workspace.",
                "Review repository context and prepare AI-assisted testing flows.",
                "Use the workspace as the control center for quality and release readiness.",
              ].map((step, index) => (
                <div
                  key={step}
                  className="rounded-3xl border border-slate-200 bg-white p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Step {index + 1}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
