import { App as CapacitorApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import {
  IonApp,
  IonContent,
  IonIcon,
  IonPage,
  IonRouterOutlet,
  IonSpinner,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { setAuthToken } from "@repo/spec/fetcher";
import { checkboxOutline, settings } from "ionicons/icons";
import { useEffect } from "react";
import { Route, useHistory, useLocation } from "react-router-dom";

import { useAuthSession } from "@/hooks/use-auth-session";
import { saveToken } from "./lib/token-storage";
import LoginPage from "./pages/Login";
import SettingsPage from "./pages/Settings";
import TasksPage from "./pages/Tasks";

// ディープリンク（monorepoapp://auth/callback?token=xxx）を監視して
// OAuth 完了後にトークンを保存しアプリ内ナビゲーションを行う
function DeepLinkHandler() {
  const history = useHistory();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listenerHandle: { remove: () => Promise<void> } | null = null;

    CapacitorApp.addListener("appUrlOpen", async (event) => {
      try {
        const url = new URL(event.url);
        if (url.host === "auth" && url.pathname === "/callback") {
          const token = url.searchParams.get("token");
          if (token) {
            await saveToken(token);
            setAuthToken(token);
            try {
              await Browser.close();
            } catch {
              // ブラウザが既に閉じている場合は無視
            }
            // フルリロードで React の状態とセッションキャッシュをリセット
            window.location.href = "/tasks";
          }
        }
      } catch {
        history.replace("/");
      }
    }).then((handle) => {
      listenerHandle = handle;
    });

    return () => {
      listenerHandle?.remove();
    };
  }, [history]);

  return null;
}

const TAB_PATHS = ["/tasks", "/settings"];

/**
 * 認証状態に応じて表示するコンテンツを切り替える。
 * Route の重複マッチによる競合を避けるため、ルーティングではなく
 * 認証状態を直接見て表示内容を決定する。
 */
function AppContent() {
  const { session, isPending } = useAuthSession();
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    // 認証済みでタブパス以外にいる場合は /tasks へ遷移
    // キャッチオールリダイレクトによる TasksPage の二重マウントを防ぎ、
    // React Query のリクエストキャンセルを回避する
    if (!isPending && session?.user && !TAB_PATHS.includes(location.pathname)) {
      history.replace("/tasks");
    }
  }, [isPending, session, history, location.pathname]);

  // セッション確認中はスピナー
  if (isPending) {
    return (
      <IonPage>
        <IonContent>
          <div className="flex h-full items-center justify-center">
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // 未認証: ログインページのみ表示（ルーティングの競合なし）
  if (!session?.user) {
    return (
      <IonRouterOutlet>
        <Route component={LoginPage} />
      </IonRouterOutlet>
    );
  }

  // 認証済み: タブナビゲーション（キャッチオールリダイレクトなし）
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/tasks" component={TasksPage} />
        <Route exact path="/settings" component={SettingsPage} />
      </IonRouterOutlet>
      <IonTabBar
        slot="bottom"
        className="bg-white dark:bg-secondary-900 border-t border-secondary-200 dark:border-secondary-700"
      >
        <IonTabButton
          tab="tasks"
          href="/tasks"
          className="text-secondary-500 dark:text-secondary-400 [&.tab-selected]:text-primary-600 dark:[&.tab-selected]:text-primary-400"
        >
          <IonIcon icon={checkboxOutline} />
        </IonTabButton>
        <IonTabButton
          tab="settings"
          href="/settings"
          className="text-secondary-500 dark:text-secondary-400 [&.tab-selected]:text-primary-600 dark:[&.tab-selected]:text-primary-400"
        >
          <IonIcon icon={settings} />
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
}

function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <DeepLinkHandler />
        <AppContent />
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
