import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen bg-noise" style={{ backgroundColor: "var(--color-cream)" }}>
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{ borderColor: "var(--color-border)", background: "rgba(250, 247, 242, 0.85)" }}
      >
        <div className="w-full max-w-2xl mx-auto px-5">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ background: "var(--color-charcoal)" }}
              >
                S
              </div>
              <span className="font-display text-xl italic tracking-tight" style={{ color: "var(--color-charcoal)" }}>
                Splitty
              </span>
            </Link>
          </div>
        </div>
      </header>
      <main className="w-full max-w-2xl mx-auto px-5 py-6 pb-24">
        <Outlet />
      </main>
    </div>
  );
}
