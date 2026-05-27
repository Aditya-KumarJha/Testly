import AuthShell from "@/components/auth/AuthShell";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { siteConfig } from "@/lib/site";

const pageTitle = "Sign in | Testly AI";
const pageDescription =
  "Sign in to Testly to manage AI-powered test generation, monitor runs, and keep GitHub automation in sync.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    ...siteConfig.keywords,
    "sign in",
    "login",
    "QA automation workspace",
    "GitHub test automation",
  ],
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SignInPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/workspace");
  }

  return (
    <AuthShell
      alternateHref="/sign-up"
      alternateLabel="Create an account"
      alternatePrompt="Need a workspace first?"
      description="Sign in to continue into your QA workspace, reconnect GitHub, and manage repository test automation from the same dashboard."
      eyebrow="Welcome back"
      title="Pick up testing right where you left it."
    >
      <SignIn
        fallbackRedirectUrl="/workspace"
        path="/sign-in"
        signUpUrl="/sign-up"
      />
    </AuthShell>
  );
}
