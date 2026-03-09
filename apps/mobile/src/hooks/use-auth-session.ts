import { getAuthToken, getBaseUrl } from "@repo/spec/fetcher";
import { useQuery } from "@tanstack/react-query";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type AuthSession = {
  id: string;
  token: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthSessionData = {
  user: AuthUser;
  session: AuthSession;
} | null;

export const AUTH_SESSION_QUERY_KEY = ["auth-session"] as const;

/**
 * better-auth/react の useSession() は Capacitor + Bearer トークン環境で
 * isPending が解決しないバグがあるため、React Query + 直接 fetch で代替。
 *
 * NOTE: customFetch は Orval 互換の { data, status, headers } 形式でラップするため
 * セッション確認には使えない。直接 fetch を使い、Cookie + Bearer 両方に対応する。
 */
async function fetchSession(): Promise<AuthSessionData> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${getBaseUrl()}/api/auth/get-session`, {
      method: "GET",
      credentials: "include",
      headers,
    });

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export function useAuthSession() {
  const { data, isPending } = useQuery<AuthSessionData>({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: fetchSession,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  return {
    session: data ?? null,
    isPending,
    user: data?.user ?? null,
  };
}
