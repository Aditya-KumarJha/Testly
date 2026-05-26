import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { ArrowUpRight, LayoutDashboard, Sparkles, Workflow } from "lucide-react";

function WorkSpaceHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-emerald-100/80 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <Image src="/logo.svg" alt="Testly AI logo" width={46} height={46} />
          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-900 transition group-hover:text-[#6D9846]">
              Testly AI
            </p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Autonomous QA Workspace
            </p>
          </div>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm font-medium text-slate-600">
            <li>
              <Link
                className="inline-flex items-center gap-2 transition hover:text-[#6D9846]"
                href="/workspace"
              >
                <LayoutDashboard className="h-4 w-4" />
                Workspace
              </Link>
            </li>
            <li>
              <Link
                className="inline-flex items-center gap-2 transition hover:text-[#6D9846]"
                href="/#features"
              >
                <Sparkles className="h-4 w-4" />
                Features
              </Link>
            </li>
            <li>
              <Link
                className="inline-flex items-center gap-2 transition hover:text-[#6D9846]"
                href="/#how-it-works"
              >
                <Workflow className="h-4 w-4" />
                How It Works
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden items-center gap-1 rounded-full border border-emerald-100 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-emerald-200 hover:text-[#6D9846] sm:inline-flex"
          >
            Website
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <div className="rounded-full border border-emerald-100 bg-white p-1 shadow-sm transition hover:shadow-md">
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}

export default WorkSpaceHeader;
