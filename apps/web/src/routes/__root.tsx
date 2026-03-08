import { authClient } from "@/lib/auth-client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui";
import { Link, Outlet, createRootRoute, useRouterState } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { data: session } = authClient.useSession();
  const routerState = useRouterState();
  const isLoginPage = routerState.location.pathname === "/login";

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 transition-colors duration-200">
      {!isLoginPage && (
        <header className="border-b border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 transition-colors duration-200">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <Link
                  to={"/" as any}
                  className="text-xl font-bold text-primary-600 dark:text-primary-400"
                >
                  モノレポアプリ
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                {session?.user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                        aria-label="ユーザーメニューを開く"
                      >
                        <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300 truncate max-w-[12rem] sm:max-w-[16rem]">
                          {session.user.name ?? session.user.email ?? "ユーザー"}
                        </span>
                        <Avatar
                          size="md"
                          className="ring-2 ring-secondary-200 dark:ring-secondary-700 shrink-0"
                        >
                          {session.user.image ? (
                            <AvatarImage src={session.user.image} alt={session.user.name ?? ""} />
                          ) : null}
                          {!session.user.image ? (
                            <AvatarFallback>
                              {(session.user.name ?? session.user.email ?? "?")
                                .slice(0, 1)
                                .toUpperCase()}
                            </AvatarFallback>
                          ) : null}
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100 truncate">
                          {session.user.name ?? "ユーザー"}
                        </p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
                          {session.user.email}
                        </p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="block">
                          設定
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>ログアウト</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    to="/login"
                    className="text-sm text-primary-600 hover:underline dark:text-primary-400"
                  >
                    ログイン
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>
      )}
      <main
        className={
          isLoginPage
            ? "flex min-h-screen items-center justify-center"
            : "w-full px-4 py-8 sm:px-6 lg:px-8"
        }
      >
        <Outlet />
      </main>
    </div>
  );
}
