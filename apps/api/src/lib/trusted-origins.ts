import type { AppBindings } from "../types/app-env";

const trustedOriginsBase = [
  "http://localhost:5173",
  "http://localhost:8100",
  "http://localhost:3000",
  "capacitor://localhost",
  "https://localhost",
];

export function trustedOriginsForRequest(c: { env: AppBindings }): string[] {
  const deployed = c.env.BETTER_AUTH_URL ?? process.env.BETTER_AUTH_URL ?? "";
  if (!deployed) {
    return [...trustedOriginsBase];
  }
  return [...trustedOriginsBase, deployed];
}
