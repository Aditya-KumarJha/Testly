import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Workspace redirect | Testly AI",
  description: "Redirecting to your Testly workspace.",
  keywords: [...siteConfig.keywords, "workspace", "redirect"],
  robots: {
    index: false,
    follow: false,
  },
};

export default async function WorkSpaceAliasPage() {
  const { userId } = await auth();

  redirect(userId ? "/workspace" : "/sign-up");
}
