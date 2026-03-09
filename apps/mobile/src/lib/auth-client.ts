import { Capacitor } from "@capacitor/core";
import { getAuthToken } from "@repo/spec/fetcher";
import { createAuthClient } from "better-auth/react";

const baseURL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:3000";

// ネイティブ環境ではクッキーが使えないため、Bearer トークン認証を使用する
// token 関数が空文字を返す場合、better-auth は Authorization ヘッダーをスキップする
const fetchOptions = Capacitor.isNativePlatform()
  ? {
      auth: {
        type: "Bearer" as const,
        token: () => getAuthToken() ?? "",
      },
    }
  : {};

export const authClient = createAuthClient({
  baseURL,
  fetchOptions,
});

export const { useSession, signIn, signOut } = authClient;
