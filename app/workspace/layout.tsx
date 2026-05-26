import { auth } from "@clerk/nextjs/server";
import WorkSpaceHeader from "@/components/custom/WorkSpaceHeader";
import { redirect } from "next/navigation";
import React from "react";

async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-up");
  }

  return (
    <div className="brand-shell min-h-screen">
      <WorkSpaceHeader />
      {children}
    </div>
  );
}

export default WorkspaceLayout;
