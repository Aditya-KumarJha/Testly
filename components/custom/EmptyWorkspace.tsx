"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { FolderGit2, Link, Sparkles, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function EmptyWorkspace() {
  const router = useRouter();

  return (
    <div className="soft-dots flex flex-col items-center justify-center rounded-[28px] border border-dashed border-emerald-200 bg-emerald-50/70 px-6 py-14 text-center">
      <div className="relative mb-5">
        <Image src={"/folder.png"} alt="Folder" width={70} height={70} />
        <div className="absolute -right-2 -top-2 rounded-full bg-white p-2 shadow-sm">
          <FolderGit2 className="h-4 w-4 text-[#6D9846]" />
        </div>
      </div>
      <h2 className="mb-3 text-2xl font-semibold text-slate-900">
        No Repository Connected
      </h2>
      <p className="max-w-lg text-sm leading-6 text-slate-600 sm:text-base">
        Connect your GitHub account to start analyzing repositories, generating
        AI-assisted test coverage, and tracking execution quality in one place.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-[#6D9846]" />
          AI test generation
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 shadow-sm">
          <Zap className="h-3.5 w-3.5 text-[#6D9846]" />
          Faster QA setup
        </span>
      </div>
      <Button
        className="mt-6 rounded-full bg-[#6D9846] px-6 hover:bg-[#5d873d]"
        onClick={() => {
          toast("Redirecting to GitHub to connect your account...");
          router.push("/api/github");
        }}
      >
        <Link className="mr-2 h-4 w-4" /> Connect Repository
      </Button>
    </div>
  );
}

export default EmptyWorkspace;
