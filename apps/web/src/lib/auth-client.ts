import { createAuthClient } from "better-auth/react";

const baseURL =
  typeof import.meta !== "undefined" && import.meta.env?.BETTER_AUTH_URL
    ? import.meta.env.BETTER_AUTH_URL
    : "";

export const authClient = createAuthClient({
  baseURL,
});

export const { useSession, signIn, signOut } = authClient;
