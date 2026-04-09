import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen" style={{ background: "var(--white)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: "var(--yellow)",
          borderBottom: "var(--border)",
        }}
      >
        <div className="w-full max-w-2xl mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div
                className="w-9 h-9 flex items-center justify-center font-display text-base"
                style={{
                  background: "var(--black)",
                  color: "var(--yellow)",
                  border: "2px solid var(--black)",
                }}
              >
                $
              </div>
              <span className="font-display text-lg tracking-tight">
                SPLITTY
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="w-full max-w-2xl mx-auto px-4 py-6 pb-24">
        <Outlet />
      </main>
    </div>
  );
}
