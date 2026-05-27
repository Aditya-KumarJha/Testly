import AuthShell from "@/components/auth/AuthShell";
import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { siteConfig } from "@/lib/site";

const pageTitle = "Create your account | Testly AI";
const pageDescription =
  "Create a Testly workspace to connect GitHub repositories, generate AI test cases, and run automated QA.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    ...siteConfig.keywords,
    "sign up",
    "create account",
    "AI test automation",
    "QA workspace",
  ],
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SignUpPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/workspace");
  }

  return (
    <AuthShell
      alternateHref="/sign-in"
      alternateLabel="Sign in instead"
      alternatePrompt="Already have an account?"
      description="Create your Testly access point, connect GitHub from the onboarding flow, and land directly in the workspace when setup is complete."
      eyebrow="Get started"
      title="Create your AI testing workspace."
    >
      <SignUp
        fallbackRedirectUrl="/workspace"
        path="/sign-up"
        signInUrl="/sign-in"
      />
    </AuthShell>
  );
}
