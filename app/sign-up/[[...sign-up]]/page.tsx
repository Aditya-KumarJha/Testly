import AuthShell from "@/components/auth/AuthShell";
import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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
