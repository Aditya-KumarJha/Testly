import WorkSpaceBody from "@/components/custom/WorkSpaceBody";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Workspace",
  description: "Manage connected repositories and monitor AI-generated testing progress.",
  robots: {
    index: false,
    follow: false,
  },
};

function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={null}>
        <WorkSpaceBody />
      </Suspense>
    </div>

  );
}

export default Page;
