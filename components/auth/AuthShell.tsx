import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Github, ShieldCheck, Sparkles } from "lucide-react";

const AUTH_POINTS = [
  "Connect GitHub once and keep repository setup in one place.",
  "Generate AI-assisted test coverage without wiring custom flows first.",
  "Jump into the workspace immediately after authentication.",
];

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  alternateHref: string;
  alternateLabel: string;
  alternatePrompt: string;
  children: ReactNode;
};

export default function AuthShell({
  eyebrow,
  title,
  description,
  alternateHref,
  alternateLabel,
  alternatePrompt,
  children,
}: AuthShellProps) {
  return (
    <main className="brand-shell relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(122,163,90,0.18),transparent_60%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="mesh-panel hover-lift rounded-[32px] border border-white/80 p-8 shadow-[0_30px_80px_rgba(76,96,53,0.12)] sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#6D9846]">
            <Sparkles className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h1 className="font-brand-serif mt-6 max-w-xl text-5xl leading-none tracking-[-0.04em] text-slate-950 sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            {description}
          </p>

          <div className="mt-8 grid gap-3">
            {AUTH_POINTS.map((point) => (
              <div
                key={point}
                className="animated-sheen flex items-start gap-3 rounded-2xl border border-white/80 bg-white/80 px-4 py-4 shadow-sm"
              >
                <ShieldCheck className="mt-0.5 h-5 w-5 text-[#6D9846]" />
                <p className="text-sm leading-6 text-slate-600">{point}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-white">
              <Github className="h-4 w-4" />
              GitHub-ready onboarding
            </span>
            <span className="rounded-full border border-emerald-100 bg-white/80 px-3 py-1.5">
              Browser automation workspace
            </span>
          </div>
        </section>

        <section className="glass-panel rounded-[32px] border border-white/80 p-4 shadow-[0_26px_70px_rgba(76,96,53,0.14)] sm:p-6">
          <div className="rounded-[28px] border border-emerald-100/80 bg-white/95 p-4 sm:p-6">
            {children}
            <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
              {alternatePrompt}{" "}
              <Link
                href={alternateHref}
                className="inline-flex items-center gap-1 font-medium text-[#6D9846] transition hover:text-[#557936]"
              >
                {alternateLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
