import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { getBaseUrl, setAuthToken } from "@repo/spec/fetcher";
import { useCallback } from "react";

import { useAuthSession } from "@/hooks/use-auth-session";
import { authClient } from "@/lib/auth-client";
import { removeToken } from "@/lib/token-storage";

export function useAuth() {
  const { session, isPending } = useAuthSession();

  const signInWithGoogle = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      // ネイティブ: システム Safari で Google OAuth を開く
      // Browser.open() (SFSafariViewController) ではなくシステム Safari を使うことで
      // Google のアカウント選択が正常に動作する
      // _system ターゲットで Capacitor がシステムブラウザを開く
      // OAuth 完了後、monorepoapp:// ディープリンク経由でトークンがアプリに渡される
      const url = `${getBaseUrl()}/api/auth/mobile/google`;
      window.open(url, "_system");
    } else {
      // Web: 従来の cookie ベース OAuth フロー
      const base = window.location.origin;
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${base}/tasks`,
      });
    }
  }, []);

  const signOut = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      await removeToken();
      setAuthToken(null);
      try {
        await Browser.close();
      } catch {
        // ブラウザが開いていない場合は無視
      }
    }
    await authClient.signOut();
    // フルリロードで AppContent が未認証状態を検知しログイン画面を表示する
    window.location.reload();
  }, []);

  return {
    session,
    isPending,
    signInWithGoogle,
    signOut,
  };
}
