import type { Dispatch, SetStateAction } from "react";
import type { Repository, User } from "@/db/schema";

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
};

export type GitHubRepository = RepositoryPayload & {
  id: number;
};

export type SavedRepository = Repository;

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
