import { createAuthClient } from "better-auth/react";

const baseURL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
});

export const { useSession, signIn, signOut } = authClient;
