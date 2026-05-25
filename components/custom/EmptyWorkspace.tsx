"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { FolderGit2, Link } from "lucide-react";
import { useRouter } from "next/navigation";

function EmptyWorkspace() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-emerald-200 bg-emerald-50/70 px-6 py-14 text-center">
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
      <Button
        className="mt-6 rounded-full bg-[#6D9846] px-6 hover:bg-[#5d873d]"
        onClick={() => router.push("/api/github")}
      >
        <Link className="h-4 w-4 mr-2" /> Connect Repository
      </Button>
    </div>
  );
}

export default EmptyWorkspace;
