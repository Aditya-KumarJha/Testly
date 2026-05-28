export function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getGitHubRedirectUri() {
  const baseUrl = getRequiredEnv("NEXT_PUBLIC_APP_URL");
  return new URL("/api/github/callback", baseUrl).toString();
}
