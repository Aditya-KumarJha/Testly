import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function WorkSpaceAliasPage() {
  const { userId } = await auth();

  redirect(userId ? "/workspace" : "/sign-up");
}
