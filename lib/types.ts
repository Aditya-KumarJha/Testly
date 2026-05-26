import type { Dispatch, SetStateAction } from "react";
import type { Repository, TestCase as DbTestCase, User } from "@/db/schema";

export type UserContextValue = {
  userDetail: User | null;
  setUserDetail: Dispatch<SetStateAction<User | null>>;
};

export type RepositoryPayload = {
  repoId: number;
  name: string;
  fullName: string;
  isPrivate: boolean;
  htmlUrl: string;
  description: string | null;
  updatedAt: string;
  language: string | null;
  defaultBranch: string;
  owner: string;
  targetDomain?: string;
  globalInstructions?: string;
};

export type GitHubRepository = RepositoryPayload & {
  id: number;
};

export type SavedRepository = Repository;

export type TestCase = DbTestCase;

export type GitHubProfile = {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string;
  htmlUrl: string;
  bio: string | null;
  followers: number;
  following: number;
  publicRepos: number;
};
