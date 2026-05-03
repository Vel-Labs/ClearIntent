import type { ReactNode } from "react";

export type ShellNavItem = {
  id: string;
  label: string;
  locked?: boolean;
};

type AppShellProps = {
  children: ReactNode;
  connected: boolean;
  navItems: ShellNavItem[];
  selectedNav: string;
  onSelectNav: (id: string) => void;
};

export function AppShell({
  children,
  connected,
  navItems,
  selectedNav,
  onSelectNav
}: AppShellProps) {
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="brand">
          <strong>ClearIntent</strong>
          <span>{connected ? "Wallet authority console" : "Project overview"}</span>
        </div>
        <nav className="nav-list" aria-label="Dashboard sections">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${selectedNav === item.id ? "active" : ""}`}
              disabled={item.locked}
              onClick={() => onSelectNav(item.id)}
              type="button"
            >
              <span>{item.label}</span>
              {item.locked ? <span className="nav-lock">Connect wallet</span> : null}
            </button>
          ))}
        </nav>
      </aside>
      <main className="main">
        {children}
      </main>
    </div>
  );
}
