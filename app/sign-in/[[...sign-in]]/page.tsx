import AuthShell from "@/components/auth/AuthShell";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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
