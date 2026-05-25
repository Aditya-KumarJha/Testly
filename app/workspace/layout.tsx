import WorkSpaceHeader from "@/components/custom/WorkSpaceHeader";
import React from "react";

function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <WorkSpaceHeader />
      {children}
    </div>
  );
}

export default WorkspaceLayout;
