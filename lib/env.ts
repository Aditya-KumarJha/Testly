export function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getGitHubRedirectUri() {
  const explicit = process.env.GITHUB_REDIRECT_URI;

  if (explicit) {
    return explicit;
  }

  const baseUrl = getRequiredEnv("NEXT_PUBLIC_APP_URL");
  return new URL("/api/github/callback", baseUrl).toString();
}
